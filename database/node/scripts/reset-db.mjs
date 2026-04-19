import pg from 'pg';

const { Client } = pg;

const ADMIN_DATABASE_URL =
  process.env.ADMIN_DATABASE_URL || 'postgresql://postgres:wande123@localhost:5432/postgres';
const TARGET_DB = process.env.TARGET_DB || 'medilink';

const client = new Client({ connectionString: ADMIN_DATABASE_URL });

try {
  await client.connect();
  await client.query(
    `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1
      AND pid <> pg_backend_pid()
  `,
    [TARGET_DB],
  );
  await client.query(`DROP DATABASE IF EXISTS ${TARGET_DB}`);
  await client.query(`CREATE DATABASE ${TARGET_DB}`);
  console.log(`Reset database: ${TARGET_DB}`);
} finally {
  await client.end();
}
