import bcrypt from 'bcrypt';
import { withMedilinkSession } from '../config/database.js';
import {
  getEmailStatus,
  sendAdminAccountCreatedEmail,
  sendFacilityAdminAccountCreatedEmail,
  sendDoctorAccountCreatedEmail,
  sendNurseAccountCreatedEmail,
  sendPatientRegistrationEmail,
} from '../services/emailService.js';
import { logAdminAction } from '../services/auditService.js';
import { logger } from '../utils/logger.js';
import { encryptPatientPayload } from '../services/encryptionService.js';

const JIMMA_CITY = 'Jimma City';

function mapCreateAdminError(err) {
  // Postgres unique violation
  if (err?.code === '23505') {
    const msg = String(err?.message || '');
    if (msg.includes('users_email_key')) {
      const e = new Error('Admin email already exists');
      e.status = 409;
      return e;
    }
    if (msg.includes('users_phone_key')) {
      const e = new Error('Admin phone number already exists');
      e.status = 409;
      return e;
    }
    const e = new Error('Duplicate admin account data');
    e.status = 409;
    return e;
  }

  return err;
}

export function getRealtimeEmailStatus(req, res) {
  return res.json(getEmailStatus());
}

function generateTemporaryPassword(length = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  let output = '';
  for (let i = 0; i < length; i += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

function getIpAddress(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || null;
}

async function getActorScope(client, actorId) {
  const actorResult = await client.query(
    'SELECT id, role, zone_id FROM users WHERE id = $1 AND role = $2 LIMIT 1',
    [actorId, 'zonal_admin'],
  );
  const actor = actorResult.rows[0];
  if (!actor) return null;
  return actor;
}

async function getWoredaOrCityActor(client, actorId) {
  const actorResult = await client.query(
    `
    SELECT id, role, zone_id, woreda_id, city
    FROM users
    WHERE id = $1
      AND role IN ('woreda_admin', 'city_admin')
    LIMIT 1
  `,
    [actorId],
  );
  return actorResult.rows[0] || null;
}

async function getFacilityActor(client, actorId) {
  const actorResult = await client.query(
    `
    SELECT id, role, facility_id
    FROM users
    WHERE id = $1
      AND role = 'facility_admin'
    LIMIT 1
  `,
    [actorId],
  );
  const actor = actorResult.rows[0] || null;
  if (!actor) return null;
  if (actor.facility_id) return actor;

  // Backward compatibility: some existing facility_admin users were created
  // before facility_id was reliably populated on users.
  const facilityLookup = await client.query(
    `
    SELECT id
    FROM facilities
    WHERE facility_admin_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `,
    [actorId],
  );
  if (facilityLookup.rows[0]?.id) {
    const resolvedFacilityId = facilityLookup.rows[0].id;
    await client.query('UPDATE users SET facility_id = $2 WHERE id = $1', [actorId, resolvedFacilityId]);
    return { ...actor, facility_id: resolvedFacilityId };
  }

  return actor;
}

function generateEthiopianHealthId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = () => chars[Math.floor(Math.random() * chars.length)];
  const suffix = `${rand()}${rand()}${Math.floor(100 + Math.random() * 900)}`;
  return `ETH-${yyyy}-${mm}${dd}-${suffix}`;
}

export async function createWoredaAdmin(req, res, next) {
  try {
    const emailStatus = getEmailStatus();
    if (!emailStatus.configured) {
      const err = new Error('Real-time email is not configured on server. Configure SMTP settings first.');
      err.status = 503;
      throw err;
    }

    const { woredaName, fullName, email, recoveryEmail, phoneNumber, officialTitle } = req.validatedBody;
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getActorScope(client, req.user.id);
      if (!actor?.zone_id) {
        const err = new Error('Only zonal admins can create woreda admins');
        err.status = 403;
        throw err;
      }

      const woredaResult = await client.query(
        'SELECT id, name FROM woredas WHERE zone_id = $1 AND lower(name) = lower($2) LIMIT 1',
        [actor.zone_id, woredaName],
      );
      const woreda = woredaResult.rows[0];
      if (!woreda) {
        const err = new Error('Woreda not found in your zone');
        err.status = 404;
        throw err;
      }

      const insertResult = await client.query(
        `
        INSERT INTO users (
          email,
          phone,
          password_hash,
          full_name,
          role,
          zone_id,
          woreda_id,
          created_by,
          must_change_password,
          is_active,
          recovery_email,
          official_title,
          two_factor_enabled
        )
        VALUES ($1,$2,$3,$4,'woreda_admin',$5,$6,$7,true,true,$8,$9,false)
        RETURNING id, email, full_name, role, created_at, is_active
      `,
        [
          email,
          phoneNumber,
          passwordHash,
          fullName,
          actor.zone_id,
          woreda.id,
          actor.id,
          recoveryEmail,
          officialTitle,
        ],
      );

      return {
        user: insertResult.rows[0],
        woredaName: woreda.name,
      };
    });

    try {
      await sendAdminAccountCreatedEmail({
        toEmail: email,
        adminName: fullName,
        roleLabel: 'Woreda Admin',
        areaName: created.woredaName,
        temporaryPassword: tempPassword,
        recoveryEmail,
      });
    } catch (err) {
      logger.warn('Failed to send woreda admin account email, rolling back user', {
        toEmail: email,
        error: err?.message || 'Email delivery failed',
      });
      await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        await client.query('DELETE FROM users WHERE id = $1', [created.user.id]);
      });
      const e = new Error('Failed to send email. User was not created. Check SMTP and try again.');
      e.status = 502;
      throw e;
    }

    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CREATE_WOREDA_ADMIN',
      details: {
        woreda_name: created.woredaName,
        admin_email: email,
        admin_name: fullName,
      },
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json({
      ...created.user,
      temporaryPassword: tempPassword,
      emailDelivered: true,
      emailError: null,
    });
  } catch (err) {
    return next(mapCreateAdminError(err));
  }
}

export async function createCityAdmin(req, res, next) {
  try {
    const emailStatus = getEmailStatus();
    if (!emailStatus.configured) {
      const err = new Error('Real-time email is not configured on server. Configure SMTP settings first.');
      err.status = 503;
      throw err;
    }

    const { fullName, email, recoveryEmail, phoneNumber, officialTitle } = req.validatedBody;
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getActorScope(client, req.user.id);
      if (!actor?.zone_id) {
        const err = new Error('Only zonal admins can create city admins');
        err.status = 403;
        throw err;
      }

      const jimmaWoreda = await client.query(
        'SELECT id FROM woredas WHERE zone_id = $1 AND lower(name) = lower($2) LIMIT 1',
        [actor.zone_id, 'Jimma'],
      );
      const jimmaWoredaId = jimmaWoreda.rows[0]?.id || null;

      const insertResult = await client.query(
        `
        INSERT INTO users (
          email,
          phone,
          password_hash,
          full_name,
          role,
          zone_id,
          woreda_id,
          created_by,
          must_change_password,
          is_active,
          recovery_email,
          official_title,
          city,
          two_factor_enabled
        )
        VALUES ($1,$2,$3,$4,'city_admin',$5,$6,$7,true,true,$8,$9,$10,false)
        RETURNING id, email, full_name, role, created_at, is_active
      `,
        [
          email,
          phoneNumber,
          passwordHash,
          fullName,
          actor.zone_id,
          jimmaWoredaId,
          actor.id,
          recoveryEmail,
          officialTitle,
          JIMMA_CITY,
        ],
      );

      return insertResult.rows[0];
    });

    try {
      await sendAdminAccountCreatedEmail({
        toEmail: email,
        adminName: fullName,
        roleLabel: 'City Admin',
        areaName: JIMMA_CITY,
        temporaryPassword: tempPassword,
        recoveryEmail,
      });
    } catch (err) {
      logger.warn('Failed to send city admin account email, rolling back user', {
        toEmail: email,
        error: err?.message || 'Email delivery failed',
      });
      await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        await client.query('DELETE FROM users WHERE id = $1', [created.id]);
      });
      const e = new Error('Failed to send email. User was not created. Check SMTP and try again.');
      e.status = 502;
      throw e;
    }

    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CREATE_CITY_ADMIN',
      details: {
        city_name: JIMMA_CITY,
        admin_email: email,
        admin_name: fullName,
      },
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json({
      ...created,
      temporaryPassword: tempPassword,
      emailDelivered: true,
      emailError: null,
    });
  } catch (err) {
    return next(mapCreateAdminError(err));
  }
}

export async function createFacilityAdmin(req, res, next) {
  try {
    const emailStatus = getEmailStatus();
    if (!emailStatus.configured) {
      const err = new Error('Real-time email is not configured on server. Configure SMTP settings first.');
      err.status = 503;
      throw err;
    }

    const {
      facilityName,
      facilityType,
      licenseNumber,
      licenseDocument,
      facilityAddress,
      facilityPhone,
      facilityEmail,
      adminFullName,
      adminEmail,
      recoveryEmail,
      adminPhone,
      officialTitle,
    } = req.validatedBody;

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getWoredaOrCityActor(client, req.user.id);
      if (!actor) {
        const err = new Error('Only woreda admin or city admin can create facility admins');
        err.status = 403;
        throw err;
      }

      const userInsert = await client.query(
        `
        INSERT INTO users (
          email, phone, password_hash, full_name, role,
          zone_id, woreda_id, created_by, must_change_password,
          is_active, recovery_email, official_title, two_factor_enabled
        )
        VALUES ($1,$2,$3,$4,'facility_admin',$5,$6,$7,true,true,$8,$9,false)
        RETURNING id, email, full_name, created_at, is_active
      `,
        [
          adminEmail,
          adminPhone,
          passwordHash,
          adminFullName,
          actor.zone_id,
          actor.woreda_id,
          actor.id,
          recoveryEmail,
          officialTitle,
        ],
      );
      const newUser = userInsert.rows[0];

      const facilityInsert = await client.query(
        `
        INSERT INTO facilities (
          name, name_am, type, type_am, license_number, license_document,
          woreda_id, facility_admin_id, contact_phone, contact_email, address,
          created_by, city
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING id, name, type, license_number, created_by, city, created_at
      `,
        [
          facilityName,
          facilityName,
          facilityType,
          facilityType,
          licenseNumber,
          licenseDocument || null,
          actor.woreda_id,
          newUser.id,
          facilityPhone,
          facilityEmail,
          facilityAddress,
          actor.id,
          actor.role === 'city_admin' ? actor.city || JIMMA_CITY : null,
        ],
      );

      return {
        user: newUser,
        facility: facilityInsert.rows[0],
        actor,
      };
    });

    try {
      await sendFacilityAdminAccountCreatedEmail({
        toEmail: adminEmail,
        adminName: adminFullName,
        facilityName,
        temporaryPassword,
        recoveryEmail,
        areaName: created.actor.role === 'city_admin' ? JIMMA_CITY : 'Woreda',
      });
    } catch (err) {
      await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        await client.query('DELETE FROM facilities WHERE id = $1', [created.facility.id]);
        await client.query('DELETE FROM users WHERE id = $1', [created.user.id]);
      });
      const e = new Error('Failed to send email. Facility admin was not created. Check SMTP and try again.');
      e.status = 502;
      throw e;
    }

    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CREATE_FACILITY_ADMIN',
      details: {
        facility_name: facilityName,
        admin_email: adminEmail,
        admin_name: adminFullName,
      },
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json({
      facility: created.facility,
      admin: { ...created.user, role: 'facility_admin' },
      temporaryPassword,
      emailDelivered: true,
    });
  } catch (err) {
    return next(mapCreateAdminError(err));
  }
}

export async function registerFacility(req, res, next) {
  try {
    const {
      facilityName,
      facilityType,
      licenseNumber,
      licenseDocument,
      facilityAddress,
      facilityPhone,
      facilityEmail,
    } = req.validatedBody;

    const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getWoredaOrCityActor(client, req.user.id);
      if (!actor) {
        const err = new Error('Only woreda admin or city admin can register facilities');
        err.status = 403;
        throw err;
      }

      const insert = await client.query(
        `
        INSERT INTO facilities (
          name, name_am, type, type_am, license_number, license_document,
          woreda_id, contact_phone, contact_email, address, created_by, city
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING id, name, type, license_number, contact_phone, contact_email, address, city, created_at
      `,
        [
          facilityName,
          facilityName,
          facilityType,
          facilityType,
          licenseNumber,
          licenseDocument || null,
          actor.woreda_id,
          facilityPhone,
          facilityEmail,
          facilityAddress,
          actor.id,
          actor.role === 'city_admin' ? actor.city || JIMMA_CITY : null,
        ],
      );
      return insert.rows[0];
    });

    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'REGISTER_FACILITY',
      details: {
        facility_name: facilityName,
        facility_type: facilityType,
        license_number: licenseNumber,
      },
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json(created);
  } catch (err) {
    return next(mapCreateAdminError(err));
  }
}

export async function getFacilityAdmins(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getWoredaOrCityActor(client, req.user.id);
      if (!actor) return [];
      const result = await client.query(
        `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.phone,
          u.official_title,
          u.is_active,
          u.created_at,
          f.name AS facility_name,
          f.type AS facility_type
        FROM users u
        LEFT JOIN facilities f ON f.facility_admin_id = u.id
        WHERE u.role = 'facility_admin'
          AND u.woreda_id = $1
          AND ($2::text IS NULL OR f.city = $2 OR f.city IS NULL)
        ORDER BY u.created_at DESC
      `,
        [actor.woreda_id, actor.role === 'city_admin' ? actor.city || JIMMA_CITY : null],
      );
      return result.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function getFacilities(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getWoredaOrCityActor(client, req.user.id);
      if (!actor) return [];
      const result = await client.query(
        `
        SELECT
          id, name, type, license_number, contact_phone, contact_email, address, city, created_at,
          (SELECT full_name FROM users WHERE id = facilities.facility_admin_id) AS facility_admin_name
        FROM facilities
        WHERE woreda_id = $1
          AND ($2::text IS NULL OR city = $2 OR city IS NULL)
        ORDER BY created_at DESC
      `,
        [actor.woreda_id, actor.role === 'city_admin' ? actor.city || JIMMA_CITY : null],
      );
      return result.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

async function getLocalStatistics(req, role, cityFilter) {
  return withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
    const actor = await getWoredaOrCityActor(client, req.user.id);
    if (!actor || actor.role !== role) return { totalFacilities: 0, totalProfessionals: 0, totalPatients: 0 };

    const [facilities, professionals, patients] = await Promise.all([
      client.query(
        `
        SELECT count(*)::int AS count
        FROM facilities
        WHERE woreda_id = $1
          AND ($2::text IS NULL OR city = $2 OR city IS NULL)
      `,
        [actor.woreda_id, cityFilter],
      ),
      client.query(
        `
        SELECT count(*)::int AS count
        FROM users
        WHERE woreda_id = $1
          AND role IN ('doctor', 'nurse')
      `,
        [actor.woreda_id],
      ),
      client.query(
        `
        SELECT count(*)::int AS count
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE u.woreda_id = $1
      `,
        [actor.woreda_id],
      ),
    ]);

    return {
      totalFacilities: facilities.rows[0]?.count || 0,
      totalProfessionals: professionals.rows[0]?.count || 0,
      totalPatients: patients.rows[0]?.count || 0,
    };
  });
}

export async function getWoredaStatistics(req, res, next) {
  try {
    const stats = await getLocalStatistics(req, 'woreda_admin', null);
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
}

export async function getCityStatistics(req, res, next) {
  try {
    const stats = await getLocalStatistics(req, 'city_admin', JIMMA_CITY);
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
}

async function getLocalAudit(req, role) {
  return withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
    const actor = await getWoredaOrCityActor(client, req.user.id);
    if (!actor || actor.role !== role) return [];
    const result = await client.query(
      `
      SELECT ts, actor_id, actor_role, action, details, ip_address
      FROM audit_logs
      WHERE actor_id IN (
        SELECT id FROM users WHERE woreda_id = $1
      )
      ORDER BY ts DESC
      LIMIT 200
    `,
      [actor.woreda_id],
    );
    return result.rows;
  });
}

export async function getWoredaAudit(req, res, next) {
  try {
    const rows = await getLocalAudit(req, 'woreda_admin');
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function getCityAudit(req, res, next) {
  try {
    const rows = await getLocalAudit(req, 'city_admin');
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function createDoctor(req, res, next) {
  try {
    const emailStatus = getEmailStatus();
    if (!emailStatus.configured) {
      const err = new Error('Real-time email is not configured on server. Configure SMTP settings first.');
      err.status = 503;
      throw err;
    }
    const b = req.validatedBody;
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) {
        const e = new Error('Facility admin account is not linked to any facility. Ask Woreda/City admin to assign a facility.');
        e.status = 403;
        throw e;
      }
      const facilityRow = await client.query('SELECT name FROM facilities WHERE id = $1 LIMIT 1', [actor.facility_id]);
      const facilityName = facilityRow.rows[0]?.name || 'Facility';
      const inserted = await client.query(
        `
        INSERT INTO users (
          email, phone, password_hash, full_name, role, professional_type,
          license_number, license_document, specialization, department, years_experience,
          facility_id, created_by, must_change_password, is_active, recovery_email, official_title, two_factor_enabled
        )
        VALUES ($1,$2,$3,$4,'doctor','doctor',$5,$6,$7,$8,$9,$10,$11,true,true,$12,$13,false)
        RETURNING id, email, full_name, created_at
      `,
        [
          b.email,
          b.phoneNumber,
          passwordHash,
          b.fullName,
          b.licenseNumber,
          b.licenseDocument || null,
          b.specialization,
          b.department,
          b.yearsExperience,
          actor.facility_id,
          actor.id,
          b.recoveryEmail,
          b.officialTitle,
        ],
      );
      return { user: inserted.rows[0], facilityName };
    });

    await sendDoctorAccountCreatedEmail({
      toEmail: b.email,
      doctorName: b.fullName,
      facilityName: created.facilityName,
      temporaryPassword: tempPassword,
    });

    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CREATE_DOCTOR',
      details: { doctor_name: b.fullName, doctor_email: b.email, specialization: b.specialization },
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json({ ...created.user, temporaryPassword: tempPassword, emailDelivered: true });
  } catch (err) {
    return next(mapCreateAdminError(err));
  }
}

export async function createNurse(req, res, next) {
  try {
    const emailStatus = getEmailStatus();
    if (!emailStatus.configured) {
      const err = new Error('Real-time email is not configured on server. Configure SMTP settings first.');
      err.status = 503;
      throw err;
    }
    const b = req.validatedBody;
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) {
        const e = new Error('Facility admin account is not linked to any facility. Ask Woreda/City admin to assign a facility.');
        e.status = 403;
        throw e;
      }
      const facilityRow = await client.query('SELECT name FROM facilities WHERE id = $1 LIMIT 1', [actor.facility_id]);
      const facilityName = facilityRow.rows[0]?.name || 'Facility';
      const inserted = await client.query(
        `
        INSERT INTO users (
          email, phone, password_hash, full_name, role, professional_type,
          license_number, license_document, department, years_experience,
          facility_id, created_by, must_change_password, is_active, recovery_email, official_title, two_factor_enabled
        )
        VALUES ($1,$2,$3,$4,'nurse','nurse',$5,$6,$7,$8,$9,$10,true,true,$11,$12,false)
        RETURNING id, email, full_name, created_at
      `,
        [
          b.email,
          b.phoneNumber,
          passwordHash,
          b.fullName,
          b.licenseNumber,
          b.licenseDocument || null,
          b.department,
          b.yearsExperience,
          actor.facility_id,
          actor.id,
          b.recoveryEmail,
          b.officialTitle,
        ],
      );
      return { user: inserted.rows[0], facilityName };
    });

    await sendNurseAccountCreatedEmail({
      toEmail: b.email,
      nurseName: b.fullName,
      facilityName: created.facilityName,
      temporaryPassword: tempPassword,
    });

    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'CREATE_NURSE',
      details: { nurse_name: b.fullName, nurse_email: b.email, department: b.department },
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json({ ...created.user, temporaryPassword: tempPassword, emailDelivered: true });
  } catch (err) {
    return next(mapCreateAdminError(err));
  }
}

export async function checkPatientDuplicate(req, res, next) {
  try {
    const kebeleId = String(req.query.kebeleId || '').trim();
    const phone = String(req.query.phone || '').trim();
    const fullName = String(req.query.fullName || '').trim();
    const dateOfBirth = String(req.query.dateOfBirth || '').trim();
    if (!kebeleId && !phone && !(fullName && dateOfBirth)) {
      return res.status(400).json({ error: 'Provide kebeleId, phone, or fullName + dateOfBirth' });
    }

    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) return [];
      const result = await client.query(
        `
        SELECT
          p.id,
          p.ethiopian_health_id,
          u.full_name,
          u.phone
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.facility_id = $1
          AND (
            ($2::text <> '' AND p.kebele_id = $2)
            OR ($3::text <> '' AND u.phone = $3)
            OR ($4::text <> '' AND $5::date IS NOT NULL AND lower(u.full_name) = lower($4) AND p.date_of_birth = $5::date)
          )
        LIMIT 20
      `,
        [actor.facility_id, kebeleId, phone, fullName, dateOfBirth || null],
      );
      return result.rows;
    });
    return res.json({ duplicates: rows, found: rows.length > 0 });
  } catch (err) {
    return next(err);
  }
}

export async function registerPatientByFacilityAdmin(req, res, next) {
  try {
    const emailStatus = getEmailStatus();
    if (!emailStatus.configured) {
      const err = new Error('Real-time email is not configured on server. Configure SMTP settings first.');
      err.status = 503;
      throw err;
    }
    const b = req.validatedBody;
    const tempPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    let createdUserId = null;
    let createdPatientId = null;

    const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) {
        const e = new Error('Only facility admin can register patients');
        e.status = 403;
        throw e;
      }

      const dup = await client.query(
        `
        SELECT p.id, p.ethiopian_health_id
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.facility_id = $1
          AND (p.kebele_id = $2 OR u.phone = $3)
        LIMIT 1
      `,
        [actor.facility_id, b.kebeleIdNumber, b.phoneNumber],
      );
      if (dup.rows[0]) {
        const e = new Error(`Patient already exists with Ethiopian Health ID: ${dup.rows[0].ethiopian_health_id}`);
        e.status = 409;
        throw e;
      }

      let healthId = '';
      for (let i = 0; i < 5; i += 1) {
        const candidate = generateEthiopianHealthId();
        const exists = await client.query('SELECT 1 FROM patients WHERE ethiopian_health_id = $1 LIMIT 1', [candidate]);
        if (!exists.rows[0]) {
          healthId = candidate;
          break;
        }
      }
      if (!healthId) {
        const e = new Error('Failed to generate Ethiopian Health ID');
        e.status = 500;
        throw e;
      }

      const userInsert = await client.query(
        `
        INSERT INTO users (
          email, phone, password_hash, full_name, role,
          facility_id, created_by, must_change_password, is_active, recovery_email, two_factor_enabled
        )
        VALUES ($1,$2,$3,$4,'patient',$5,$6,true,true,$7,false)
        RETURNING id, email, full_name, created_at
      `,
        [b.email, b.phoneNumber || null, passwordHash, b.fullName, actor.facility_id, actor.id, b.recoveryEmail || null],
      );
      createdUserId = userInsert.rows[0].id;

      const encryptedData = encryptPatientPayload({
        emergency_contact_name: b.emergencyContactName,
        emergency_contact_phone: b.emergencyContactPhone,
        emergency_contact_relation: b.emergencyContactRelation,
        address: { region: 'Oromia', zone: 'Jimma', woreda: b.woreda, kebele: b.kebele },
        id_document_upload: b.idDocumentUpload || null,
      });

      const patientInsert = await client.query(
        `
        INSERT INTO patients (
          user_id, ethiopian_health_id, date_of_birth, gender, kebele_id,
          encrypted_data, region, zone, woreda, kebele, registered_by, facility_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,'Oromia','Jimma',$7,$8,$9,$10)
        RETURNING id, ethiopian_health_id, created_at
      `,
        [
          userInsert.rows[0].id,
          healthId,
          b.dateOfBirth,
          b.gender,
          b.kebeleIdNumber,
          encryptedData,
          b.woreda,
          b.kebele,
          actor.id,
          actor.facility_id,
        ],
      );
      createdPatientId = patientInsert.rows[0].id;

      const facility = await client.query('SELECT name FROM facilities WHERE id = $1 LIMIT 1', [actor.facility_id]);

      return {
        user: userInsert.rows[0],
        patient: patientInsert.rows[0],
        facilityName: facility.rows[0]?.name || 'Facility',
      };
    });

    try {
      await sendPatientRegistrationEmail({
        toEmail: b.email,
        patientName: b.fullName,
        facilityName: created.facilityName,
        ethiopianHealthId: created.patient.ethiopian_health_id,
        temporaryPassword: tempPassword,
      });
    } catch (emailErr) {
      // Email-only requirement: if email fails, registration must fail and rollback created records.
      await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        if (createdPatientId) {
          await client.query('DELETE FROM patients WHERE id = $1', [createdPatientId]);
        }
        if (createdUserId) {
          await client.query('DELETE FROM users WHERE id = $1', [createdUserId]);
        }
      });
      throw emailErr;
    }

    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'REGISTER_PATIENT',
      details: {
        patient_name: b.fullName,
        ethiopian_health_id: created.patient.ethiopian_health_id,
        facility_name: created.facilityName,
      },
      ipAddress: getIpAddress(req),
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json({
      patientId: created.patient.id,
      ethiopianHealthId: created.patient.ethiopian_health_id,
      patientName: b.fullName,
      temporaryPassword: tempPassword,
      emailSent: true,
      smsSent: false,
    });
  } catch (err) {
    return next(mapCreateAdminError(err));
  }
}

export async function getDoctors(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) return [];
      const result = await client.query(
        `
        SELECT id, full_name, email, license_number, specialization, department, years_experience, created_at, is_active
        FROM users
        WHERE role = 'doctor' AND facility_id = $1
        ORDER BY created_at DESC
      `,
        [actor.facility_id],
      );
      return result.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function getNurses(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) return [];
      const result = await client.query(
        `
        SELECT id, full_name, email, license_number, department, years_experience, created_at, is_active
        FROM users
        WHERE role = 'nurse' AND facility_id = $1
        ORDER BY created_at DESC
      `,
        [actor.facility_id],
      );
      return result.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function getPatientsBasic(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) return [];
      const result = await client.query(
        `
        SELECT p.id, p.ethiopian_health_id, p.gender, p.date_of_birth, p.created_at, u.full_name, u.phone, u.email
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.facility_id = $1
        ORDER BY p.created_at DESC
      `,
        [actor.facility_id],
      );
      return result.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function getFacilityStatistics(req, res, next) {
  try {
    const stats = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) return { totalDoctors: 0, totalNurses: 0, totalPatients: 0, todaysVisits: 0 };
      const [doctors, nurses, patients, visits] = await Promise.all([
        client.query(`SELECT count(*)::int AS count FROM users WHERE role = 'doctor' AND facility_id = $1`, [actor.facility_id]),
        client.query(`SELECT count(*)::int AS count FROM users WHERE role = 'nurse' AND facility_id = $1`, [actor.facility_id]),
        client.query(`SELECT count(*)::int AS count FROM patients WHERE facility_id = $1`, [actor.facility_id]),
        client.query(
          `
          SELECT count(*)::int AS count
          FROM appointments
          WHERE facility_id = $1
            AND appointment_date::date = CURRENT_DATE
        `,
          [actor.facility_id],
        ),
      ]);
      return {
        totalDoctors: doctors.rows[0]?.count || 0,
        totalNurses: nurses.rows[0]?.count || 0,
        totalPatients: patients.rows[0]?.count || 0,
        todaysVisits: visits.rows[0]?.count || 0,
      };
    });
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
}

export async function getFacilityAudit(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getFacilityActor(client, req.user.id);
      if (!actor?.facility_id) return [];
      const result = await client.query(
        `
        SELECT ts, actor_id, actor_role, action, details, ip_address
        FROM audit_logs
        WHERE actor_id IN (
          SELECT id FROM users WHERE facility_id = $1
        )
        ORDER BY ts DESC
        LIMIT 200
      `,
        [actor.facility_id],
      );
      return result.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function listWoredaAdmins(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getActorScope(client, req.user.id);
      if (!actor?.zone_id) return [];
      const result = await client.query(
        `
        SELECT
          u.id,
          u.full_name,
          u.email,
          u.phone,
          u.official_title,
          u.is_active,
          u.created_at,
          w.name AS woreda_name
        FROM users u
        JOIN woredas w ON w.id = u.woreda_id
        WHERE u.role = 'woreda_admin'
          AND u.zone_id = $1
        ORDER BY u.created_at DESC
      `,
        [actor.zone_id],
      );
      return result.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function getCityAdmin(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getActorScope(client, req.user.id);
      if (!actor?.zone_id) return [];
      const result = await client.query(
        `
        SELECT
          id,
          full_name,
          email,
          phone,
          official_title,
          is_active,
          created_at,
          city
        FROM users
        WHERE role = 'city_admin'
          AND zone_id = $1
        ORDER BY created_at DESC
      `,
        [actor.zone_id],
      );
      return result.rows;
    });

    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

export async function getZoneStatistics(req, res, next) {
  try {
    const stats = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getActorScope(client, req.user.id);
      if (!actor?.zone_id) {
        return {
          totalWoredas: 10,
          totalFacilities: 0,
          totalProfessionals: 0,
          totalPatients: 0,
        };
      }

      const [woredas, facilities, professionals, patients] = await Promise.all([
        client.query('SELECT count(*)::int AS count FROM woredas WHERE zone_id = $1', [actor.zone_id]),
        client.query(
          `
          SELECT count(*)::int AS count
          FROM facilities f
          JOIN woredas w ON w.id = f.woreda_id
          WHERE w.zone_id = $1
        `,
          [actor.zone_id],
        ),
        client.query(
          `
          SELECT count(*)::int AS count
          FROM users
          WHERE zone_id = $1
            AND role IN ('doctor', 'nurse')
        `,
          [actor.zone_id],
        ),
        client.query(
          `
          SELECT count(*)::int AS count
          FROM patients p
          JOIN users u ON u.id = p.user_id
          WHERE u.zone_id = $1
        `,
          [actor.zone_id],
        ),
      ]);

      return {
        totalWoredas: woredas.rows[0]?.count || 10,
        totalFacilities: facilities.rows[0]?.count || 0,
        totalProfessionals: professionals.rows[0]?.count || 0,
        totalPatients: patients.rows[0]?.count || 0,
      };
    });
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
}

export async function getZoneAuditLogs(req, res, next) {
  try {
    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      const actor = await getActorScope(client, req.user.id);
      if (!actor?.zone_id) return [];
      const result = await client.query(
        `
        SELECT
          ts,
          actor_id,
          actor_role,
          action,
          details,
          ip_address
        FROM audit_logs
        WHERE actor_id IN (
          SELECT id FROM users WHERE zone_id = $1
        )
        ORDER BY ts DESC
        LIMIT 200
      `,
        [actor.zone_id],
      );
      return result.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}
