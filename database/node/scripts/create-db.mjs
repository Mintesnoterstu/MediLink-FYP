import pg from 'pg';

const { Client } = pg;

const ADMIN_DATABASE_URL =
  process.env.ADMIN_DATABASE_URL || 'postgresql://postgres:wande123@localhost:5432/postgres';
const TARGET_DB = process.env.TARGET_DB || 'medilink';

const client = new Client({ connectionString: ADMIN_DATABASE_URL });

try {
  await client.connect();
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${TARGET_DB}'`);
  if (res.rowCount === 0) {
    await client.query(`CREATE DATABASE ${TARGET_DB}`);
    console.log(`Created database: ${TARGET_DB}`);
  } else {
    console.log(`Database already exists: ${TARGET_DB}`);
  }
} finally {
  await client.end();
}
