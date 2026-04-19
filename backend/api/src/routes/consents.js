import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { withRequestSession } from '../utils/dbSession.js';

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

router.get('/pending', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT cr.*
        FROM consent_requests cr
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

router.post('/grant/:requestId', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const requestId = req.params.requestId;
    const result = await withRequestSession(req, async (client) => {
      const cr = await client.query(
        `
        SELECT * FROM consent_requests
        WHERE id = $1 AND status = 'pending'
        LIMIT 1
      `,
        [requestId],
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
        VALUES ($1, $2, 'active', '{"records": true, "appointments": true}'::jsonb, now(), now() + interval '30 days', false, 0)
        ON CONFLICT (patient_id, doctor_id)
        DO UPDATE SET
          status='active',
          granted_at=now(),
          expires_at=now() + interval '30 days',
          auto_revoked=false,
          revoked_at=NULL,
          regrant_count = consents.regrant_count + 1
        RETURNING *
      `,
        [row.patient_id, row.doctor_id],
      );

      return c.rows[0];
    });

    if (!result) return res.status(404).json({ error: 'Consent request not found' });
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
        RETURNING id
      `,
        [consentId],
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

export default router;

