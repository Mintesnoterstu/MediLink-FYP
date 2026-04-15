import pg from 'pg';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }
    pool = new Pool({ connectionString, max: 10 });
  }
  return pool;
}

/**
 * Run work inside a transaction with RLS session variables (PostgreSQL custom GUCs).
 * @param {{ userId: string | null, role: string }} ctx
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withMedilinkSession(ctx, fn) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SELECT set_config('medilink.user_id', $1, true)`, [
      ctx.userId ?? '',
    ]);
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
