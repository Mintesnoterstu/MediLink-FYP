import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, '../../migrations');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/run-migration-file.mjs <filename.sql>');
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
const client = new Client({ connectionString: databaseUrl });
try {
  await client.connect();
  await client.query(sql);
  console.log(`Applied ${file}`);
} finally {
  await client.end();
}
