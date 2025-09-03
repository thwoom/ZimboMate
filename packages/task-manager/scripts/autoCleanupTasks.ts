#!/usr / bin / env tsx
/**
 * Automated Task Cleanup Script * Automatically removes duplicate tasks and keeps the best version of each
 */

import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import YAML from 'yaml';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  intent?: string;
  deps?: string[];
  labels?: string[];
  steps?: string[];
  acceptance?: string[];
  artifacts?: string[];
  done_at?: string;
  [key: string]: unknown;
}

class AutoTaskCleanup {
  private tasks: Task[] = [];
  private cleanedTasks: Task[] = [];
  private removedTasks: Task[] = [];

  constructor() {
    this.loadTasks();
  }

  private loadTasks() {
    try {
      const content = readFileSync('ops / tasks.yaml', 'utf8');
      const doc = YAML.parse(content);
      this.tasks = doc.tasks || [];
      } catch (error) {
      process.exit(1);
    }
  }

  private normalizeTitle(title: string): string {
    return title?.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || '';
  }

  private getBestTask(tasks: Task[]): Task {
    // Priority order: done>completed>in_progress > open
    const statusPriority = { 'done': 0, 'completed': 1, 'in_progress': 2, 'open': 3 };

    // Priority order: P0 > P1 > P2 > P3
    const priorityRank = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };

    return tasks.sort((a, b) => {
      // First, prefer completed tasks
      const statusDiff = (statusPriority[a.status] || 99)-(statusPriority[b.status] || 99);
      if (statusDiff !== 0) return statusDiff;

      // Then prefer higher priority
      const priorityDiff = (priorityRank[a.priority] || 99)-(priorityRank[b.priority] || 99);
      if (priorityDiff !== 0) return priorityDiff;

      // Finally, prefer tasks with more content (steps, acceptance criteria)
      const aContent = (a.steps?.length || 0) + (a.acceptance?.length || 0) + (a.artifacts?.length || 0);
      const bContent = (b.steps?.length || 0) + (b.acceptance?.length || 0) + (b.artifacts?.length || 0);
      return bContent-aContent;
    })[0];
  }

  private isObviouslyOutdated(task: Task): boolean {
    const _title = task.title?.toLowerCase() || '';

    // Remove research / study tasks that are likely complete
    if ((title.includes('study') || title.includes('research')) && task.status === 'open') {
      return true;
    }

    // Remove vague phase completion tasks
    if (title.includes('complete phase') && !title.includes('specific')) {
      return true;
    }

    // Remove reference tasks that are likely complete
    if (title.includes('dungeonpaper features overview') ||
        title.includes('d & d beyond sheet redesign') ||
        title.includes('roll20 official dungeon world sheet reference')) {
      return true;
    }

    return false;
  }

  public performCleanup() {
    // Group tasks by normalized title
    const titleGroups = new Map < string, Task[]>();

    this.tasks.forEach(task => {
      const normalizedTitle = this.normalizeTitle(task.title);
      if (!normalizedTitle) return;

      // Skip obviously outdated tasks
      if (this.isObviouslyOutdated(task)) {
        this.removedTasks.push(task);
        return;
      }

      if (!titleGroups.has(normalizedTitle)) {
        titleGroups.set(normalizedTitle, []);
      }
      titleGroups.get(normalizedTitle)!.push(task);
    });

    // Process each group
    titleGroups.forEach((tasks, normalizedTitle) => {
      if (tasks.length === 1) {
        // No duplicates, keep the task
        this.cleanedTasks.push(tasks[0]);
      } else {
        // Multiple tasks with same title-keep the best one
        const bestTask = this.getBestTask(tasks);
        this.cleanedTasks.push(bestTask);

        const duplicates = tasks.filter(t => t.id !== bestTask.id);
        this.removedTasks.push(...duplicates);

        `);
        duplicates.forEach(dup => {
          `);
        });
        }
    });

    * 100)}%\n`);
  }

  public saveCleanedTasks() {
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `ops / tasks-backup-${timestamp}.yaml`;
    copyFileSync('ops / tasks.yaml', backupPath);
    // Sort cleaned tasks by ID
    this.cleanedTasks.sort((a, b) => {
      const aNum = parseInt(a.id.replace('T-', ''));
      const bNum = parseInt(b.id.replace('T-', ''));
      return aNum-bNum;
    });

    // Save cleaned tasks
    const cleanedDoc = { tasks: this.cleanedTasks };
    const yaml = YAML.stringify(cleanedDoc, { indent: 2 });
    writeFileSync('ops / tasks.yaml', yaml, 'utf8');

    }

  public generateReport() {
    const finishedTasks = this.cleanedTasks.filter(t => ['done', 'completed'].includes(t.status)).length;
    const _actualProgress = Math.round((finishedTasks / this.cleanedTasks.length) * 100 * 10) / 10;

    }

  public async run() {
    this.performCleanup();
    this.saveCleanedTasks();
    this.generateReport();
  }
}

const cleanup = new AutoTaskCleanup();
cleanup.run().catch(console.error);
