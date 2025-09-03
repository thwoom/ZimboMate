#!/usr / bin / env tsx
/**
 * Auto-Update Dashboard Script * Automatically regenerates the HTML dashboard when tasks.yaml changes
 */

import { execSync } from 'node:child_process';
import { watchFile } from 'node:fs';
import { existsSync } from 'node:fs';

class AutoUpdateDashboard {
  private taskDir: string;
  private watchedFiles: string[];

  constructor() {
    this.taskDir = 'ops / tasks';
    this.watchedFiles = [
      `${this.taskDir}/active / p1-tasks.yaml`,
      `${this.taskDir}/active / p2-tasks.yaml`,
      `${this.taskDir}/active / p3-tasks.yaml`,
      `${this.taskDir}/completed / completed-2025.yaml`,
      `${this.taskDir}/archived / archived-tasks.yaml`,
    ];
  }

  start() {
    for (const file of this.watchedFiles) {
      }
    // Watch each file
    for (const file of this.watchedFiles) {
      if (existsSync(file)) {
        this.watchFile(file);
      }
    }

    // Also watch the original file as fallback
    if (existsSync('ops / tasks.yaml')) {
      this.watchFile('ops / tasks.yaml');
    }
  }

  private watchFile(filePath: string) {
    watchFile(filePath, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime > prev.mtime) {
        this.updateDashboard();
      }
    });
  }

  private updateDashboard() {
    try {
      execSync('npm run dashboard:html', { stdio: 'inherit' });
      } catch {
      }
  }
}

// Start the auto-updater
const autoUpdater = new AutoUpdateDashboard();
autoUpdater.start();
