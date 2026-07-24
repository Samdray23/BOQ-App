import { execSync } from 'child_process';
import app from './app.js';
import { env } from './config/index.js';
import { initializeDatabase, closeDatabase } from './database/index.js';
import { startQueue, stopQueue } from './jobs/queue.js';

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown(1);
});

function gracefulShutdown(exitCode: number): void {
  console.log('\n[SERVER] Shutting down gracefully...');
  stopQueue();
  closeDatabase()
    .then(() => {
      console.log('[SERVER] Database pool closed');
      process.exit(exitCode);
    })
    .catch(() => {
      process.exit(exitCode);
    });
}

process.on('SIGINT', () => gracefulShutdown(0));
process.on('SIGTERM', () => gracefulShutdown(0));

interface PortOwner {
  pid: string;
  processName: string;
  commandLine: string;
}

function detectPortOwner(port: number): PortOwner | null {
  try {
    const isWin = process.platform === 'win32';
    let pid: string | null = null;

    if (isWin) {
      const netstat = execSync(`netstat -ano | findstr ":${port}"`, {
        encoding: 'utf-8',
        timeout: 5000,
      });
      const lines = netstat.split('\n').filter((l) => l.includes('LISTENING'));
      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/);
        pid = parts[parts.length - 1];
      }
    } else {
      const pids = execSync(`lsof -i :${port} -sTCP:LISTEN -t 2>/dev/null`, {
        encoding: 'utf-8',
        timeout: 5000,
      }).trim();
      if (pids) pid = pids.split('\n')[0];
    }

    if (!pid) return null;

    let processName = 'unknown';
    let commandLine = '';

    if (isWin) {
      try {
        const wmic = execSync(
          `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter 'ProcessId=${pid}' | Select-Object Name,CommandLine | ConvertTo-Json"`,
          { encoding: 'utf-8', timeout: 5000 }
        );
        const info = JSON.parse(wmic);
        processName = info.Name || 'unknown';
        commandLine = info.CommandLine || '';
      } catch {
        const tasklist = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
          encoding: 'utf-8',
          timeout: 5000,
        });
        const match = tasklist.match(/"([^"]+)"/);
        if (match) processName = match[1];
      }
    } else {
      try {
        processName = execSync(`ps -p ${pid} -o comm=`, {
          encoding: 'utf-8',
          timeout: 5000,
        }).trim();
        commandLine = execSync(`ps -p ${pid} -o args=`, {
          encoding: 'utf-8',
          timeout: 5000,
        }).trim();
      } catch {
        // process info unavailable
      }
    }

    return { pid, processName, commandLine };
  } catch {
    return null;
  }
}

function isBoqServer(owner: PortOwner): boolean {
  const name = owner.processName.toLowerCase();
  const cmd = owner.commandLine.toLowerCase();

  if (name !== 'node.exe' && name !== 'node' && name !== 'tsx' && name !== 'bun') return false;

  const indicators = ['boq', 'server/src/index.ts', 'server\\src\\index.ts', 'boq-ai-server'];
  return indicators.some((i) => cmd.includes(i));
}

async function main(): Promise<void> {
  try {
    console.log('Connecting to database...');
    await initializeDatabase();
    console.log('Database connected and schema verified');

    startQueue();
    console.log('Background job queue started');

    const server = app.listen(env.PORT);

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        const owner = detectPortOwner(env.PORT);

        if (owner && isBoqServer(owner)) {
          console.log(
            `\n  An existing BOQ development server is already running.\n\n` +
              `  No action required.\n\n` +
              `  API available at:\n` +
              `  http://localhost:${env.PORT}\n`
          );
          process.exit(0);
        }

        const lines = [
          `\n  Port ${env.PORT} is already occupied.`,
        ];

        if (owner) {
          lines.push(
            '',
            '  Detected process:',
            `    ${owner.processName} (PID ${owner.pid})`,
          );
        }

        lines.push(
          '',
          '  Possible causes:',
          '    - Another application is using this port',
          '    - A previous server instance was not shut down cleanly',
          '',
          '  Options:',
          '    1. Use the existing server already running on this port',
          '    2. Stop the occupying process manually:',
          owner
            ? `       Windows:  taskkill /PID ${owner.pid} /F`
            : `       Find the process and stop it`,
          `    3. Change PORT in server/.env`,
          '',
        );

        console.error(lines.join('\n'));
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });

    server.on('listening', () => {
      console.log(`\n  BOQ AI Server v1.0.0`);
      console.log(`  Listening at http://localhost:${env.PORT}`);
      console.log(`  API: http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`  Environment: ${env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
