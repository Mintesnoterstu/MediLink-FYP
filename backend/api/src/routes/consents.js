import { Router } from 'express';
import Joi from 'joi';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { withRequestSession } from '../utils/dbSession.js';
import { validateBody } from '../middleware/validation.js';
import { sendChangeApprovedEmailToProfessional, sendConsentGrantedEmailToProfessional } from '../services/emailService.js';

const router = Router();

router.get('/active', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT c.*
        FROM consents c
        WHERE c.status = 'active'
          AND c.patient_id IN (SELECT id FROM patients WHERE user_id = $1)
        ORDER BY c.granted_at DESC NULLS LAST
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

router.get('/requests', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT cr.*, du.full_name AS doctor_name, f.name AS facility_name
        FROM consent_requests cr
        JOIN users du ON du.id = cr.doctor_id
        LEFT JOIN facilities f ON f.id = du.facility_id
        WHERE cr.status = 'pending'
          AND cr.patient_id IN (SELECT id FROM patients WHERE user_id = $1)
        ORDER BY cr.requested_at DESC
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

router.get('/pending', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT cr.*, du.full_name AS doctor_name, f.name AS facility_name
        FROM consent_requests cr
        JOIN users du ON du.id = cr.doctor_id
        LEFT JOIN facilities f ON f.id = du.facility_id
        WHERE cr.status = 'pending'
          AND cr.patient_id IN (SELECT id FROM patients WHERE user_id = $1)
        ORDER BY cr.requested_at DESC
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

const grantConsentSchema = Joi.object({
  scope: Joi.object().optional(),
  durationDays: Joi.number().integer().min(1).max(365).optional(),
});

router.post(
  '/grant/:requestId',
  authRequired,
  requireRole('patient'),
  validateBody(grantConsentSchema),
  async (req, res, next) => {
  try {
    const requestId = req.params.requestId;
    const body = req.validatedBody || {};
    const durationDays = body.durationDays || 30;
    const scope = body.scope || { records: true, appointments: true };
    const result = await withRequestSession(req, async (client) => {
      const cr = await client.query(
        `
        SELECT * FROM consent_requests
        WHERE id = $1
          AND status = 'pending'
          AND patient_id IN (SELECT id FROM patients WHERE user_id = $2)
        LIMIT 1
      `,
        [requestId, req.user.id],
      );
      const row = cr.rows[0];
      if (!row) return null;

      // Approve request
      await client.query(
        `UPDATE consent_requests SET status='approved', responded_at=now() WHERE id=$1`,
        [requestId],
      );

      // Upsert consent to active
      const c = await client.query(
        `
        INSERT INTO consents (patient_id, doctor_id, status, scope, granted_at, expires_at, auto_revoked, regrant_count)
        VALUES ($1, $2, 'active', $3::jsonb, now(), now() + ($4 || ' days')::interval, false, 0)
        ON CONFLICT (patient_id, doctor_id)
        DO UPDATE SET
          status='active',
          scope=EXCLUDED.scope,
          granted_at=now(),
          expires_at=now() + ($4 || ' days')::interval,
          auto_revoked=false,
          revoked_at=NULL,
          regrant_count = consents.regrant_count + 1
        RETURNING *
      `,
        [row.patient_id, row.doctor_id, JSON.stringify(scope), String(durationDays)],
      );

      const full = await client.query(
        `
        SELECT c.*, pu.full_name AS patient_name, du.full_name AS doctor_name, du.email AS doctor_email
        FROM consents c
        JOIN patients p ON p.id = c.patient_id
        JOIN users pu ON pu.id = p.user_id
        JOIN users du ON du.id = c.doctor_id
        WHERE c.id = $1
        LIMIT 1
      `,
        [c.rows[0].id],
      );

      return full.rows[0];
    });

    if (!result) return res.status(404).json({ error: 'Consent request not found' });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const dashboardLink = `${frontendUrl}/dashboard?patientId=${result.patient_id}`;
    await sendConsentGrantedEmailToProfessional({
      toEmail: result.doctor_email || null,
      doctorName: result.doctor_name || 'Doctor',
      patientName: result.patient_name || 'Patient',
      scope: JSON.stringify(result.scope || {}),
      expiresAt: result.expires_at ? new Date(result.expires_at).toISOString() : 'N/A',
      dashboardLink,
    });
    return res.json({ success: true, consent: result });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id/revoke', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const consentId = req.params.id;
    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE consents
        SET status='revoked', revoked_at=now()
        WHERE id=$1
          AND patient_id IN (SELECT id FROM patients WHERE user_id = $2)
        RETURNING id
      `,
        [consentId, req.user.id],
      );
      return r.rows[0] || null;
    });
    if (!updated) return res.status(404).json({ error: 'Consent not found' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

router.get('/history', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT c.*
        FROM consents c
        WHERE c.patient_id IN (SELECT id FROM patients WHERE user_id = $1)
        ORDER BY c.created_at DESC
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

router.get('/audit', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT action_type, actor_id, created_at, details
        FROM audit_logs
        WHERE details->>'patient_id' IN (
          SELECT id::text FROM patients WHERE user_id = $1
        )
        ORDER BY created_at DESC
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

router.post('/records/:id/approve', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE health_records hr
        SET status = 'approved', approved_at = now(), disputed_at = NULL, dispute_reason = NULL
        WHERE hr.id = $1
          AND hr.patient_id IN (SELECT id FROM patients WHERE user_id = $2)
        RETURNING hr.id, hr.patient_id, hr.created_by
      `,
        [req.params.id, req.user.id],
      );
      const row = r.rows[0] || null;
      if (!row) return null;

      // Restore consent for this doctor/nurse if it was auto-revoked.
      await client.query(
        `
        UPDATE consents
        SET status='active', revoked_at=NULL, auto_revoked=false
        WHERE patient_id = $1
          AND doctor_id = $2
      `,
        [row.patient_id, row.created_by],
      );

      // Mark latest pending consent_request (re-approval) as approved for audit clarity.
      await client.query(
        `
        UPDATE consent_requests
        SET status='approved', responded_at=now()
        WHERE id = (
          SELECT id
          FROM consent_requests
          WHERE patient_id = $1 AND doctor_id = $2 AND status = 'pending'
          ORDER BY requested_at DESC
          LIMIT 1
        )
      `,
        [row.patient_id, row.created_by],
      );

      const info = await client.query(
        `
        SELECT pu.full_name AS patient_name, du.full_name AS doctor_name, du.email AS doctor_email
        FROM patients p
        JOIN users pu ON pu.id = p.user_id
        JOIN users du ON du.id = $2
        WHERE p.id = $1
        LIMIT 1
      `,
        [row.patient_id, row.created_by],
      );

      return { row, info: info.rows[0] };
    });
    if (!updated) return res.status(404).json({ error: 'Record not found' });

    await sendChangeApprovedEmailToProfessional({
      toEmail: updated.info?.doctor_email || null,
      doctorName: updated.info?.doctor_name || 'Doctor',
      patientName: updated.info?.patient_name || 'Patient',
      dashboardLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?patientId=${updated.row.patient_id}`,
    });

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

const disputeSchema = Joi.object({
  reason: Joi.string().min(3).required(),
});

router.post('/records/:id/dispute', authRequired, requireRole('patient'), validateBody(disputeSchema), async (req, res, next) => {
  try {
    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE health_records hr
        SET status = 'disputed', disputed_at = now(), dispute_reason = $3
        WHERE hr.id = $1
          AND hr.patient_id IN (SELECT id FROM patients WHERE user_id = $2)
        RETURNING hr.id
      `,
        [req.params.id, req.user.id, req.validatedBody.reason],
      );
      return r.rows[0] || null;
    });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

router.post('/deny/:requestId', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const requestId = req.params.requestId;
    const updated = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        UPDATE consent_requests
        SET status='denied', responded_at=now()
        WHERE id = $1
          AND status = 'pending'
          AND patient_id IN (SELECT id FROM patients WHERE user_id = $2)
        RETURNING id
      `,
        [requestId, req.user.id],
      );
      return r.rows[0] || null;
    });
    if (!updated) return res.status(404).json({ error: 'Consent request not found' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

router.get('/approvals/pending', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT hr.id, hr.record_type, hr.created_at, hr.status, du.full_name AS doctor_name
        FROM health_records hr
        JOIN users du ON du.id = hr.created_by
        WHERE hr.status = 'pending'
          AND hr.patient_id IN (SELECT id FROM patients WHERE user_id = $1)
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

export default router;

