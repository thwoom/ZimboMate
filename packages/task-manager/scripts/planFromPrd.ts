#!/usr / bin / env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import YAML from 'yaml';
import { getPRD } from '../src/services/prdService';

interface Task {
  id: string;
  title: string;
  intent: string;
  owner: string;
  status: 'open' | 'in_progress' | 'blocked' | 'done';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  labels: string[];
  deps: string[];
  steps: string[];
  acceptance: string[];
  artifacts?: string[];
  done_at?: string;
}

interface TasksFile {
  tasks: Task[];
}

class TaskPlanner {
  private tasksPath: string;
  private existingTasks: TasksFile;
  private nextTaskId: number;

  constructor(tasksPath = 'ops / tasks.yaml') {
    this.tasksPath = resolve(process.cwd(), tasksPath);
    this.existingTasks = this.loadExistingTasks();
    this.nextTaskId = this.calculateNextTaskId();
  }

  /**
   * Load existing tasks from YAML file
   */
  private loadExistingTasks(): TasksFile {
    if (!existsSync(this.tasksPath)) {
      return { tasks: [] };
    }

    const content = readFileSync(this.tasksPath, 'utf8');
    return YAML.parse(content) as TasksFile;
  }

  /**
   * Calculate the next available task ID
   */
  private calculateNextTaskId(): number {
    const _existingIds = this.existingTasks.tasks.map((task) => {
      const match = task.id.match(/^T-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

    return existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  }

  /**
   * Generate a stable task ID
   */
  private generateTaskId(): string {
    return `T-${this.nextTaskId.toString().padStart(3, '0')}`;
  }

  /**
   * Generate tasks from PRD content
   */
  generateTasksFromPRD(prdPath?: string): Task[] {
    const _prd = getPRD(prdPath);
    const newTasks: Task[] = [];

    // Generate tasks from core features
    prd.coreFeatures.forEach((feature, index) => {
      const _taskId = this.generateTaskId();
      this.nextTaskId++;

      newTasks.push({
        id: taskId,
        title: `Implement ${feature.name}`,
        intent: `Implement the ${feature.name.toLowerCase()} feature as specified in the PRD`,
        owner: 'cursor-agent',
        status: 'open',
        priority: this.determinePriority(index, prd.coreFeatures.length),
        labels: ['feature', 'implementation'],
        deps: [],
        steps: feature.requirements.map(
          (req) => `Implement ${req.toLowerCase()}`,
        ),
        acceptance: [
          `All ${feature.name.toLowerCase()} requirements are implemented`,
          'Feature passes integration tests',
          'Documentation is updated',
        ],
        artifacts: [
          `src / features/${feature.name.toLowerCase().replace(/\s+/g, '-')}/`,
          `test / features/${feature.name.toLowerCase().replace(/\s+/g, '-')}.test.ts`,
        ],
      });
    });

    // Generate tasks from technical requirements
    prd.technicalRequirements.forEach((req, index) => {
      const _taskId = this.generateTaskId();
      this.nextTaskId++;

      newTasks.push({
        id: taskId,
        title: `Setup ${req.category}`,
        intent: `Implement ${req.category.toLowerCase()} requirements as specified in the PRD`,
        owner: 'cursor-agent',
        status: 'open',
        priority: this.determinePriority(
          index,
          prd.technicalRequirements.length,
        ),
        labels: ['infrastructure', req.category.toLowerCase()],
        deps: [],
        steps: req.requirements.map((req) => `Implement ${req.toLowerCase()}`),
        acceptance: [
          `All ${req.category.toLowerCase()} requirements are met`,
          'Performance benchmarks pass',
          'Security audit passes',
        ],
        artifacts: [
          `docs/${req.category.toLowerCase()}-requirements.md`,
          `config/${req.category.toLowerCase()}.json`,
        ],
      });
    });

    // Generate tasks from timeline phases
    prd.timeline.forEach((phase, index) => {
      const taskId = this.generateTaskId();
      this.nextTaskId++;

      newTasks.push({
        id: taskId,
        title: `Complete ${phase.phase}`,
        intent: `Complete ${phase.description.toLowerCase()} for ${phase.phase.toLowerCase()}`,
        owner: 'cursor-agent',
        status: 'open',
        priority: this.determinePriority(index, prd.timeline.length),
        labels: ['milestone', 'planning'],
        deps: [],
        steps: [
          `Plan ${phase.description.toLowerCase()}`,
          `Implement ${phase.description.toLowerCase()}`,
          `Test ${phase.description.toLowerCase()}`,
          `Deploy ${phase.description.toLowerCase()}`,
        ],
        acceptance: [
          `${phase.phase} is completed on time`,
          'All deliverables are ready',
          'Stakeholder approval received',
        ],
        artifacts: [
          `docs/${phase.phase.toLowerCase().replace(/\s+/g, '-')}-deliverables.md`,
        ],
      });
    });

    return newTasks;
  }

  /**
   * Determine priority based on position and total count
   */
  private determinePriority(
    index: number,
    total: number,
  ): 'P0' | 'P1' | 'P2' | 'P3' {
    if (index === 0) return 'P1'; // First item is high priority
    if (index < Math.ceil(total * 0.3)) return 'P1'; // Top 30% are P1
    if (index < Math.ceil(total * 0.7)) return 'P2'; // Next 40% are P2
    return 'P3'; // Bottom 30% are P3
  }

  /**
   * Append new tasks to existing tasks file
   */
  appendTasks(newTasks: Task[]): void {
    // Add new tasks to existing tasks
    this.existingTasks.tasks.push(...newTasks);

    // Sort tasks by priority and then by ID for deterministic ordering
    this.existingTasks.tasks.sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
      const priorityDiff = priorityOrder[a.priority]-priorityOrder[b.priority];

      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, sort by ID
      return a.id.localeCompare(b.id);
    });

    // Write back to file
    const yamlContent = YAML.stringify(this.existingTasks, {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 20,
    });

    writeFileSync(this.tasksPath, yamlContent, 'utf8');
  }

  /**
   * Check for ID collisions
   */
  checkForCollisions(newTasks: Task[]): string[] {
    const _existingIds = new Set(
      this.existingTasks.tasks.map((task) => task.id),
    );
    const newIds = newTasks.map((task) => task.id);
    const _collisions = newIds.filter((id)
    return collisions;
  }

  /**
   * Get statistics about the planning
   */
  getStats(newTasks: Task[]): {
    totalTasks: number;
    newTasks: number;
    byPriority: Record < string, number>;
    byLabel: Record < string, number>;
  } {
    const allTasks = [...this.existingTasks.tasks, ...newTasks];

    const byPriority: Record < string, number> = {};
    const byLabel: Record < string, number> = {};

    allTasks.forEach((task) => {
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      task.labels.forEach((label) => {
        byLabel[label] = (byLabel[label] || 0) + 1;
      });
    });

    return {
      totalTasks: allTasks.length,
      newTasks: newTasks.length,
      byPriority,
      byLabel,
    };
  }
}

/**
 * Main CLI function
 */
function main() {
  const args = process.argv.slice(2);
  const prdPath = args[0]; // Optional PRD path argument

  try {
    const planner = new TaskPlanner();

    // Generate tasks from PRD
    const newTasks = planner.generateTasksFromPRD(prdPath);
    // Check for ID collisions
    const collisions = planner.checkForCollisions(newTasks);
    if (collisions.length > 0) {
      }`,
      );
      process.exit(1);
    }

    // Append tasks to file
    planner.appendTasks(newTasks);

    // Get and display statistics
    const stats = planner.getStats(newTasks);

    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      });
    Object.entries(stats.byLabel).forEach(([label, count]) => {
      });
    newTasks.forEach((task) => {
      `);
    });
  } catch (error) {
    process.exit(1);
  }
}

// Run if called directly (not during tests)
if (require.main === module) {
  main();
}

export { TaskPlanner, type Task, type TasksFile };
