import net from 'node:net';
import { spawn } from 'node:child_process';
import { cpSync } from 'node:fs';
const mode = process.argv[2];
const port = Number(process.env.CRM_FRONTEND_PORT || 3008);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid CRM_FRONTEND_PORT');
const probe = net.createServer();
probe.on('error', () => { console.error(`Port ${port} is occupied. Set CRM_FRONTEND_PORT to a free port.`); process.exit(1); });
probe.listen(port, '127.0.0.1', () => probe.close(() => {
  if (mode === 'start') cpSync('.next/static', '.next/standalone/.next/static', { recursive: true });
  const args = mode === 'start' ? ['.next/standalone/server.js'] : ['node_modules/next/dist/bin/next', mode, '--hostname', '127.0.0.1', '--port', String(port)];
  const child = spawn(process.execPath, args, { stdio: 'inherit', env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1' } });
  child.on('exit', code => process.exit(code ?? 1));
}));
