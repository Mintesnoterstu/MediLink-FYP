import { Router } from 'express';
import Joi from 'joi';

import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';
import { encryptJson } from '../utils/encryption.js';
import { decryptJson } from '../utils/encryption.js';
import { logAdminAction } from '../services/auditService.js';
import { sendAutoRevokeEmailToPatient, sendConsentRequestEmailToPatient } from '../services/emailService.js';

const router = Router();

router.get('/patients/search', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim().toUpperCase();
    if (!q) return res.json([]);
    if (!q.startsWith('ETH-')) {
      return res.status(400).json({ error: 'Search is supported by Ethiopian Health ID only' });
    }
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
        WHERE upper(p.ethiopian_health_id) = $1
        LIMIT 1
      `,
        [q, req.user.id],
      );
      return r.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

const requestConsentSchema = Joi.object({
  patientId: Joi.string().uuid().optional(),
  ethiopianHealthId: Joi.string().min(8).optional(),
  ethiopian_health_id: Joi.string().min(8).optional(),
  healthId: Joi.string().min(8).optional(),
  q: Joi.string().min(8).optional(),
  reason: Joi.string().allow('').optional(),
}).or('patientId', 'ethiopianHealthId', 'ethiopian_health_id', 'healthId', 'q');

router.post('/consent/request', authRequired, requireRole('doctor', 'nurse'), validateBody(requestConsentSchema), async (req, res, next) => {
  try {
    const b = req.validatedBody;
    const resolvedPatientId = await withRequestSession(req, async (client) => {
      if (b.patientId) return b.patientId;
      const healthId = String(
        b.ethiopianHealthId || b.ethiopian_health_id || b.healthId || b.q || '',
      )
        .trim()
        .toUpperCase();
      if (!healthId.startsWith('ETH-')) {
        const err = new Error('Ethiopian Health ID is required');
        err.status = 400;
        throw err;
      }
      const p = await client.query('SELECT id FROM patients WHERE upper(ethiopian_health_id) = $1 LIMIT 1', [healthId]);
      if (!p.rows[0]) {
        const err = new Error('Patient not found for this Ethiopian Health ID');
        err.status = 404;
        throw err;
      }
      return p.rows[0].id;
    });
    const created = await withRequestSession(req, async (client) => {
      const existing = await client.query(
        'SELECT id FROM consent_requests WHERE patient_id=$1 AND doctor_id=$2 AND status=$3 LIMIT 1',
        [resolvedPatientId, req.user.id, 'pending'],
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
        [resolvedPatientId, req.user.id, b.reason || 'Follow-up treatment'],
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
        [resolvedPatientId, req.user.id],
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
      details: { patient_id: resolvedPatientId, reason: b.reason || 'Follow-up treatment' },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    return res.status(201).json(created.request);
  } catch (err) {
    return next(err);
  }
});

router.post('/consents/request', authRequired, requireRole('doctor', 'nurse'), validateBody(requestConsentSchema), async (req, res, next) => {
  return res.status(410).json({ error: 'Use /api/professional/consent/request' });
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
        SELECT
          p.id,
          p.ethiopian_health_id,
          u.full_name,
          c.scope,
          c.expires_at,
          (
            SELECT max(al.created_at)
            FROM audit_logs al
            WHERE al.actor_id = $1
              AND al.action_type = 'VIEW_PATIENT'
              AND al.details->>'patient_id' = p.id::text
          ) AS last_access
        FROM consents c
        JOIN patients p ON p.id = c.patient_id
        JOIN users u ON u.id = p.user_id
        WHERE c.doctor_id = $1
          AND c.status = 'active'
          AND (c.expires_at IS NULL OR c.expires_at > now())
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

router.get('/patient/:id/dashboard', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const result = await withRequestSession(req, async (client) => {
      const consent = await client.query(
        `
        SELECT scope, expires_at
        FROM consents
        WHERE patient_id = $1
          AND doctor_id = $2
          AND status = 'active'
          AND expires_at > now()
        LIMIT 1
      `,
        [req.params.id, req.user.id],
      );
      if (!consent.rows[0]) return null;

      const p = await client.query(
        `
        SELECT
          p.id,
          p.ethiopian_health_id,
          p.date_of_birth,
          p.gender,
          u.full_name,
          u.email
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
        LIMIT 1
      `,
        [req.params.id],
      );
      if (!p.rows[0]) return null;

      const recordsR = await client.query(
        `
        SELECT id, record_type, record_date, encrypted_data, created_by, created_at, status
        FROM health_records
        WHERE patient_id = $1
        ORDER BY created_at DESC
        LIMIT 200
      `,
        [req.params.id],
      );

      const records = recordsR.rows.map((r) => {
        let data = null;
        try {
          data = decryptJson(r.encrypted_data);
        } catch {
          data = null;
        }
        return {
          id: r.id,
          record_type: r.record_type,
          record_date: r.record_date,
          created_by: r.created_by,
          created_at: r.created_at,
          status: r.status,
          data,
        };
      });

      return {
        patient: p.rows[0],
        consent: consent.rows[0],
        records,
      };
    });

    if (!result) return res.status(403).json({ error: 'No active consent for this patient' });
    await logAdminAction({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'VIEW_PATIENT',
      details: { patient_id: req.params.id, view: 'dashboard' },
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

router.get('/patient/:id/data', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const result = await withRequestSession(req, async (client) => {
      const consent = await client.query(
        `
        SELECT scope, expires_at
        FROM consents
        WHERE patient_id = $1
          AND doctor_id = $2
          AND status = 'active'
          AND expires_at > now()
        LIMIT 1
      `,
        [req.params.id, req.user.id],
      );
      if (!consent.rows[0]) return null;

      const p = await client.query(
        `
        SELECT p.id, p.ethiopian_health_id, p.date_of_birth, p.gender, u.full_name, u.email
        FROM patients p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
        LIMIT 1
      `,
        [req.params.id],
      );
      if (!p.rows[0]) return null;

      const recordsR = await client.query(
        `
        SELECT id, record_type, record_date, encrypted_data, created_by, created_at, status
        FROM health_records
        WHERE patient_id = $1
        ORDER BY created_at DESC
        LIMIT 200
      `,
        [req.params.id],
      );

      const records = recordsR.rows.map((r) => {
        let data = null;
        try {
          data = decryptJson(r.encrypted_data);
        } catch {
          data = null;
        }
        return {
          id: r.id,
          record_type: r.record_type,
          record_date: r.record_date,
          created_by: r.created_by,
          created_at: r.created_at,
          status: r.status,
          data,
        };
      });
      return { patient: p.rows[0], consent: consent.rows[0], records };
    });

    if (!result) return res.status(403).json({ error: 'No active consent for this patient' });
    return res.json(result);
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

const scopedRecordSchema = Joi.object({
  recordDate: Joi.string().isoDate().optional(),
  encryptedData: Joi.object().required(),
});

async function createRecordAndAutoRevoke({ req, patientId, recordType, recordDate, encryptedData }) {
  const blob = encryptJson(encryptedData);
  const created = await withRequestSession(req, async (client) => {
    const consent = await client.query(
      'SELECT id FROM consents WHERE patient_id=$1 AND doctor_id=$2 AND status=$3 AND expires_at>now() LIMIT 1',
      [patientId, req.user.id, 'active'],
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
      [patientId, recordType, blob, req.user.id, recordDate || null],
    );
    await client.query(
      "UPDATE consents SET status='revoked', auto_revoked=true, revoked_at=now() WHERE patient_id=$1 AND doctor_id=$2 AND status='active'",
      [patientId, req.user.id],
    );
    await client.query(
      "INSERT INTO consent_requests (patient_id, doctor_id, status, reason) VALUES ($1, $2, 'pending', 'Record updated, patient re-approval required')",
      [patientId, req.user.id],
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
      [patientId, req.user.id],
    );
    return { record: r.rows[0], info: info.rows[0] };
  });

  await sendAutoRevokeEmailToPatient({
    toEmail: created.info?.patient_email || null,
    patientName: created.info?.patient_name || 'Patient',
    doctorName: created.info?.doctor_name || 'Doctor',
  });
  return created.record;
}

router.post('/patient/:id/diagnosis', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'diagnosis',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/prescription', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'prescription',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/lab', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'lab',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/note', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'note',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/notes', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'note',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/vitals', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'vitals',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/symptoms', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'symptoms',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/examination', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'examination',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/treatment', authRequired, requireRole('doctor', 'nurse'), validateBody(scopedRecordSchema), async (req, res, next) => {
  try {
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: req.params.id,
      recordType: 'treatment_plan',
      recordDate: req.validatedBody.recordDate,
      encryptedData: req.validatedBody.encryptedData,
    });
    return res.status(201).json(record);
  } catch (err) {
    return next(err);
  }
});

router.post('/patient/:id/complete', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const payload = req.body || {};
    const entries = Object.entries(payload).filter(([, value]) => value && typeof value === 'object' && Object.keys(value).length > 0);
    if (entries.length === 0) return res.status(400).json({ error: 'No section data provided' });

    const allowed = new Set(['vitals', 'symptoms', 'examination', 'diagnosis', 'lab_order', 'prescription', 'treatment_plan', 'clinical_note']);
    const inserted = [];
    for (const [section, value] of entries) {
      if (!allowed.has(section)) continue;
      const mappedType = section === 'lab_order' ? 'lab' : section === 'clinical_note' ? 'note' : section;
      const record = await createRecordAndAutoRevoke({
        req,
        patientId: req.params.id,
        recordType: mappedType,
        encryptedData: value,
      });
      inserted.push(record);
      break;
    }
    return res.status(201).json({ success: true, records: inserted });
  } catch (err) {
    return next(err);
  }
});

router.post('/records', authRequired, requireRole('doctor', 'nurse'), validateBody(createRecordSchema), async (req, res, next) => {
  try {
    const b = req.validatedBody;
    const record = await createRecordAndAutoRevoke({
      req,
      patientId: b.patientId,
      recordType: b.recordType,
      recordDate: b.recordDate,
      encryptedData: b.encryptedData,
    });
    return res.status(201).json(record);
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

