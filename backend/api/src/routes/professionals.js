import { Router } from 'express';
import Joi from 'joi';

import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';
import { encryptJson } from '../utils/encryption.js';
import { logAdminAction } from '../services/auditService.js';
import { sendAutoRevokeEmailToPatient, sendConsentRequestEmailToPatient } from '../services/emailService.js';

const router = Router();

router.get('/patients/search', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json([]);
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT
          p.id,
          p.ethiopian_health_id,
          u.full_name,
          EXISTS (
            SELECT 1
            FROM consents c
            WHERE c.patient_id = p.id
              AND c.doctor_id = $2
              AND c.status = 'active'
              AND c.expires_at > now()
          ) AS has_active_consent
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.ethiopian_health_id ILIKE $1
           OR u.full_name ILIKE $1
           OR u.phone ILIKE $1
        ORDER BY u.full_name ASC
        LIMIT 200
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

const requestConsentSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  reason: Joi.string().allow('').optional(),
});

router.post('/consent/request', authRequired, requireRole('doctor', 'nurse'), validateBody(requestConsentSchema), async (req, res, next) => {
  try {
    const b = req.validatedBody;
    const created = await withRequestSession(req, async (client) => {
      const existing = await client.query(
        'SELECT id FROM consent_requests WHERE patient_id=$1 AND doctor_id=$2 AND status=$3 LIMIT 1',
        [b.patientId, req.user.id, 'pending'],
      );
      if (existing.rows[0]) {
        const err = new Error('A pending consent request already exists for this patient');
        err.status = 409;
        throw err;
      }
      const r = await client.query(
        `
          INSERT INTO consent_requests (patient_id, doctor_id, status, reason)
          VALUES ($1, $2, 'pending', $3)
          RETURNING *
        `,
        [b.patientId, req.user.id, b.reason || 'Follow-up treatment'],
      );
      const info = await client.query(
        `
        SELECT pu.full_name AS patient_name, pu.email AS patient_email,
               du.full_name AS doctor_name, f.name AS facility_name
        FROM patients p
        JOIN users pu ON pu.id = p.user_id
        JOIN users du ON du.id = $2
        LEFT JOIN facilities f ON f.id = du.facility_id
        WHERE p.id = $1
        LIMIT 1
      `,
        [b.patientId, req.user.id],
      );
      return { request: r.rows[0], info: info.rows[0] };
    });

    await sendConsentRequestEmailToPatient({
      toEmail: created.info?.patient_email || null,
      patientName: created.info?.patient_name || 'Patient',
      doctorName: created.info?.doctor_name || 'Doctor',
      facilityName: created.info?.facility_name || 'Facility',
      reason: b.reason || 'Follow-up treatment',
    });
    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'REQUEST_CONSENT',
      details: { patient_id: b.patientId, reason: b.reason || 'Follow-up treatment' },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json(created.request);
  } catch (err) {
    return next(err);
  }
});

router.post('/consents/request', authRequired, requireRole('doctor', 'nurse'), validateBody(requestConsentSchema), async (req, res, next) => {
  try {
    const b = req.validatedBody;
    const created = await withRequestSession(req, async (client) => {
      const existing = await client.query(
        'SELECT id FROM consent_requests WHERE patient_id=$1 AND doctor_id=$2 AND status=$3 LIMIT 1',
        [b.patientId, req.user.id, 'pending'],
      );
      if (existing.rows[0]) {
        const err = new Error('A pending consent request already exists for this patient');
        err.status = 409;
        throw err;
      }
      const r = await client.query(
        "INSERT INTO consent_requests (patient_id, doctor_id, status, reason) VALUES ($1, $2, 'pending', $3) RETURNING *",
        [b.patientId, req.user.id, b.reason || 'Follow-up treatment'],
      );
      const info = await client.query(
        `
        SELECT pu.full_name AS patient_name, pu.email AS patient_email,
               du.full_name AS doctor_name, f.name AS facility_name
        FROM patients p
        JOIN users pu ON pu.id = p.user_id
        JOIN users du ON du.id = $2
        LEFT JOIN facilities f ON f.id = du.facility_id
        WHERE p.id = $1
        LIMIT 1
      `,
        [b.patientId, req.user.id],
      );
      return { request: r.rows[0], info: info.rows[0] };
    });
    await sendConsentRequestEmailToPatient({
      toEmail: created.info?.patient_email || null,
      patientName: created.info?.patient_name || 'Patient',
      doctorName: created.info?.doctor_name || 'Doctor',
      facilityName: created.info?.facility_name || 'Facility',
      reason: b.reason || 'Follow-up treatment',
    });
    return res.status(201).json(created.request);
  } catch (err) {
    return next(err);
  }
});

router.get('/consents/pending', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT *
        FROM consent_requests
        WHERE doctor_id = $1 AND status = 'pending'
        ORDER BY requested_at DESC
      `,
        [req.user.id],
      );
      return r.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/patients', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT p.id, p.ethiopian_health_id, u.full_name, c.scope, c.expires_at
        FROM consents c
        JOIN patients p ON p.id = c.patient_id
        JOIN users u ON u.id = p.user_id
        WHERE c.doctor_id = $1 AND c.status = 'active' AND c.expires_at > now()
        ORDER BY c.granted_at DESC
      `,
        [req.user.id],
      );
      return r.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/patient/:id', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const row = await withRequestSession(req, async (client) => {
      const consent = await client.query(
        `
        SELECT scope FROM consents
        WHERE patient_id = $1 AND doctor_id = $2 AND status = 'active' AND expires_at > now()
        LIMIT 1
      `,
        [req.params.id, req.user.id],
      );
      if (!consent.rows[0]) return null;
      const p = await client.query(
        `
        SELECT p.id, p.ethiopian_health_id, p.date_of_birth, p.gender, u.full_name
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
        LIMIT 1
      `,
        [req.params.id],
      );
      return { patient: p.rows[0], scope: consent.rows[0].scope };
    });
    if (!row?.patient) return res.status(403).json({ error: 'No active consent for this patient' });
    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'VIEW_PATIENT',
      details: { patient_id: req.params.id },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });
    return res.json(row);
  } catch (err) {
    return next(err);
  }
});

router.get('/approvals/pending', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT hr.id, hr.patient_id, hr.record_type, hr.created_at, hr.status,
               p.ethiopian_health_id, u.full_name AS patient_name
        FROM health_records hr
        JOIN patients p ON p.id = hr.patient_id
        JOIN users u ON u.id = p.user_id
        WHERE hr.created_by = $1
          AND hr.status = 'pending'
        ORDER BY hr.created_at DESC
        LIMIT 100
      `,
        [req.user.id],
      );
      return r.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

const createRecordSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  recordType: Joi.string().min(2).required(),
  recordDate: Joi.string().isoDate().optional(),
  encryptedData: Joi.object().required(),
});

router.post('/records', authRequired, requireRole('doctor', 'nurse'), validateBody(createRecordSchema), async (req, res, next) => {
  try {
    const b = req.validatedBody;
    const blob = encryptJson(b.encryptedData);
    const created = await withRequestSession(req, async (client) => {
      const consent = await client.query(
        'SELECT id FROM consents WHERE patient_id=$1 AND doctor_id=$2 AND status=$3 AND expires_at>now() LIMIT 1',
        [b.patientId, req.user.id, 'active'],
      );
      if (!consent.rows[0]) {
        const err = new Error('No active consent for this patient');
        err.status = 403;
        throw err;
      }

      const r = await client.query(
        `
          INSERT INTO health_records (patient_id, record_type, encrypted_data, created_by, record_date, facility_id, status)
          VALUES ($1, $2, $3, $4, $5, (SELECT facility_id FROM users WHERE id = $4), 'pending')
          RETURNING id, patient_id, record_type, record_date, created_at, status
        `,
        [b.patientId, b.recordType, blob, req.user.id, b.recordDate || null],
      );
      await client.query(
        "UPDATE consents SET status='revoked', auto_revoked=true, revoked_at=now() WHERE patient_id=$1 AND doctor_id=$2 AND status='active'",
        [b.patientId, req.user.id],
      );
      await client.query(
        "INSERT INTO consent_requests (patient_id, doctor_id, status, reason) VALUES ($1, $2, 'pending', 'Record updated, patient re-approval required')",
        [b.patientId, req.user.id],
      );
      const info = await client.query(
        `
        SELECT pu.email AS patient_email, pu.full_name AS patient_name, du.full_name AS doctor_name
        FROM patients p
        JOIN users pu ON pu.id = p.user_id
        JOIN users du ON du.id = $2
        WHERE p.id = $1
        LIMIT 1
      `,
        [b.patientId, req.user.id],
      );
      return { record: r.rows[0], info: info.rows[0] };
    });

    await sendAutoRevokeEmailToPatient({
      toEmail: created.info?.patient_email || null,
      patientName: created.info?.patient_name || 'Patient',
      doctorName: created.info?.doctor_name || 'Doctor',
    });
    return res.status(201).json(created.record);
  } catch (err) {
    return next(err);
  }
});

const updateRecordSchema = Joi.object({ encryptedData: Joi.object().required() });

router.put('/records/:id', authRequired, requireRole('doctor', 'nurse'), validateBody(updateRecordSchema), async (req, res, next) => {
  try {
    const blob = encryptJson(req.validatedBody.encryptedData);
    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query('UPDATE health_records SET encrypted_data = $2 WHERE id = $1 RETURNING id, patient_id', [req.params.id, blob]);
      const row = r.rows[0];
      if (!row) return null;
      await client.query(
        "UPDATE consents SET status='revoked', auto_revoked=true, revoked_at=now() WHERE patient_id=$1 AND doctor_id=$2 AND status='active'",
        [row.patient_id, req.user.id],
      );
      await client.query(
        "INSERT INTO consent_requests (patient_id, doctor_id, status, reason) VALUES ($1, $2, 'pending', 'Record updated, patient re-approval required')",
        [row.patient_id, req.user.id],
      );
      const info = await client.query(
        `
        SELECT pu.email AS patient_email, pu.full_name AS patient_name, du.full_name AS doctor_name
        FROM patients p
        JOIN users pu ON pu.id = p.user_id
        JOIN users du ON du.id = $2
        WHERE p.id = $1
        LIMIT 1
      `,
        [row.patient_id, req.user.id],
      );
      return { row, info: info.rows[0] };
    });

    if (!updated) return res.status(404).json({ error: 'Record not found or access denied' });
    await sendAutoRevokeEmailToPatient({
      toEmail: updated.info?.patient_email || null,
      patientName: updated.info?.patient_name || 'Patient',
      doctorName: updated.info?.doctor_name || 'Doctor',
    });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;

