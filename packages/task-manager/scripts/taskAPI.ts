#!/usr/bin/env tsx

import { EnhancedTaskManager } from './enhancedTaskManager.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Task API for web dashboard integration
 * Provides HTTP-like interface for task operations
 */

export class TaskAPI {
  private taskManager: EnhancedTaskManager;

  constructor() {
    this.taskManager = new EnhancedTaskManager();
  }

  /**
   * Update task status with proper validation and logging
   */
  async updateTaskStatus(taskId: string, newStatus: 'open' | 'in_progress' | 'done' | 'blocked'): Promise<{success: boolean, message: string, task?: any}> {
    try {
      // Get current task
      const currentTask = this.taskManager.getTask(taskId);
      if (!currentTask) {
        return {
          success: false,
          message: `Task ${taskId} not found`
        };
      }

      // Validate status transition
      const validTransition = this.validateStatusTransition(currentTask.status, newStatus);
      if (!validTransition.valid) {
        return {
          success: false,
          message: validTransition.reason
        };
      }

      // Prepare updates
      const updates: any = { status: newStatus };
      
      // Add timestamps
      if (newStatus === 'in_progress' && !currentTask.started_at) {
        updates.started_at = new Date().toISOString();
      }
      
      if (newStatus === 'done') {
        updates.done_at = new Date().toISOString();
      }

      // Update task
      const success = this.taskManager.updateTask(taskId, updates);
      
      if (success) {
        const updatedTask = this.taskManager.getTask(taskId);
        return {
          success: true,
          message: `Task ${taskId} status updated to ${newStatus}`,
          task: updatedTask
        };
      } else {
        return {
          success: false,
          message: `Failed to update task ${taskId}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): {valid: boolean, reason: string} {
    const transitions: Record<string, string[]> = {
      'open': ['in_progress', 'blocked'],
      'in_progress': ['done', 'blocked', 'open'],
      'blocked': ['open', 'in_progress'],
      'done': ['open'] // Allow reopening completed tasks
    };

    if (!transitions[currentStatus]?.includes(newStatus)) {
      return {
        valid: false,
        reason: `Invalid transition from ${currentStatus} to ${newStatus}`
      };
    }

    return { valid: true, reason: '' };
  }

  /**
   * Create new task
   */
  async createTask(taskData: {
    title: string;
    intent: string;
    priority: 'P0' | 'P1' | 'P2' | 'P3';
    estimated_hours?: number;
    labels?: string[];
    deps?: string[];
  }): Promise<{success: boolean, message: string, taskId?: string}> {
    try {
      // Generate new task ID
      const existingTasks = this.taskManager.getAllTasks();
      const maxId = existingTasks.reduce((max, task) => {
        const match = task.id.match(/T-(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0);
      const newTaskId = `T-${String(maxId + 1).padStart(3, '0')}`;

      // Create task object
      const newTask = {
        id: newTaskId,
        title: taskData.title,
        intent: taskData.intent,
        status: 'open' as const,
        priority: taskData.priority,
        owner: 'dashboard-user',
        labels: taskData.labels || [],
        deps: taskData.deps || [],
        estimated_hours: taskData.estimated_hours,
        steps: [],
        acceptance: [],
        artifacts: []
      };

      // Add to YAML file directly (since EnhancedTaskManager might not have addTask method)
      const yamlPath = join(process.cwd(), 'ops', 'tasks.yaml');
      const yamlContent = readFileSync(yamlPath, 'utf8');
      const yamlData = JSON.parse(JSON.stringify(require('yaml').parse(yamlContent)));
      
      yamlData.tasks.push(newTask);
      
      const newYamlContent = require('yaml').stringify(yamlData);
      writeFileSync(yamlPath, newYamlContent, 'utf8');

      return {
        success: true,
        message: `Task ${newTaskId} created successfully`,
        taskId: newTaskId
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creating task: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Bulk update task statuses
   */
  async bulkUpdateStatus(taskIds: string[], newStatus: 'open' | 'in_progress' | 'done' | 'blocked'): Promise<{success: boolean, message: string, results: any[]}> {
    const results = [];
    let successCount = 0;

    for (const taskId of taskIds) {
      const result = await this.updateTaskStatus(taskId, newStatus);
      results.push({ taskId, ...result });
      if (result.success) successCount++;
    }

    return {
      success: successCount > 0,
      message: `Updated ${successCount}/${taskIds.length} tasks to ${newStatus}`,
      results
    };
  }

  /**
   * Search tasks by title and description
   */
  searchTasks(query: string): any[] {
    const allTasks = this.taskManager.getAllTasks();
    const lowercaseQuery = query.toLowerCase();
    
    return allTasks.filter(task => 
      task.title.toLowerCase().includes(lowercaseQuery) ||
      task.intent?.toLowerCase().includes(lowercaseQuery) ||
      task.id.toLowerCase().includes(lowercaseQuery) ||
      (task.labels && task.labels.some(label => label.toLowerCase().includes(lowercaseQuery)))
    );
  }

  /**
   * Get all tasks (for dashboard)
   */
  getAllTasks(): any[] {
    return this.taskManager.getAllTasks();
  }
}

// CLI interface for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const api = new TaskAPI();
  const command = process.argv[2];
  const taskId = process.argv[3];
  const newStatus = process.argv[4] as any;

  if (command === 'update-status' && taskId && newStatus) {
    api.updateTaskStatus(taskId, newStatus).then(result => {
          console.log(JSON.stringify(result, null, 2));
        }).catch($ERROR => {
      console.error('Promise error:', $ERROR);
    });
  } else if (command === 'search' && taskId) {
    const results = api.searchTasks(taskId);
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('Usage:');
    console.log('  npm run task-api update-status <taskId> <newStatus>');
    console.log('  npm run task-api search <query>');
  }
}
