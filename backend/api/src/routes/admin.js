import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';

import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { withMedilinkSession } from '../config/database.js';

const router = Router();

const ADMIN_CHILD_ROLE = {
  zonal_admin: 'woreda_admin',
  woreda_admin: 'facility_admin',
  facility_admin: null,
};

function assertAllowedAdminCreation(actorRole, targetRole) {
  const allowed = ADMIN_CHILD_ROLE[actorRole] || null;
  return allowed === targetRole;
}

// Create sub-admin (next level down). Enforced in API layer (admins still cannot access patient data due to RLS).
const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).optional(),
  fullName: Joi.string().min(2).required(),
  role: Joi.string()
    .valid('woreda_admin', 'facility_admin')
    .required(),
  zoneId: Joi.string().uuid().optional(),
  woredaId: Joi.string().uuid().optional(),
  facilityId: Joi.string().uuid().optional(),
  password: Joi.string().min(6).required(),
});

router.post(
  '/users',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'city_admin', 'facility_admin'),
  validateBody(createUserSchema),
  async (req, res, next) => {
    try {
      const b = req.validatedBody;
      if (!assertAllowedAdminCreation(req.user.role, b.role)) {
        return res.status(403).json({ error: 'You can only create next-level admins' });
      }
      const hash = await bcrypt.hash(b.password, 10);
      const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const actorRow = await client.query(
          'SELECT zone_id, woreda_id, facility_id FROM users WHERE id = $1 LIMIT 1',
          [req.user.id],
        );
        const actor = actorRow.rows[0] || {};
        const zoneId = b.zoneId || actor.zone_id || null;
        const woredaId = b.woredaId || actor.woreda_id || null;
        const facilityId = b.facilityId || actor.facility_id || null;
        const r = await client.query(
          `
          INSERT INTO users (email, phone, password_hash, full_name, role, zone_id, woreda_id, facility_id, created_by, two_factor_enabled)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
          RETURNING id, email, full_name, role
        `,
          [b.email, b.phone || null, hash, b.fullName, b.role, zoneId, woredaId, facilityId, req.user.id],
        );
        return r.rows[0];
      });
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/users',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'facility_admin'),
  async (req, res, next) => {
    try {
      const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const r = await client.query(
          `
          SELECT id, email, phone, full_name, role, is_active, created_at
          FROM users
          WHERE role IN ('zonal_admin','woreda_admin','facility_admin')
          ORDER BY created_at DESC
          LIMIT 200
        `,
        );
        return r.rows;
      });
      return res.json(rows);
    } catch (err) {
      return next(err);
    }
  },
);

router.put(
  '/users/:id/suspend',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'facility_admin'),
  async (req, res, next) => {
    try {
      const userId = req.params.id;
      await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        await client.query('UPDATE users SET is_active = false WHERE id = $1', [userId]);
      });
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

// Facility registration (woreda/city admin)
const facilitySchema = Joi.object({
  name: Joi.string().required(),
  nameAm: Joi.string().required(),
  type: Joi.string().required(),
  typeAm: Joi.string().required(),
  woredaId: Joi.string().uuid().required(),
  licenseNumber: Joi.string().optional(),
});

router.post(
  '/facilities',
  authRequired,
  requireRole('woreda_admin', 'zonal_admin'),
  validateBody(facilitySchema),
  async (req, res, next) => {
    try {
      const b = req.validatedBody;
      const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const r = await client.query(
          `
          INSERT INTO facilities (name, name_am, type, type_am, woreda_id, license_number)
          VALUES ($1,$2,$3,$4,$5,$6)
          RETURNING *
        `,
          [b.name, b.nameAm, b.type, b.typeAm, b.woredaId, b.licenseNumber || null],
        );
        return r.rows[0];
      });
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

// Create doctor/nurse (facility admin)
const professionalSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).optional(),
  fullName: Joi.string().min(2).required(),
  role: Joi.string().valid('doctor', 'nurse').required(),
  facilityId: Joi.string().uuid().required(),
  licenseNumber: Joi.string().required(),
  specialization: Joi.string().allow('').optional(),
  password: Joi.string().min(6).required(),
});

router.post(
  '/professionals',
  authRequired,
  requireRole('facility_admin'),
  validateBody(professionalSchema),
  async (req, res, next) => {
    try {
      const b = req.validatedBody;
      const hash = await bcrypt.hash(b.password, 10);
      const created = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const actorRow = await client.query('SELECT facility_id FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
        const actorFacilityId = actorRow.rows[0]?.facility_id || null;
        const facilityId = actorFacilityId || b.facilityId;
        if (!facilityId) {
          throw new Error('facilityId is required');
        }
        if (actorFacilityId && b.facilityId && b.facilityId !== actorFacilityId) {
          throw new Error('Facility admin can only create professionals in their facility');
        }
        const r = await client.query(
          `
          INSERT INTO users (
            email, phone, password_hash, full_name, role, facility_id,
            license_number, specialization, created_by, two_factor_enabled
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
          RETURNING id, email, full_name, role, facility_id
        `,
          [b.email, b.phone || null, hash, b.fullName, b.role, facilityId, b.licenseNumber, b.specialization || null, req.user.id],
        );
        return r.rows[0];
      });
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/statistics',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'facility_admin'),
  async (req, res, next) => {
    try {
      const stats = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const users = await client.query('SELECT role, count(*)::int AS count FROM users GROUP BY role');
        const facilities = await client.query('SELECT count(*)::int AS count FROM facilities');
        return { users: users.rows, facilities: facilities.rows[0]?.count || 0 };
      });
      return res.json(stats);
    } catch (err) {
      return next(err);
    }
  },
);

router.get(
  '/audit',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'facility_admin'),
  async (req, res, next) => {
    try {
      // metadata only
      const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const r = await client.query(
          `
          SELECT ts, actor_role, action, resource_type, details, ip_address
          FROM audit_logs
          ORDER BY ts DESC
          LIMIT 200
        `,
        );
        return r.rows;
      });
      return res.json(rows);
    } catch (err) {
      return next(err);
    }
  },
);

export default router;

