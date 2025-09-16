import { spawn } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const child = spawn(npmCmd, ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: false,
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});


