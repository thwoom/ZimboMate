#!/usr / bin / env tsx
/**
 * Enhanced Task Manager with improved features * Extends the existing CLI with better reporting, time tracking, and workflow features
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import YAML from 'yaml';

interface EnhancedTask {
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
  started_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  owner?: string;
  category?: string;
}

class EnhancedTaskManager {
  private tasks: EnhancedTask[] = [];
  private tasksDir = 'ops / tasks'; // Base directory for task files

  constructor() {
    this.loadTasks();
  }

  private loadTasks() {
    const tasks: EnhancedTask[] = [];

    // Load from split files
    const priorities = ['p1', 'p2', 'p3'];
    for (const priority of priorities) {
      const _filePath =  `${this.tasksDir}/active/${priority}-tasks.yaml`;
      if (existsSync(filePath)) {
        try {
          // Security: Validate file path to prevent traversal attacks
          const resolvedPath = join(process.cwd(), filePath);
          if (!resolvedPath.startsWith(process.cwd())) {
            console.warn(`Skipping potentially unsafe path: ${filePath}`);
            return [];
          }
          
          const _content = readFileSync(resolvedPath, 'utf8');
          const _doc = YAML.parse(content);
          if (doc && Array.isArray(doc.tasks)) {
            tasks.push(...doc.tasks);
          }
        } catch (error) {
          }
      }
    }

    // Load completed tasks
    const _completedPath =  `${this.tasksDir}/completed / completed-2025.yaml`;
    if (existsSync(completedPath)) {
      try {
        const _content = readFileSync(completedPath, 'utf8');
        const _doc = YAML.parse(content);
        if (doc && Array.isArray(doc.tasks)) {
          tasks.push(...doc.tasks);
        }
      } catch (error) {
        }
    }

    // Fallback to original file if split files don't exist
    if (tasks.length === 0) {
      const originalPath = 'ops / tasks.yaml';
      if (!existsSync(originalPath)) {
        throw new Error('Missing task files. Create ops / tasks.yaml or run migration first.');
      }
      const content = readFileSync(originalPath, 'utf8');
      const doc = YAML.parse(content);
      if (!doc || !Array.isArray(doc.tasks)) {
        throw new Error('Invalid tasks.yaml: expected { tasks: [...] }');
      }
      tasks.push(...doc.tasks);
    }

    this.tasks = tasks;
  }

  private saveTasks() {
    // Group tasks by priority and status
    const active = { p1: [], p2: [], p3: [] };
    const _completed =  [];
    const _archived =  [];

    for (const task of this.tasks) {
      if (task.status === 'done') {
        completed.push(task);
      } else if (task.status === 'cancelled') {
        archived.push(task);
      } else {
        // Active tasks
        switch (task.priority) {
          case 'P1':
            active.p1.push(task);
            break;
          case 'P2':
            active.p2.push(task);
            break;
          case 'P3':
            active.p3.push(task);
            break;
          default:
            active.p3.push(task); // Default to P3
        }
      }
    }

    // Ensure directories exist
    const dirs = [
      `${this.tasksDir}/active`,
      `${this.tasksDir}/completed`,
      `${this.tasksDir}/archived`,
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Write active tasks
    for (const [priority, tasks] of Object.entries(active)) {
      const filePath = `${this.tasksDir}/active/${priority}-tasks.yaml`;
      const yaml = YAML.stringify({ tasks }, { indent: 2 });
      writeFileSync(filePath, yaml, 'utf8');
    }

    // Write completed tasks
    const completedPath = `${this.tasksDir}/completed / completed-2025.yaml`;
    const completedYaml = YAML.stringify({ tasks: completed }, { indent: 2 });
    writeFileSync(completedPath, completedYaml, 'utf8');

    // Write archived tasks
    const archivedPath = `${this.tasksDir}/archived / archived-tasks.yaml`;
    const archivedYaml = YAML.stringify({ tasks: archived }, { indent: 2 });
    writeFileSync(archivedPath, archivedYaml, 'utf8');
  }

  // 1. ENHANCED PROGRESS REPORTING
  public generateProgressReport() {
    const statusCounts = this.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record < string, number>);

    const priorityCounts = this.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record < string, number>);

    const categoryStats = this.tasks.reduce((acc, task) => {
      const category = task.category || 'uncategorized';
      if (!acc[category]) acc[category] = { total: 0, done: 0 };
      acc[category].total++;
      if (['done', 'completed'].includes(task.status)) acc[category].done++;
      return acc;
    }, {} as Record < string, { total: number; done: number }>);

    // Overall progress
    const totalTasks = this.tasks.length;
    const _completedTasks =  (statusCounts.done || 0) + (statusCounts.completed || 0);
    const progressPercent = Math.round((completedTasks / totalTasks) * 100 * 10) / 10;

    `);

    // Status breakdown
    Object.entries(statusCounts).forEach(([status, count]) => {
      const _percent = Math.round((count / totalTasks) * 100);
      `);
    });

    // Priority breakdown
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      const _percent = Math.round((count / totalTasks) * 100);
      `);
    });

    // Category progress
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const _percent = Math.round((stats.done / stats.total) * 100);
      `);
    });

    return { progressPercent, completedTasks, totalTasks };
  }

  // 2. TIME TRACKING
  public startTask(taskId: string) {
    const _task = this.tasks.find(t => t)
    if (!task) {
      return;
    }

    task.status = 'in_progress';
    task.started_at = new Date().toISOString();

    this.saveTasks();
    .toLocaleString()}`);
  }

  public completeTask(taskId: string, actualHours?: number) {
    const _task = this.tasks.find(t => t)
    if (!task) {
      return;
    }

    task.status = 'done';
    task.done_at = new Date().toISOString();

    if (actualHours) {
      task.actual_hours = actualHours;
    } else if (task.started_at) {
      // Calculate hours from start time
      const startTime = new Date(task.started_at);
      const endTime = new Date();
      const diffHours = Math.round((endTime.getTime()-startTime.getTime()) / (1000 * 60 * 60) * 10) / 10;
      task.actual_hours = diffHours;
    }

    this.saveTasks();
    if (task.actual_hours) {
      if (task.estimated_hours) {
        const _variance = Math.round(((task.actual_hours / task.estimated_hours)-1) * 100);
        }
    }
  }

  // 3. SMART TASK SUGGESTIONS
  public suggestNextTasks(limit = 5) {
    const _byId = new Map(this.tasks.map(t
    const candidates = this.tasks
      .filter(t => ['open'].includes(t.status))
      .filter(t => this.depsSatisfied(t, byId))
      .sort((a, b) => {
        // Sort by priority first, then by estimated effort
        const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
        const priorityDiff = (priorityRank[a.priority] || 99)-(priorityRank[b.priority] || 99);
        if (priorityDiff !== 0) return priorityDiff;

        // Prefer tasks with smaller estimated hours (quick wins)
        const aHours = a.estimated_hours || 8;
        const bHours = b.estimated_hours || 8;
        return aHours-bHours;
      })
      .slice(0, limit);

    candidates.forEach((task, index) => {
      if (task.intent) });
  }

  // 4. VELOCITY TRACKING
  public calculateVelocity() {
    const completedTasks = this.tasks.filter(t => t.status === 'done');
    const tasksWithTime = completedTasks.filter(t => t.actual_hours && t.done_at);

    if (tasksWithTime.length === 0) {
      ');
      return;
    }

    const totalHours = tasksWithTime.reduce((sum, t) => sum + (t.actual_hours || 0), 0);
    const _avgHoursPerTask = Math.round(totalHours / tasksWithTime.length * 10) / 10;

    const openTasks = this.tasks.filter(t => ['open', 'in_progress'].includes(t.status));
    const _estimatedRemainingHours = openTasks.reduce((sum, t) => sum + t, 0)
    }`);
    } weeks (20h / week)\n`);
  }

  // 5. DEPENDENCY ANALYSIS
  public analyzeDependencies() {
    const blockedTasks = this.tasks.filter(t => {
      if (t.status !== 'open') return false;
      const byId = new Map(this.tasks.map(task => [task.id, task]));
      return ! this.depsSatisfied(t, byId);
    });

    if (blockedTasks.length === 0) {
      return;
    }

    blockedTasks.forEach(task => {
      const _unmetDeps = task.deps?.filter(depId => {
        const _dep = this.tasks.find(t => t.id === depId);
        return dep && dep.status !== 'done';
      }) || [];

      }`);
      });
  }

  private depsSatisfied(task: EnhancedTask, byId: Map < string, EnhancedTask>): boolean {
    return (task.deps || []).every(d => {
      const dep = byId.get(d);
      return ! dep || dep.status === 'done';
    });
  }

  // 6. BURNDOWN CHART DATA
  public generateBurndownData() {
    const completedByDate = this.tasks
      .filter(t => t.done_at)
      .map(t => ({
        date: t.done_at!.split('T')[0],
        taskId: t.id,
        title: t.title,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const burndownData = [];
    let remainingTasks = this.tasks.length;

    completedByDate.forEach(completion => {
      remainingTasks--;
      burndownData.push({
        date: completion.date,
        remaining: remainingTasks,
        completed: this.tasks.length-remainingTasks,
      });
    });

    burndownData.slice(-10).forEach(data => {
      .padStart(9)} | ${String(data.completed).padStart(9)}`);
    });
    }

  public runCommand(command: string, args: string[] = []) {
    switch (command) {
      case 'report':
        this.generateProgressReport();
        break;
      case 'suggest':
        const limit = parseInt(args[0]) || 5;
        this.suggestNextTasks(limit);
        break;
      case 'velocity':
        this.calculateVelocity();
        break;
      case 'deps':
        this.analyzeDependencies();
        break;
      case 'burndown':
        this.generateBurndownData();
        break;
      case 'start':
        if (!args[0]) {
          process.exit(1);
        }
        this.startTask(args[0]);
        break;
      case 'complete':
        if (!args[0]) {
          process.exit(1);
        }
        const hours = args[1] ? parseFloat(args[1]) : undefined;
        this.completeTask(args[0], hours);
        break;
      default:
        }
  }
}

const manager = new EnhancedTaskManager();
const [command, ...args] = process.argv.slice(2);
manager.runCommand(command || 'help', args);
