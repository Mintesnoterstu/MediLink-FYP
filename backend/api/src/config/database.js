import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DATABASE_URL is available before pool creation, regardless of import order.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

let poolInstance = null;

function getPool() {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }

    // Render Postgres commonly requires SSL and may present a cert chain that
    // Node won't validate by default in managed environments.
    // Allow overriding via env, but default to secure local dev (no SSL) and
    // permissive SSL in production to avoid "self-signed certificate" crashes.
    const nodeEnv = String(process.env.NODE_ENV || '').toLowerCase();
    const forceSsl =
      String(process.env.PGSSL || '').toLowerCase() === 'true' ||
      connectionString.includes('sslmode=require') ||
      connectionString.includes('sslmode=verify-full') ||
      nodeEnv === 'production';

    const rejectUnauthorizedEnv = String(process.env.PGSSL_REJECT_UNAUTHORIZED || '').toLowerCase();
    const rejectUnauthorized =
      rejectUnauthorizedEnv === 'true'
        ? true
        : rejectUnauthorizedEnv === 'false'
          ? false
          : nodeEnv !== 'production';

    poolInstance = new Pool({
      connectionString,
      max: Number(process.env.DATABASE_POOL_SIZE || 20),
      ...(forceSsl ? { ssl: { rejectUnauthorized } } : {}),
    });
  }
  return poolInstance;
}

export const pool = getPool();

export async function query(text, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

export async function withMedilinkSession(ctx, fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('medilink.user_id', $1, true)`, [ctx.userId ?? '']);
    await client.query(`SELECT set_config('medilink.role', $1, true)`, [ctx.role]);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

