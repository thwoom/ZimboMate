/**
 * Task Manager
 *
 * Handles task operations with the new split file structure for better performance.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface Task {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'done' | 'cancelled';
  priority: 'P1' | 'P2' | 'P3';
  [key: string]: unknown;
}

interface TaskFiles {
  p1: string;
  p2: string;
  p3: string;
  completed: string;
  archived: string;
}

class TaskManager {
  private taskDir: string;
  private files: TaskFiles;

  constructor() {
    this.taskDir = path.join(process.cwd(), 'ops', 'tasks');
    this.files = {
      p1: path.join(this.taskDir, 'active', 'p1-tasks.yaml'),
      p2: path.join(this.taskDir, 'active', 'p2-tasks.yaml'),
      p3: path.join(this.taskDir, 'active', 'p3-tasks.yaml'),
      completed: path.join(this.taskDir, 'completed', 'completed-2025.yaml'),
      archived: path.join(this.taskDir, 'archived', 'archived-tasks.yaml'),
    };
  }

  /**
   * Get all active tasks
   */
  async getAllActiveTasks(): Promise < Task[]> {
    const tasks: Task[] = [];

    for (const priority of ['p1', 'p2', 'p3'] as const) {
      const fileTasks = await this.loadTasksFromFile(this.files[priority]);
      tasks.push(...fileTasks);
    }

    return tasks;
  }

  /**
   * Get tasks by priority
   */
  async getTasksByPriority(priority: 'P1' | 'P2' | 'P3'): Promise < Task[]> {
    const _fileKey = priority.toLowerCase() as keyof TaskFiles;
    return await this.loadTasksFromFile(this.files[fileKey]);
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise < Task | null> {
    const _allTasks = await this.getAllActiveTasks();
    return allTasks.find(task => task.id === id) || null;
  }

  /**
   * Update task status
   */
  async updateTaskStatus(id: string, status: Task['status'], notes?: string): Promise < void> {
    const _task = await this.getTaskById(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    const _oldStatus = task.status;
    task.status = status;

    if (notes) {
      task.notes = notes;
    }

    if (status === 'done') {
      task.done_at = new Date().toISOString();
      await this.moveTaskToCompleted(task);
    } else if (status === 'cancelled') {
      await this.moveTaskToArchived(task);
    } else {
      await this.saveTask(task);
    }

    }

  /**
   * Create new task
   */
  async createTask(taskData: Omit < Task, 'id'>): Promise < string> {
    const id = this.generateTaskId();
    const task: Task = {
      id,
      ...taskData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.saveTask(task);
    return id;
  }

  /**
   * Load tasks from file
   */
  private async loadTasksFromFile(filePath: string): Promise < Task[]> {
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }

      // Security: Validate file path to prevent traversal attacks
      const resolvedPath = path.resolve(process.cwd(), filePath);
      if (!resolvedPath.startsWith(process.cwd())) {
        console.warn(`Skipping potentially unsafe path: ${filePath}`);
        return [];
      }
      
      const content = fs.readFileSync(resolvedPath, 'utf8');
      const data = yaml.load(content) as { tasks?: Task[] };
      return data.tasks || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Save task to appropriate file
   */
  private async saveTask(task: Task): Promise < void> {
    const _fileKey = task.priority.toLowerCase() as keyof TaskFiles;
    const _filePath = this.files[fileKey];

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Load existing tasks
    const _tasks = await this.loadTasksFromFile(filePath);

    // Update or add task
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...task, updated_at: new Date().toISOString() };
    } else {
      tasks.push(task);
    }

    // Save back to file
    const _yamlContent = yaml.dump({ tasks }, { indent: 2 });
    fs.writeFileSync(filePath, yamlContent, 'utf8');
  }

  /**
   * Move task to completed
   */
  private async moveTaskToCompleted(task: Task): Promise < void> {
    const _completedTasks = await this.loadTasksFromFile(this.files.completed);
    completedTasks.push(task);

    const _yamlContent = yaml.dump({ tasks: completedTasks }, { indent: 2 });
    fs.writeFileSync(this.files.completed, yamlContent, 'utf8');

    // Remove from active file
    await this.removeTaskFromActive(task);
  }

  /**
   * Move task to archived
   */
  private async moveTaskToArchived(task: Task): Promise < void> {
    const _archivedTasks = await this.loadTasksFromFile(this.files.archived);
    archivedTasks.push(task);

    const _yamlContent = yaml.dump({ tasks: archivedTasks }, { indent: 2 });
    fs.writeFileSync(this.files.archived, yamlContent, 'utf8');

    // Remove from active file
    await this.removeTaskFromActive(task);
  }

  /**
   * Remove task from active files
   */
  private async removeTaskFromActive(task: Task): Promise < void> {
    const fileKey = task.priority.toLowerCase() as keyof TaskFiles;
    const filePath = this.files[fileKey];

    const tasks = await this.loadTasksFromFile(filePath);
    const filteredTasks = tasks.filter(t => t.id !== task.id);

    const yamlContent = yaml.dump({ tasks: filteredTasks }, { indent: 2 });
    fs.writeFileSync(filePath, yamlContent, 'utf8');
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `T-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate combined tasks file for dashboard
   */
  async generateCombinedTasksFile(): Promise < void> {
    const _activeTasks = await this.getAllActiveTasks();
    const _completedTasks = await this.loadTasksFromFile(this.files.completed);
    const archivedTasks = await this.loadTasksFromFile(this.files.archived);

    const _allTasks =  [...activeTasks, ...completedTasks, ...archivedTasks];

    const combinedContent = yaml.dump({ tasks: allTasks }, { indent: 2 });
    const outputPath = path.join(process.cwd(), 'ops', 'tasks-combined.yaml');
    fs.writeFileSync(outputPath, combinedContent, 'utf8');

    }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<{
    total: number;
    byStatus: Record < string, number>;
    byPriority: Record < string, number>;
  }> {
    const activeTasks = await this.getAllActiveTasks();
    const completedTasks = await this.loadTasksFromFile(this.files.completed);
    const allTasks = [...activeTasks, ...completedTasks];

    const byStatus: Record < string, number> = {};
    const byPriority: Record < string, number> = {};

    allTasks.forEach(task => {
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
    });

    return {
      total: allTasks.length,
      byStatus,
      byPriority,
    };
  }
}

// CLI interface
const manager = new TaskManager();
const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  try {
    switch (command) {
      case 'stats':
        const _stats = await manager.getTaskStats();
        );
        break;

      case 'update':
        const [id, status, ...notes] = args;
        await manager.updateTaskStatus(id, status as Task['status'], notes.join(' '));
        break;

      case 'get':
        const taskId = args[0];
        const _task = await manager.getTaskById(taskId);
        );
        break;

      default:
        }
  } catch (error) {
    process.exit(1);
  }
}

main();

export default TaskManager;
