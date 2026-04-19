import { Router } from 'express';
import Joi from 'joi';

import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';
import { encryptJson } from '../utils/encryption.js';

const router = Router();

const createSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  recordType: Joi.string().min(2).required(),
  recordDate: Joi.string().isoDate().optional(),
  encryptedData: Joi.object().required(),
});

router.post('/', authRequired, requireRole('doctor', 'nurse'), validateBody(createSchema), async (req, res, next) => {
  try {
    const body = req.validatedBody;
    const blob = encryptJson(body.encryptedData);

    const created = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        INSERT INTO health_records (patient_id, record_type, encrypted_data, created_by, record_date, facility_id)
        VALUES ($1, $2, $3, $4, $5, (SELECT facility_id FROM users WHERE id = $4))
        RETURNING id, patient_id, record_type, record_date, created_at
      `,
        [body.patientId, body.recordType, blob, req.user.id, body.recordDate || null],
      );

      // Auto-revoke consent after any professional update to records.
      await client.query(
        `
        UPDATE consents
        SET status='pending', auto_revoked=true, revoked_at=now()
        WHERE patient_id = $1 AND doctor_id = $2 AND status='active'
      `,
        [body.patientId, req.user.id],
      );

      return r.rows[0];
    });

    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
});

const updateSchema = Joi.object({
  encryptedData: Joi.object().required(),
});

router.put('/:id', authRequired, requireRole('doctor', 'nurse'), validateBody(updateSchema), async (req, res, next) => {
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

      return row;
    });

    if (!updated) return res.status(404).json({ error: 'Record not found or access denied' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;

