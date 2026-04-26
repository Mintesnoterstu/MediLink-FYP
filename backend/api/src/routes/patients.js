import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';
import { encryptJson, decryptJson } from '../utils/encryption.js';
import { sendCredentialsSms } from '../services/smsService.js';
import { withMedilinkSession } from '../config/database.js';
import { query } from '../config/database.js';

const router = Router();

// Facility admin registers patient in-person
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
  ethiopianHealthId: Joi.string().min(6).optional(),
  dateOfBirth: Joi.string().isoDate().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  facilityId: Joi.string().uuid().optional(),
  encryptedData: Joi.object().default({}),
});

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

router.post(
  '/register',
  authRequired,
  requireRole('facility_admin'),
  validateBody(registerSchema),
  async (req, res, next) => {
    try {
      const body = req.validatedBody;
      const tempPassword = uuidv4().slice(0, 12);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const encryptedBlob = encryptJson(body.encryptedData || {});

      const result = await withRequestSession(req, async (client) => {
        let effectiveFacilityId = body.facilityId || null;
        if (!effectiveFacilityId) {
          const adminRow = await client.query(
            'SELECT facility_id FROM users WHERE id = $1 LIMIT 1',
            [req.user.id],
          );
          effectiveFacilityId = adminRow.rows[0]?.facility_id || null;
        }
        if (!effectiveFacilityId) {
          throw new Error('facilityId is required for patient registration');
        }

        let ethiopianHealthId = body.ethiopianHealthId || '';
        if (!ethiopianHealthId) {
          for (let i = 0; i < 5; i += 1) {
            const candidate = generateEthiopianHealthId();
            const exists = await client.query(
              'SELECT 1 FROM patients WHERE ethiopian_health_id = $1 LIMIT 1',
              [candidate],
            );
            if (!exists.rows[0]) {
              ethiopianHealthId = candidate;
              break;
            }
          }
        }
        if (!ethiopianHealthId) {
          throw new Error('Failed to generate Ethiopian Health ID');
        }
        // Create user
        const u = await client.query(
          `
          INSERT INTO users (email, phone, password_hash, full_name, role, facility_id, created_by, two_factor_enabled)
          VALUES ($1, $2, $3, $4, 'patient', $5, $6, true)
          RETURNING id, email, phone, full_name, role
        `,
          [body.email, body.phone, passwordHash, body.fullName, effectiveFacilityId, req.user.id],
        );

        const user = u.rows[0];

        const p = await client.query(
          `
          INSERT INTO patients (
            user_id, ethiopian_health_id, date_of_birth, gender, encrypted_data, facility_id, registered_by
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, user_id, ethiopian_health_id, facility_id, created_at
        `,
          [
            user.id,
            ethiopianHealthId,
            body.dateOfBirth || null,
            body.gender || null,
            encryptedBlob,
            effectiveFacilityId,
            req.user.id,
          ],
        );

        return { user, patient: p.rows[0], ethiopianHealthId };
      });

      await sendCredentialsSms(body.phone, {
        email: body.email,
        tempPassword,
        ethiopianHealthId: result.ethiopianHealthId,
      });

      return res.status(201).json({
        user: result.user,
        patient: result.patient,
        ethiopianHealthId: result.ethiopianHealthId,
        tempPassword,
      });
    } catch (err) {
      return next(err);
    }
  },
);

// Logged-in patient shortcut: maps user -> patient row
router.get('/me', authRequired, async (req, res, next) => {
  try {
    const payload = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT p.*, u.email, u.phone, u.full_name
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = $1
        LIMIT 1
      `,
        [req.user.id],
      );
      const patient = r.rows[0] || null;
      if (!patient) return null;
      const meds = await client.query(
        `
        SELECT id, name, dosage, frequency, start_date, end_date, reminder_enabled, notes
        FROM medications
        WHERE patient_id = $1
        ORDER BY created_at DESC
      `,
        [patient.id],
      );
      const vitals = await client.query(
        `
        SELECT recorded_at, blood_pressure, heart_rate, temperature, weight
        FROM vital_signs
        WHERE patient_id = $1
        ORDER BY recorded_at DESC
      `,
        [patient.id],
      );
      return { patient, meds: meds.rows, vitals: vitals.rows };
    });

    if (!payload) return res.status(404).json({ error: 'Patient not found' });
    const row = payload.patient;

    let decrypted = {};
    try {
      if (row.encrypted_data) decrypted = decryptJson(row.encrypted_data);
    } catch {
      decrypted = {};
    }

    return res.json({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      phone: row.phone,
      fullName: row.full_name,
      ethiopianHealthId: row.ethiopian_health_id,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      isEmergencyFlag: Boolean(row.is_emergency_flag),
      facilityId: row.facility_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      encryptedData: decrypted,
      age: row.date_of_birth
        ? Math.max(0, new Date().getFullYear() - new Date(row.date_of_birth).getFullYear())
        : null,
      medicalHistory: [],
      currentMedications: payload.meds.map((m) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        startDate: m.start_date,
        endDate: m.end_date,
        reminderEnabled: m.reminder_enabled,
        notes: m.notes,
      })),
      allergies: [],
      vitalSigns: payload.vitals.map((v) => ({
        date: v.recorded_at,
        bloodPressure: v.blood_pressure,
        heartRate: v.heart_rate,
        temperature: v.temperature ? Number(v.temperature) : null,
        weight: v.weight ? Number(v.weight) : null,
      })),
      emergencyContacts: [],
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/profile', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const r = await query(
      `
      SELECT p.id AS patient_id, p.ethiopian_health_id, p.date_of_birth, p.gender, p.region, p.zone, p.woreda, p.kebele,
             u.id AS user_id, u.full_name, u.email, u.phone, u.created_at
      FROM patients p
      JOIN users u ON u.id = p.user_id
      WHERE p.user_id = $1
      LIMIT 1
    `,
      [req.user.id],
    );
    const row = r.rows[0];
    if (!row) return res.status(404).json({ error: 'Patient profile not found' });
    return res.json({
      patientId: row.patient_id,
      userId: row.user_id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      ethiopianHealthId: row.ethiopian_health_id,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      region: row.region,
      zone: row.zone,
      woreda: row.woreda,
      kebele: row.kebele,
      createdAt: row.created_at,
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/records', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const rows = await query(
      `
      SELECT hr.id, hr.record_type, hr.record_date, hr.created_at, hr.status, hr.encrypted_data,
             u.full_name AS created_by_name,
             f.name AS facility_name
      FROM health_records hr
      JOIN users u ON u.id = hr.created_by
      LEFT JOIN facilities f ON f.id = hr.facility_id
      WHERE hr.patient_id IN (SELECT id FROM patients WHERE user_id = $1)
      ORDER BY hr.created_at DESC
      LIMIT 300
    `,
      [req.user.id],
    );
    const out = rows.rows.map((r) => {
      let decrypted = null;
      try {
        decrypted = decryptJson(r.encrypted_data);
      } catch {
        decrypted = null;
      }
      return {
        id: r.id,
        record_type: r.record_type,
        record_date: r.record_date,
        created_at: r.created_at,
        status: r.status,
        created_by_name: r.created_by_name,
        facility_name: r.facility_name,
        data: decrypted,
      };
    });
    return res.json(out);
  } catch (err) {
    return next(err);
  }
});

router.get('/medications', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const r = await query(
      `
      SELECT m.id, m.name, m.dosage, m.frequency, m.start_date, m.end_date, m.notes, m.created_at,
             u.full_name AS prescribed_by_name,
             f.name AS facility_name
      FROM medications m
      JOIN patients p ON p.id = m.patient_id
      LEFT JOIN users u ON u.id = m.created_by
      LEFT JOIN facilities f ON f.id = u.facility_id
      WHERE p.user_id = $1
      ORDER BY COALESCE(m.start_date, m.created_at::date) DESC, m.created_at DESC
      LIMIT 300
    `,
      [req.user.id],
    );
    return res.json(r.rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/appointments', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const r = await query(
      `
      SELECT a.id, a.appointment_date, a.status, a.reason, a.notes, a.created_at,
             u.full_name AS doctor_name,
             f.name AS facility_name
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      LEFT JOIN users u ON u.id = a.doctor_id
      LEFT JOIN facilities f ON f.id = a.facility_id
      WHERE p.user_id = $1
      ORDER BY a.appointment_date DESC
      LIMIT 300
    `,
      [req.user.id],
    );
    return res.json(r.rows);
  } catch (err) {
    return next(err);
  }
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
});

router.put('/change-password', authRequired, requireRole('patient'), validateBody(changePasswordSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;
    const userRes = await query('SELECT id, password_hash FROM users WHERE id = $1 LIMIT 1', [req.user.id]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });
    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $2, must_change_password = false WHERE id = $1', [req.user.id, newHash]);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

router.get('/audit', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const r = await query(
      `
      SELECT action AS action_type, actor_id, details, ts AS created_at
      FROM audit_logs
      WHERE details->>'patient_id' IN (
        SELECT id::text FROM patients WHERE user_id = $1
      )
      ORDER BY ts DESC
      LIMIT 100
    `,
      [req.user.id],
    );
    return res.json(r.rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/search', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json([]);

    const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
      // Search must include non-consented patients so doctors can request consent.
      // Limit data to non-clinical identity fields only.
      const r = await client.query(
        `
        SELECT
          p.id,
          p.ethiopian_health_id,
          p.created_at,
          u.full_name,
          EXISTS (
            SELECT 1
            FROM consents c
            WHERE c.patient_id = p.id
              AND c.doctor_id = $2
              AND c.status = 'active'
          ) AS has_active_consent
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.ethiopian_health_id ILIKE $1 OR u.full_name ILIKE $1
        ORDER BY u.full_name ASC
        LIMIT 25
      `,
        [`%${q}%`, req.user.id],
      );
      return r.rows;
    });

    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const payload = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT p.*, u.email, u.phone, u.full_name
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
        LIMIT 1
      `,
        [patientId],
      );
      const patient = r.rows[0] || null;
      if (!patient) return null;
      const meds = await client.query(
        `
        SELECT id, name, dosage, frequency, start_date, end_date, reminder_enabled, notes
        FROM medications
        WHERE patient_id = $1
        ORDER BY created_at DESC
      `,
        [patientId],
      );
      const vitals = await client.query(
        `
        SELECT recorded_at, blood_pressure, heart_rate, temperature, weight
        FROM vital_signs
        WHERE patient_id = $1
        ORDER BY recorded_at DESC
      `,
        [patientId],
      );
      return { patient, meds: meds.rows, vitals: vitals.rows };
    });

    if (!payload) return res.status(404).json({ error: 'Patient not found or access denied' });
    const row = payload.patient;

    let decrypted = {};
    try {
      if (row.encrypted_data) decrypted = decryptJson(row.encrypted_data);
    } catch {
      decrypted = {};
    }

    return res.json({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      phone: row.phone,
      fullName: row.full_name,
      ethiopianHealthId: row.ethiopian_health_id,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      facilityId: row.facility_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      encryptedData: decrypted,
      // Frontend PatientData compatibility fields
      age: row.date_of_birth
        ? Math.max(0, new Date().getFullYear() - new Date(row.date_of_birth).getFullYear())
        : null,
      medicalHistory: [],
      currentMedications: payload.meds.map((m) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        startDate: m.start_date,
        endDate: m.end_date,
        reminderEnabled: m.reminder_enabled,
        notes: m.notes,
      })),
      allergies: [],
      vitalSigns: payload.vitals.map((v) => ({
        date: v.recorded_at,
        bloodPressure: v.blood_pressure,
        heartRate: v.heart_rate,
        temperature: v.temperature ? Number(v.temperature) : null,
        weight: v.weight ? Number(v.weight) : null,
      })),
      emergencyContacts: [],
    });
  } catch (err) {
    return next(err);
  }
});

const updateSchema = Joi.object({
  encryptedData: Joi.object(),
  isEmergencyFlag: Joi.boolean(),
});

router.put('/:id', authRequired, validateBody(updateSchema), async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const body = req.validatedBody;

    const encryptedBlob = body.encryptedData ? encryptJson(body.encryptedData) : null;

    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE patients
        SET
          encrypted_data = COALESCE($2, encrypted_data),
          is_emergency_flag = COALESCE($3, is_emergency_flag),
          updated_at = now()
        WHERE id = $1
        RETURNING id
      `,
        [patientId, encryptedBlob, body.isEmergencyFlag ?? null],
      );
      return r.rows[0] || null;
    });

    if (!updated) return res.status(404).json({ error: 'Patient not found or access denied' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

// Frontend compatibility alias
router.patch('/:id', authRequired, validateBody(updateSchema), async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const body = req.validatedBody;
    const encryptedBlob = body.encryptedData ? encryptJson(body.encryptedData) : null;

    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE patients
        SET
          encrypted_data = COALESCE($2, encrypted_data),
          is_emergency_flag = COALESCE($3, is_emergency_flag),
          updated_at = now()
        WHERE id = $1
        RETURNING id
      `,
        [patientId, encryptedBlob, body.isEmergencyFlag ?? null],
      );
      return r.rows[0] || null;
    });

    if (!updated) return res.status(404).json({ error: 'Patient not found or access denied' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id/appointments', authRequired, async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT *
        FROM appointments
        WHERE patient_id = $1
        ORDER BY appointment_date DESC
      `,
        [patientId],
      );
      return r.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id/symptom-analyses', authRequired, async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT id, summary, risk_level, recommendations, created_at
        FROM symptom_analyses
        WHERE patient_id = $1
        ORDER BY created_at DESC
      `,
        [patientId],
      );
      return r.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id/ai-recommendations', authRequired, async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT id, title, content, priority, created_at
        FROM ai_recommendations
        WHERE patient_id = $1
        ORDER BY created_at DESC
      `,
        [patientId],
      );
      return r.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

export default router;

