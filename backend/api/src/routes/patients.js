import { Router } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';
import { encryptJson, decryptJson } from '../utils/encryption.js';

const router = Router();

// Facility admin registers patient in-person
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
  ethiopianHealthId: Joi.string().min(6).required(),
  dateOfBirth: Joi.string().isoDate().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  facilityId: Joi.string().uuid().required(),
  encryptedData: Joi.object().default({}),
});

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
        // Create user
        const u = await client.query(
          `
          INSERT INTO users (email, phone, password_hash, full_name, role, facility_id, created_by, two_factor_enabled)
          VALUES ($1, $2, $3, $4, 'patient', $5, $6, true)
          RETURNING id, email, phone, full_name, role
        `,
          [body.email, body.phone, passwordHash, body.fullName, body.facilityId, req.user.id],
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
            body.ethiopianHealthId,
            body.dateOfBirth || null,
            body.gender || null,
            encryptedBlob,
            body.facilityId,
            req.user.id,
          ],
        );

        return { user, patient: p.rows[0] };
      });

      // For real deployments: deliver temp password via secure channel.
      return res.status(201).json({
        ...result,
        tempPassword,
      });
    } catch (err) {
      return next(err);
    }
  },
);

router.get('/search', authRequired, requireRole('doctor'), async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json([]);

    const rows = await withRequestSession(req, async (client) => {
      // RLS will ensure doctor only sees consented patients.
      const r = await client.query(
        `
        SELECT p.id, p.ethiopian_health_id, p.created_at, u.full_name
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.ethiopian_health_id ILIKE $1 OR u.full_name ILIKE $1
        ORDER BY u.full_name ASC
        LIMIT 25
      `,
        [`%${q}%`],
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

