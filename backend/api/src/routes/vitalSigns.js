import { Router } from 'express';
import Joi from 'joi';

import { authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';

const router = Router();

const schema = Joi.object({
  patientId: Joi.string().uuid().required(),
  bloodPressure: Joi.string().allow('').optional(),
  heartRate: Joi.number().integer().min(20).max(250).optional(),
  temperature: Joi.number().min(30).max(45).optional(),
  weight: Joi.number().min(1).max(400).optional(),
  recordedAt: Joi.string().isoDate().optional(),
});

router.post('/', authRequired, validateBody(schema), async (req, res, next) => {
  try {
    const b = req.validatedBody;
    const created = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        INSERT INTO vital_signs (
          patient_id, blood_pressure, heart_rate, temperature, weight, recorded_at, created_by
        )
        VALUES ($1,$2,$3,$4,$5,COALESCE($6, now()),$7)
        RETURNING *
      `,
        [
          b.patientId,
          b.bloodPressure || null,
          b.heartRate || null,
          b.temperature || null,
          b.weight || null,
          b.recordedAt || null,
          req.user.id,
        ],
      );
      return r.rows[0];
    });
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
});

export default router;

