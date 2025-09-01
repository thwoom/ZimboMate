#!/usr / bin / env tsx
/**
 * Auto-Update Dashboard Script * Automatically regenerates the HTML dashboard when tasks.yaml changes
 */

import { watchFile } from 'fs';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

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
    this.watchedFiles.forEach(file => {
      });
    // Watch each file
    this.watchedFiles.forEach(file => {
      if (existsSync(file)) {
        this.watchFile(file);
      }
    });

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
      } catch (error) {
      }
  }
}

// Start the auto-updater
const autoUpdater = new AutoUpdateDashboard();
autoUpdater.start();
