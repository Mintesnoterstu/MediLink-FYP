import { withMedilinkSession } from '../config/database.js';

export function audit(action, resourceType, getResource) {
  return async (req, res, next) => {
    const start = Date.now();
    const user = req.user || {};
    const ip = req.ip;
    const ua = req.headers['user-agent'] || null;

    res.on('finish', async () => {
      const status = res.statusCode;
      try {
        const resource = (typeof getResource === 'function' && getResource(req, res)) || {};
        const patientId = resource.patientId || null;
        const consentId = resource.consentId || null;
        const resourceId = resource.resourceId || null;

        await withMedilinkSession(
          { userId: null, role: 'service_role' },
          async (client) => {
            const previous = await client.query(
              'SELECT current_hash FROM audit_logs ORDER BY ts DESC LIMIT 1',
            );
            const previousHash = previous.rows[0]?.current_hash || null;
            const details = {
              path: req.originalUrl,
              method: req.method,
              status,
              duration_ms: Date.now() - start,
            };
            await client.query(
              `
              INSERT INTO audit_logs (
                actor_id, actor_role, action, resource_type, resource_id,
                patient_id, consent_id, details, ip_address, user_agent,
                previous_hash, current_hash
              )
              VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8::jsonb, $9::inet, $10,
                $11,
                encode(digest(coalesce($11, '') || $3 || now()::text, 'sha256'), 'hex')
              )
            `,
              [
                user.id || null,
                user.role || null,
                action,
                resourceType,
                resourceId,
                patientId,
                consentId,
                JSON.stringify(details),
                ip || null,
                ua,
                previousHash,
              ],
            );
          },
        );
      } catch {
        // swallow audit failures
      }
    });

    return next();
  };
}

