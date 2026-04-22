import { withMedilinkSession } from '../config/database.js';

export async function logAdminAction({
  actorId,
  actorRole,
  action,
  details = {},
  ipAddress = null,
  userAgent = null,
}) {
  return withMedilinkSession({ userId: null, role: 'service_role' }, async (client) => {
    const previous = await client.query('SELECT current_hash FROM audit_logs ORDER BY ts DESC LIMIT 1');
    const previousHash = previous.rows[0]?.current_hash || null;

    await client.query(
      `
      INSERT INTO audit_logs (
        actor_id,
        actor_role,
        action,
        resource_type,
        details,
        ip_address,
        user_agent,
        previous_hash,
        current_hash
      )
      VALUES (
        $1,
        $2::user_role,
        $3,
        'admin_user',
        $4::jsonb,
        $5::inet,
        $6,
        $7,
        encode(digest(coalesce($7, '') || $3 || now()::text, 'sha256'), 'hex')
      )
    `,
      [
        actorId || null,
        actorRole || null,
        action,
        JSON.stringify(details || {}),
        ipAddress || null,
        userAgent || null,
        previousHash,
      ],
    );
  });
}
