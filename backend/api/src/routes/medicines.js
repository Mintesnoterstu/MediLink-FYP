import { Router } from 'express';
import Joi from 'joi';
import { query } from '../config/database.js';
import { authRequired } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { withRequestSession } from '../utils/dbSession.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const r = await query('SELECT * FROM medicines ORDER BY name ASC');
    return res.json(r.rows);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const idOrSlug = req.params.id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug,
    );
    const r = await query(
      isUuid ? 'SELECT * FROM medicines WHERE id = $1' : 'SELECT * FROM medicines WHERE slug = $1',
      [idOrSlug],
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Medicine not found' });
    return res.json(r.rows[0]);
  } catch (err) {
    return next(err);
  }
});

export default router;

const medicationSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  dosage: Joi.string().allow('').optional(),
  frequency: Joi.string().allow('').optional(),
  startDate: Joi.string().isoDate().optional(),
  endDate: Joi.string().isoDate().optional(),
  reminderEnabled: Joi.boolean().optional(),
  notes: Joi.string().allow('').optional(),
});

router.post('/', authRequired, validateBody(medicationSchema), async (req, res, next) => {
  try {
    const b = req.validatedBody;
    const created = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        INSERT INTO medications (
          patient_id, name, dosage, frequency, start_date, end_date, reminder_enabled, notes, created_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
      `,
        [
          b.patientId,
          b.name,
          b.dosage || null,
          b.frequency || null,
          b.startDate || null,
          b.endDate || null,
          b.reminderEnabled ?? false,
          b.notes || null,
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

const patchMedicationSchema = Joi.object({
  name: Joi.string(),
  dosage: Joi.string().allow(''),
  frequency: Joi.string().allow(''),
  startDate: Joi.string().isoDate(),
  endDate: Joi.string().isoDate(),
  reminderEnabled: Joi.boolean(),
  notes: Joi.string().allow(''),
});

router.patch('/:id', authRequired, validateBody(patchMedicationSchema), async (req, res, next) => {
  try {
    const id = req.params.id;
    const b = req.validatedBody;
    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE medications
        SET
          name = COALESCE($2, name),
          dosage = COALESCE($3, dosage),
          frequency = COALESCE($4, frequency),
          start_date = COALESCE($5, start_date),
          end_date = COALESCE($6, end_date),
          reminder_enabled = COALESCE($7, reminder_enabled),
          notes = COALESCE($8, notes),
          updated_at = now()
        WHERE id = $1
        RETURNING *
      `,
        [
          id,
          b.name || null,
          b.dosage ?? null,
          b.frequency ?? null,
          b.startDate || null,
          b.endDate || null,
          b.reminderEnabled ?? null,
          b.notes ?? null,
        ],
      );
      return r.rows[0] || null;
    });
    if (!updated) return res.status(404).json({ error: 'Medication not found or access denied' });
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:medicationId', authRequired, async (req, res, next) => {
  try {
    const id = req.params.medicationId;
    const deleted = await withRequestSession(req, async (client) => {
      const r = await client.query('DELETE FROM medications WHERE id = $1 RETURNING id', [id]);
      return r.rows[0] || null;
    });
    if (!deleted) return res.status(404).json({ error: 'Medication not found or access denied' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

