import { Router } from 'express';
import Joi from 'joi';

import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';
import { encryptJson } from '../utils/encryption.js';

const router = Router();

router.get('/patients', authRequired, requireRole('doctor', 'nurse'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      // Doctors see patients with active consent (RLS handles it).
      const r = await client.query(
        `
        SELECT p.id, p.ethiopian_health_id, u.full_name
        FROM patients p
        JOIN users u ON u.id = p.user_id
        ORDER BY u.full_name ASC
        LIMIT 200
      `,
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
  scope: Joi.object().optional(),
  durationDays: Joi.number().integer().min(1).max(365).optional(),
});

router.post(
  '/consents/request',
  authRequired,
  requireRole('doctor'),
  validateBody(requestConsentSchema),
  async (req, res, next) => {
    try {
      const b = req.validatedBody;
      const created = await withRequestSession(req, async (client) => {
        const r = await client.query(
          `
          INSERT INTO consent_requests (patient_id, doctor_id, status, reason)
          VALUES ($1, $2, 'pending', $3)
          RETURNING *
        `,
          [b.patientId, req.user.id, b.reason || `Access request (${b.durationDays || 30} days)`],
        );
        return r.rows[0];
      });
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

router.get('/consents/pending', authRequired, requireRole('doctor'), async (req, res, next) => {
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

export default router;

const createRecordSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  recordType: Joi.string().min(2).required(),
  recordDate: Joi.string().isoDate().optional(),
  encryptedData: Joi.object().required(),
});

router.post(
  '/records',
  authRequired,
  requireRole('doctor', 'nurse'),
  validateBody(createRecordSchema),
  async (req, res, next) => {
    try {
      const b = req.validatedBody;
      const blob = encryptJson(b.encryptedData);

      const created = await withRequestSession(req, async (client) => {
        const r = await client.query(
          `
          INSERT INTO health_records (patient_id, record_type, encrypted_data, created_by, record_date, facility_id)
          VALUES ($1, $2, $3, $4, $5, (SELECT facility_id FROM users WHERE id = $4))
          RETURNING id, patient_id, record_type, record_date, created_at
        `,
          [b.patientId, b.recordType, blob, req.user.id, b.recordDate || null],
        );
        await client.query(
          `
          UPDATE consents
          SET status='pending', auto_revoked=true, revoked_at=now()
          WHERE patient_id = $1 AND doctor_id = $2 AND status='active'
        `,
          [b.patientId, req.user.id],
        );
        await client.query(
          `
          INSERT INTO consent_requests (patient_id, doctor_id, status, reason)
          VALUES ($1, $2, 'pending', 'Record updated, patient re-approval required')
        `,
          [b.patientId, req.user.id],
        );
        return r.rows[0];
      });

      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  },
);

const updateRecordSchema = Joi.object({
  encryptedData: Joi.object().required(),
});

router.put(
  '/records/:id',
  authRequired,
  requireRole('doctor', 'nurse'),
  validateBody(updateRecordSchema),
  async (req, res, next) => {
    try {
      const recordId = req.params.id;
      const blob = encryptJson(req.validatedBody.encryptedData);
      const updated = await withRequestSession(req, async (client) => {
        const r = await client.query(
          `
          UPDATE health_records
          SET encrypted_data = $2
          WHERE id = $1
          RETURNING id, patient_id
        `,
          [recordId, blob],
        );
        const row = r.rows[0];
        if (!row) return null;
        await client.query(
          `
          UPDATE consents
          SET status='pending', auto_revoked=true, revoked_at=now()
          WHERE patient_id = $1 AND doctor_id = $2 AND status='active'
        `,
          [row.patient_id, req.user.id],
        );
        await client.query(
          `
          INSERT INTO consent_requests (patient_id, doctor_id, status, reason)
          VALUES ($1, $2, 'pending', 'Record updated, patient re-approval required')
        `,
          [row.patient_id, req.user.id],
        );
        return row;
      });

      if (!updated) return res.status(404).json({ error: 'Record not found or access denied' });
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  },
);

