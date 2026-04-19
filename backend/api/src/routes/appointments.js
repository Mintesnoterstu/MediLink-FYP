import { Router } from 'express';
import Joi from 'joi';

import { authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';

const router = Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT *
        FROM appointments
        ORDER BY appointment_date DESC
        LIMIT 100
      `,
      );
      return r.rows;
    });
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

const createSchema = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().uuid(),
  providerId: Joi.string(),
  facilityId: Joi.string().uuid().optional(),
  appointmentDate: Joi.string().isoDate(),
  date: Joi.string().isoDate(),
  time: Joi.string().optional(),
  type: Joi.string().optional(),
  providerName: Joi.string().optional(),
  reason: Joi.string().allow('').optional(),
});

router.post('/', authRequired, validateBody(createSchema), async (req, res, next) => {
  try {
    const b = req.validatedBody;
    const doctorId = b.doctorId || b.providerId;
    const appointmentDate = b.appointmentDate || b.date;
    const created = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        INSERT INTO appointments (patient_id, doctor_id, facility_id, appointment_date, reason, status)
        VALUES ($1, $2, $3, $4, $5, 'scheduled')
        RETURNING *
      `,
        [b.patientId, doctorId, b.facilityId || null, appointmentDate, b.reason || b.type || null],
      );
      return r.rows[0];
    });
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
});

const updateSchema = Joi.object({
  appointmentDate: Joi.string().isoDate().optional(),
  status: Joi.string().optional(),
  reason: Joi.string().allow('').optional(),
  notes: Joi.string().allow('').optional(),
});

router.put('/:id', authRequired, validateBody(updateSchema), async (req, res, next) => {
  try {
    const id = req.params.id;
    const b = req.validatedBody;
    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE appointments
        SET
          appointment_date = COALESCE($2, appointment_date),
          status = COALESCE($3, status),
          reason = COALESCE($4, reason),
          notes = COALESCE($5, notes)
        WHERE id = $1
        RETURNING *
      `,
        [id, b.appointmentDate || null, b.status || null, b.reason ?? null, b.notes ?? null],
      );
      return r.rows[0] || null;
    });
    if (!updated) return res.status(404).json({ error: 'Appointment not found or access denied' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

// Frontend compatibility alias
router.patch('/:id', authRequired, validateBody(updateSchema), async (req, res, next) => {
  try {
    const id = req.params.id;
    const b = req.validatedBody;
    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE appointments
        SET
          appointment_date = COALESCE($2, appointment_date),
          status = COALESCE($3, status),
          reason = COALESCE($4, reason),
          notes = COALESCE($5, notes)
        WHERE id = $1
        RETURNING *
      `,
        [id, b.appointmentDate || null, b.status || null, b.reason ?? null, b.notes ?? null],
      );
      return r.rows[0] || null;
    });
    if (!updated) return res.status(404).json({ error: 'Appointment not found or access denied' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await withRequestSession(req, async (client) => {
      const r = await client.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);
      return r.rows[0] || null;
    });
    if (!deleted) return res.status(404).json({ error: 'Appointment not found or access denied' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

export default router;

