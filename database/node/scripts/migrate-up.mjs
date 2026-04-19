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

  for (const file of filesInOrder) {
    const fullPath = path.join(migrationsDir, file);
    const sql = await fs.readFile(fullPath, 'utf8');
    // eslint-disable-next-line no-console
    console.log(`Applying ${file} ...`);
    await client.query(sql);
    // eslint-disable-next-line no-console
    console.log(`Applied ${file}`);
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

