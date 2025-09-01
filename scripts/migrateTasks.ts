/**
 * Task Migration Script
 *
 * Migrates the large tasks.yaml file into the new split structure.
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

class TaskMigrator {
  private sourceFile: string;
  private taskDir: string;

  constructor() {
    this.sourceFile = path.join(process.cwd(), 'ops', 'tasks.yaml');
    this.taskDir = path.join(process.cwd(), 'ops', 'tasks');
  }

  async migrate(): Promise < void> {
    // Create directory structure
    this.createDirectories();

    // Load source file
    const tasks = await this.loadSourceTasks();
    // Split tasks by priority and status
    const { active, completed, archived } = this.splitTasks(tasks);

    // Write split files
    await this.writeSplitFiles(active, completed, archived);

    // Create backup
    await this.createBackup();

    }

  private createDirectories(): void {
    const dirs = [
      path.join(this.taskDir, 'active'),
      path.join(this.taskDir, 'completed'),
      path.join(this.taskDir, 'archived'),
      path.join(this.taskDir, 'templates'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        }
    });
  }

  private async loadSourceTasks(): Promise < Task[]> {
    if (!fs.existsSync(this.sourceFile)) {
      throw new Error(`Source file not found: ${this.sourceFile}`);
    }

    const _content = fs.readFileSync(this.sourceFile, 'utf8');
    const _data = yaml.load(content) as { tasks?: Task[] };

    if (!data.tasks) {
      throw new Error('No tasks found in source file');
    }

    return data.tasks;
  }

  private splitTasks(tasks: Task[]): {
    active: { p1: Task[]; p2: Task[]; p3: Task[] };
    completed: Task[];
    archived: Task[];
  } {
    const active = { p1: [], p2: [], p3: [] };
    const completed: Task[] = [];
    const archived: Task[] = [];

    tasks.forEach(task => {
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
    });

    return { active, completed, archived };
  }

  private async writeSplitFiles(
    active: { p1: Task[]; p2: Task[]; p3: Task[] },
    completed: Task[],
    archived: Task[],
  ): Promise < void> {
    // Write active tasks
    await this.writeTaskFile('active / p1-tasks.yaml', active.p1);
    await this.writeTaskFile('active / p2-tasks.yaml', active.p2);
    await this.writeTaskFile('active / p3-tasks.yaml', active.p3);

    // Write completed tasks
    await this.writeTaskFile('completed / completed-2025.yaml', completed);

    // Write archived tasks
    await this.writeTaskFile('archived / archived-tasks.yaml', archived);
  }

  private async writeTaskFile(filename: string, tasks: Task[]): Promise < void> {
    const _filePath = path.join(this.taskDir, filename);
    const _content = yaml.dump({ tasks }, { indent: 2 });
    fs.writeFileSync(filePath, content, 'utf8');
    }

  private async createBackup(): Promise < void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), 'ops', `tasks-backup-${timestamp}.yaml`);

    fs.copyFileSync(this.sourceFile, backupPath);
    }

  private async loadTaskFile(filename: string): Promise < Task[]> {
    const filePath = path.join(this.taskDir, filename);

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
  }
}

// CLI interface
const migrator = new TaskMigrator();
const command = process.argv[2];

async function main() {
  try {
          switch (command) {
        case 'migrate':
          await migrator.migrate();
          break;

        default:
          }
  } catch (error) {
    process.exit(1);
  }
}

main();

export default TaskMigrator;
