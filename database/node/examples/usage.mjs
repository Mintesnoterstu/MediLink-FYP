/**
 * Examples: set DATABASE_URL (and ENCRYPTION_KEY for decrypt tests).
 * Run: npm install && npm run example
 */
import { withMedilinkSession, getPool } from '../src/pool.js';
import { decryptJson } from '../src/encryption.js';

async function getPatientDecrypted(patientId, userId, role) {
  return withMedilinkSession({ userId, role }, async (c) => {
    const { rows } = await c.query(
      `SELECT id, ethiopian_health_id, encrypted_data FROM patients WHERE id = $1`,
      [patientId]
    );
    const row = rows[0];
    if (!row) return null;
    let decrypted = null;
    if (row.encrypted_data) {
      try {
        decrypted = decryptJson(row.encrypted_data);
      } catch {
        decrypted = { _error: 'decrypt_failed' };
      }
    }
    return { ...row, decrypted };
  });
}

async function patientsForDoctor(doctorUserId) {
  return withMedilinkSession({ userId: doctorUserId, role: 'doctor' }, async (c) => {
    const { rows } = await c.query(
      `SELECT p.id, p.ethiopian_health_id
       FROM patients p
       INNER JOIN consents c ON c.patient_id = p.id AND c.doctor_id = $1::uuid
       WHERE c.status = 'active'`,
      [doctorUserId]
    );
    return rows;
  });
}

async function consentActive(patientId, doctorUserId) {
  return withMedilinkSession({ userId: doctorUserId, role: 'doctor' }, async (c) => {
    const { rows } = await c.query(
      `SELECT EXISTS (
        SELECT 1 FROM consents
        WHERE patient_id = $1 AND doctor_id = $2::uuid AND status = 'active'
      ) AS ok`,
      [patientId, doctorUserId]
    );
    return rows[0]?.ok === true;
  });
}

async function appendAudit(client, row) {
  await client.query(
    `INSERT INTO audit_logs (
      actor_id, actor_role, action, resource_type, resource_id, patient_id, details, previous_hash, current_hash
    ) VALUES ($1, $2::user_role, $3, $4, $5, $6, $7::jsonb, $8, $9)`,
    [
      row.actorId,
      row.actorRole,
      row.action,
      row.resourceType,
      row.resourceId,
      row.patientId,
      JSON.stringify(row.details ?? {}),
      row.previousHash,
      row.currentHash,
    ]
  );
}

async function auditHistoryForPatient(patientId, patientUserId) {
  return withMedilinkSession({ userId: patientUserId, role: 'patient' }, async (c) => {
    const { rows } = await c.query(
      `SELECT id, ts, action, resource_type, details
       FROM audit_logs
       WHERE patient_id = $1
       ORDER BY ts DESC
       LIMIT 50`,
      [patientId]
    );
    return rows;
  });
}

// --- smoke (no-op if DB missing) ---
if (process.env.DATABASE_URL) {
  const pool = getPool();
  await pool.query('SELECT 1');
  console.log('DATABASE_URL OK');
}

export {
  getPatientDecrypted,
  patientsForDoctor,
  consentActive,
  appendAudit,
  auditHistoryForPatient,
};
