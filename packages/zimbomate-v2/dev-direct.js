import { spawn } from 'node:child_process';

// Launch Vite directly without going through npm.cmd
const isWin = process.platform === 'win32';
const command = isWin ? 'node' : 'node';
const args = ['node_modules/vite/bin/vite.js'];

const child = spawn(command, args, {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});


