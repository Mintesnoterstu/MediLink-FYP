import { execSync, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const port = Number(process.env.PORT || 3001);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from workspace and API package so DATABASE_URL is available for migrations.
// API-level values override workspace-level values when both exist.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

function killPortWindows(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: 'utf8' });
    const pids = new Set();
    output
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      });

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`Stopped PID ${pid} on port ${targetPort}`);
      } catch {
        // ignore
      }
    }
  } catch {
    // no process on port
  }
}

function killPortUnix(targetPort) {
  try {
    const output = execSync(`lsof -ti tcp:${targetPort}`, { encoding: 'utf8' });
    const pids = output
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGKILL');
        console.log(`Stopped PID ${pid} on port ${targetPort}`);
      } catch {
        // ignore
      }
    }
  } catch {
    // no process on port
  }
}

if (process.platform === 'win32') {
  killPortWindows(port);
} else {
  killPortUnix(port);
}

// Ensure database schema is up-to-date before starting API.
try {
  const migratePath = path.resolve(__dirname, '../../../database/node/scripts/migrate-up.mjs');
  console.log('Applying database migrations...');
  execSync(`node "${migratePath}"`, { stdio: 'inherit' });
} catch (e) {
  console.error('Migration step failed. API will not start.');
  process.exit(1);
}

const child = spawn(process.execPath, ['src/server.js'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
