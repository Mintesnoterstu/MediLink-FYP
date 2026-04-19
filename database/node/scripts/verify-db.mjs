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

  const counts = await client.query(`
    SELECT
      (SELECT count(*) FROM zones) AS zones,
      (SELECT count(*) FROM woredas) AS woredas,
      (SELECT count(*) FROM facilities) AS facilities,
      (SELECT count(*) FROM users) AS users,
      (SELECT count(*) FROM patients) AS patients,
      (SELECT count(*) FROM diseases) AS diseases,
      (SELECT count(*) FROM medicines) AS medicines
  `);
  console.log('seed counts:', counts.rows[0]);
} finally {
  await client.end();
}
