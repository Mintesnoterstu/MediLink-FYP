import { execSync, spawn } from 'child_process';

const port = Number(process.env.PORT || 3001);

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

const child = spawn(process.execPath, ['src/server.js'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
