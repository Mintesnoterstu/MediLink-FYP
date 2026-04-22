import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.resolve(__dirname, '../../migrations');

const filesInOrder = [
  '001_schema.up.sql',
  '002_rls.up.sql',
  '003_seed_geography.up.sql',
  '004_seed_demo_users.up.sql',
  '005_seed_diseases_medicines_sample.up.sql',
  '006_seed_full_catalog_minimums.up.sql',
  '007_patient_tracking_tables.up.sql',
  '008_auth_security_tables.up.sql',
  '009_seed_real_admin_accounts.up.sql',
  '010_seed_real_clinical_accounts.up.sql',
  '011_zonal_admin_support.up.sql',
  '012_woreda_city_admin_support.up.sql',
  '013_facility_admin_support.up.sql',
  '014_consent_flow_support.up.sql',
  '015_allow_nurse_rls.up.sql',
];

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // eslint-disable-next-line no-console
  console.error('DATABASE_URL is required. Example: postgresql://postgres:password@localhost:5432/medilink');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();
  // eslint-disable-next-line no-console
  console.log('Connected to PostgreSQL.');

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id serial PRIMARY KEY,
      filename text UNIQUE NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const file of filesInOrder) {
    const already = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1', [file]);
    if (already.rows[0]) {
      // eslint-disable-next-line no-console
      console.log(`Skipping ${file} (already applied)`);
      // eslint-disable-next-line no-continue
      continue;
    }
    const fullPath = path.join(migrationsDir, file);
    const sql = await fs.readFile(fullPath, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Applying ${file} ...`);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      // eslint-disable-next-line no-console
      console.log(`Applied ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      const msg = String(error?.message || '');
      const canTreatAsApplied =
        msg.includes('already exists') ||
        msg.includes('duplicate key') ||
        msg.includes('already applied') ||
        msg.includes('conflicts with existing constraint') ||
        msg.includes('constraint') && msg.includes('already exists');

      if (canTreatAsApplied) {
        // eslint-disable-next-line no-console
        console.warn(`Warning: ${file} reported existing objects. Marking as applied.`);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING', [file]);
        // eslint-disable-next-line no-continue
        continue;
      }
      throw error;
    }
  }

  // eslint-disable-next-line no-console
  console.log('All migrations and seeds applied successfully.');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

