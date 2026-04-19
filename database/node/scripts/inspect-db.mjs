import pg from 'pg';

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:wande123@localhost:5432/medilink';

const client = new Client({ connectionString: DATABASE_URL });

try {
  await client.connect();
  const tables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name",
  );
  console.log('tables:', tables.rows.map((r) => r.table_name));

  const usersCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position",
  );
  console.log('users columns:', usersCols.rows.map((r) => r.column_name));
} finally {
  await client.end();
}
