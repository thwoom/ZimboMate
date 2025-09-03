#!/usr / bin / env tsx
/**
 * Quick task management helpers
 */

import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const command = args[0];
const taskId = args[1];

switch (command) {
  case 'start':
    if (!taskId) {
      process.exit(1);
    }
    execSync(`npm run tm:move -- --id ${taskId} --status in_progress`, { stdio: 'inherit' });
    break;

  case 'done':
    if (!taskId) {
      process.exit(1);
    }
    execSync(`npm run tm:move -- --id ${taskId} --status done`, { stdio: 'inherit' });
    break;

  case 'next':
    execSync('npm run tm:next', { stdio: 'inherit' });
    break;

  case 'audit':
    execSync('npm run audit-tasks', { stdio: 'inherit' });
    break;

  default:
    }
