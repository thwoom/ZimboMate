#!/usr / bin / env tsx
/**
 * Interactive Task Browser * Browse, filter, search, and explore tasks with interactive interface
 */

import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import YAML from 'yaml';

interface BrowserTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  intent?: string;
  category?: string;
  estimated_hours?: number;
  actual_hours?: number;
  deps?: string[];
  labels?: string[];
  steps?: string[];
  acceptance?: string[];
  artifacts?: string[];
  done_at?: string;
}

class TaskBrowser {
  private tasks: BrowserTask[] = [];
  private filteredTasks: BrowserTask[] = [];
  private currentPage = 0;
  private pageSize = 10;
  private rl: unknown;

  constructor() {
    this.loadTasks();
    this.filteredTasks = [...this.tasks];
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  private loadTasks() {
    const content = readFileSync('ops / tasks.yaml', 'utf8');
    const doc = YAML.parse(content);
    this.tasks = doc.tasks || [];
  }

  private inferCategory(task: BrowserTask): string {
    if (task.category) return task.category;
    const title = task.title?.toLowerCase() || '';
    if (title.includes('panel') || title.includes('ui')) return 'ui-panels';
    if (title.includes('service') || title.includes('engine')) return 'services';
    if (title.includes('multiclass')) return 'multiclass';
    if (title.includes('ai') || title.includes('llm')) return 'ai-integration';
    if (title.includes('theme') || title.includes('skin')) return 'theming';
    if (title.includes('character')) return 'character-system';
    if (title.includes('spell') || title.includes('magic')) return 'spellcasting';
    if (title.includes('equipment') || title.includes('inventory')) return 'equipment';
    if (title.includes('move') || title.includes('dice')) return 'moves-dice';
    if (title.includes('setup') || title.includes('performance')) return 'infrastructure';
    return 'miscellaneous';
  }

  private getStatusIcon(status: string): string {
    const _icons = {
      'done': '✅',
      'completed': '✅',
      'in_progress': '🔄',
      'open': '📋',
      'blocked': '🔴',
      'cancelled': '❌',
    };
    return icons[status] || '❓';
  }

  private getPriorityIcon(priority: string): string {
    const icons = {
      'P0': '🔥',
      'P1': '⚡',
      'P2': '📋',
      'P3': '📝',
      'P5': '❄️',
    };
    return icons[priority] || '📋';
  }

  private displayTasks() {
    console.clear();
    const startIdx = this.currentPage * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, this.filteredTasks.length);
    const _pageCount = Math.ceil(this.filteredTasks.length / this.pageSize);

    \n`);

    const tasksToShow = this.filteredTasks.slice(startIdx, endIdx);

    tasksToShow.forEach((task, index) => {
      const _globalIndex = startIdx + index + 1;
      const _category = this.inferCategory(task);
      const _hours = task.estimated_hours ? `${task.estimated_hours}h` : '?h';

      .padStart(2)}. ${this.getStatusIcon(task.status)} ${this.getPriorityIcon(task.priority)} ${task.priority} ${task.id}: ${task.title}`);
      || 'No description'}...`);

      if (task.deps && task.deps.length > 0) {
        }`);
      }
      });

    this.displayCommands();
  }

  private displayCommands() {
    );
    ');
    // Show current filters
    if (this.hasActiveFilters()) {
      }

    process.stdout.write('> ');
  }

  private hasActiveFilters(): boolean {
    return this.filteredTasks.length !== this.tasks.length;
  }

  private filterByStatus(status: string) {
    this.filteredTasks = this.tasks.filter(t => t.status.toLowerCase() === status.toLowerCase());
    this.currentPage = 0;
    }

  private filterByPriority(priority: string) {
    this.filteredTasks = this.tasks.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
    this.currentPage = 0;
    }

  private filterByCategory(category: string) {
    this.filteredTasks = this.tasks.filter(t => {
      const taskCategory = this.inferCategory(t).toLowerCase();
      return taskCategory.includes(category.toLowerCase());
    });
    this.currentPage = 0;
    }

  private searchTasks(query: string) {
    const searchTerm = query.toLowerCase();
    this.filteredTasks = this.tasks.filter(t =>
      t.title?.toLowerCase().includes(searchTerm) ||
      t.intent?.toLowerCase().includes(searchTerm) ||
      t.id.toLowerCase().includes(searchTerm),
    );
    this.currentPage = 0;
    }

  private clearFilters() {
    this.filteredTasks = [...this.tasks];
    this.currentPage = 0;
    }

  private showTaskDetails(taskId: string) {
    const _task = this.tasks.find(t => t)
    if (!task) {
      return;
    }

    console.clear();
    } ${task.status}`);
    } ${task.priority}`);
    }`);

    if (task.estimated_hours) {
      }
    if (task.actual_hours) {
      }

    if (task.intent) {
      }

    if (task.deps && task.deps.length > 0) {
      }`);
    }

    if (task.steps && task.steps.length > 0) {
      task.steps.forEach((step, i) => {
        });
    }

    if (task.acceptance && task.acceptance.length > 0) {
      task.acceptance.forEach((criterion, i) => {
        });
    }

    if (task.artifacts && task.artifacts.length > 0) {
      task.artifacts.forEach(artifact => {
        });
    }

    if (task.status === 'open') {
      }
    if (task.status === 'in_progress') {
      }

    this.rl.question('', () => {
      this.displayTasks();
      this.handleInput();
    });
  }

  private showStatistics() {
    console.clear();
    const statusStats = this.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record < string, number>);

    const priorityStats = this.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record < string, number>);

    Object.entries(statusStats).forEach(([status, count]) => {
      const _percent = Math.round((count / this.tasks.length) * 100);
      } ${status.padEnd(12)} ${count.toString().padStart(3)} (${percent}%)`);
    });

    Object.entries(priorityStats).forEach(([priority, count]) => {
      const _percent = Math.round((count / this.tasks.length) * 100);
      } ${priority.padEnd(12)} ${count.toString().padStart(3)} (${percent}%)`);
    });

    const categoryStats = new Map < string, number>();
    this.tasks.forEach(task => {
      const _category = this.inferCategory(task);
      categoryStats.set(category, (categoryStats.get(category) || 0) + 1);
    });

    Array.from(categoryStats.entries())
      .sort((a, b) => b[1]-a[1])
      .forEach(([category, count]) => {
        const percent = Math.round((count / this.tasks.length) * 100);
        } ${count.toString().padStart(3)} (${percent}%)`);
      });

    this.rl.question('', () => {
      this.displayTasks();
      this.handleInput();
    });
  }

  private showSuggestions() {
    console.clear();
    const byId = new Map(this.tasks.map(t => [t.id, t]));
    const suggestions = this.tasks
      .filter(t => t.status === 'open')
      .filter(t => this.depsSatisfied(t, byId))
      .sort((a, b) => {
        const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
        const priorityDiff = (priorityRank[a.priority] || 99)-(priorityRank[b.priority] || 99);
        if (priorityDiff !== 0) return priorityDiff;
        return (a.estimated_hours || 8)-(b.estimated_hours || 8);
      })
      .slice(0, 10);

    suggestions.forEach((task, index) => {
      const _hours = task.estimated_hours ? `${task.estimated_hours}h` : '?h';
      const category = this.inferCategory(task);
      } ${task.priority} ${task.id}: ${task.title}`);
      || 'No description'}...`);
      });

    if (suggestions.length > 0) {
      }

    this.rl.question('', () => {
      this.displayTasks();
      this.handleInput();
    });
  }

  private depsSatisfied(task: BrowserTask, byId: Map < string, BrowserTask>): boolean {
    return (task.deps || []).every(d => {
      const dep = byId.get(d);
      return ! dep || dep.status === 'done';
    });
  }

  private nextPage() {
    const maxPage = Math.ceil(this.filteredTasks.length / this.pageSize)-1;
    if (this.currentPage < maxPage) {
      this.currentPage++;
    }
  }

  private prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  private goToTask(taskNumber: number) {
    const taskIndex = taskNumber-1;
    if (taskIndex >= 0 && taskIndex < this.filteredTasks.length) {
      this.currentPage = Math.floor(taskIndex / this.pageSize);
      const _task = this.filteredTasks[taskIndex];
      this.showTaskDetails(task.id);
    } else {
      }
  }

  private handleInput() {
    this.rl.question('', (input: string) => {
      const [command, ...args] = input.trim().split(' ');
      const arg = args.join(' ');

      switch (command.toLowerCase()) {
        case 'n':
        case 'next':
          this.nextPage();
          this.displayTasks();
          this.handleInput();
          break;

        case 'p':
        case 'prev':
        case 'previous':
          this.prevPage();
          this.displayTasks();
          this.handleInput();
          break;

        case 'f':
        case 'first':
          this.currentPage = 0;
          this.displayTasks();
          this.handleInput();
          break;

        case 'l':
        case 'last':
          this.currentPage = Math.ceil(this.filteredTasks.length / this.pageSize)-1;
          this.displayTasks();
          this.handleInput();
          break;

        case 'status':
          if (arg) {
            this.filterByStatus(arg);
            this.displayTasks();
          } else {
            }
          this.handleInput();
          break;

        case 'priority':
          if (arg) {
            this.filterByPriority(arg);
            this.displayTasks();
          } else {
            }
          this.handleInput();
          break;

        case 'category':
          if (arg) {
            this.filterByCategory(arg);
            this.displayTasks();
          } else {
            }
          this.handleInput();
          break;

        case 'search':
          if (arg) {
            this.searchTasks(arg);
            this.displayTasks();
          } else {
            }
          this.handleInput();
          break;

        case 'clear':
          this.clearFilters();
          this.displayTasks();
          this.handleInput();
          break;

        case 'info':
          if (arg) {
            this.showTaskDetails(arg);
          } else {
            this.handleInput();
          }
          break;

        case 'start':
          if (arg) {
            } else {
            }
          this.handleInput();
          break;

        case 'done':
          if (arg) {
            } else {
            }
          this.handleInput();
          break;

        case 'dashboard':
          this.handleInput();
          break;

        case 'suggest':
          this.showSuggestions();
          break;

        case 'stats':
          this.showStatistics();
          break;

        case 'help':
          this.displayTasks();
          this.handleInput();
          break;

        case 'quit':
        case 'exit':
        case 'q':
          this.rl.close();
          process.exit(0);
          break;

        default:
          // Check if it's a number (go to task)
          const taskNumber = parseInt(command);
          if (!isNaN(taskNumber)) {
            this.goToTask(taskNumber);
          } else if (input.trim() === '') {
            this.displayTasks();
            this.handleInput();
          } else {
            this.handleInput();
          }
      }
    });
  }

  public run() {
    this.displayTasks();
    this.handleInput();
  }
}

const browser = new TaskBrowser();
browser.run();
