#!/usr / bin / env tsx
/**
 * Task List Cleanup Script * Identifies duplicate, outdated, and unnecessary tasks for removal
 */

import { readFileSync, writeFileSync } from 'fs';
import YAML from 'yaml';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  intent?: string;
  deps?: string[];
  labels?: string[];
}

class TaskCleanup {
  private tasks: Task[] = [];
  private duplicates: { original: Task; duplicates: Task[] }[] = [];
  private outdated: Task[] = [];
  private unnecessary: Task[] = [];

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

  public findDuplicates() {
    const titleGroups = new Map < string, Task[]>();

    // Group tasks by title
    this.tasks.forEach(task => {
      const title = task.title?.toLowerCase().trim();
      if (!title) return;

      if (!titleGroups.has(title)) {
        titleGroups.set(title, []);
      }
      titleGroups.get(title)!.push(task);
    });

    // Find groups with multiple tasks (duplicates)
    titleGroups.forEach((tasks, title) => {
      if (tasks.length > 1) {
        // Sort by status priority (done > completed > in_progress > open)
        const statusPriority = { 'done': 0, 'completed': 1, 'in_progress': 2, 'open': 3 };
        tasks.sort((a, b) => (statusPriority[a.status] || 99)-(statusPriority[b.status] || 99));

        const [original, ...duplicates] = tasks;
        this.duplicates.push({ original, duplicates });

        `);
        duplicates.forEach(dup => {
          `);
        });
        }
    });

    }

  public findOutdatedTasks() {
    this.tasks.forEach(task => {
      // Look for obviously outdated tasks
      if (task.title?.includes('Complete Phase') && task.status === 'open') {
        this.outdated.push(task);
        `);
      }

      if (task.title?.includes('Study') || task.title?.includes('Research')) {
        this.outdated.push(task);
        `);
      }

      if (task.title?.includes('Setup') && task.status === 'open') {
        this.unnecessary.push(task);
        `);
      }
    });

    }

  public generateCleanupCommands() {
    if (this.duplicates.length > 0) {
      :');
      this.duplicates.forEach(({ original, duplicates }) => {
        duplicates.forEach(dup => {
          should be kept`);
        });
      });
      }

    const totalToRemove = this.duplicates.reduce((sum, group) => sum + group.duplicates.length, 0);
    const cleanedTotal = this.tasks.length-totalToRemove;
    const _actualProgress = Math.round((23 / cleanedTotal) * 100 * 10) / 10;

    \n`);
  }

  public async run() {
    this.findDuplicates();
    this.findOutdatedTasks();
    this.generateCleanupCommands();

    }
}

const cleanup = new TaskCleanup();
cleanup.run().catch(console.error);
