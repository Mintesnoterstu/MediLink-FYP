import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { withRequestSession } from '../utils/dbSession.js';
import { withMedilinkSession } from '../config/database.js';

const router = Router();

router.get('/patient/:id', authRequired, requireRole('patient'), async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const rows = await withRequestSession(req, async (client) => {
      const r = await client.query(
        `
        SELECT ts, actor_role, action, resource_type, resource_id, details, ip_address, user_agent
        FROM audit_logs
        WHERE patient_id = $1
        ORDER BY ts DESC
        LIMIT 200
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

// Admin-visible audit: metadata only (no clinical payloads)
router.get(
  '/admin',
  authRequired,
  requireRole('zonal_admin', 'woreda_admin', 'city_admin', 'facility_admin'),
  async (req, res, next) => {
    try {
      const rows = await withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
        const r = await client.query(
          `
          SELECT ts, actor_role, action, resource_type, details, ip_address
          FROM audit_logs
          ORDER BY ts DESC
          LIMIT 200
        `,
        );
        return r.rows;
      });
      return res.json(rows);
    } catch (err) {
      return next(err);
    }
  },
);

export default router;

