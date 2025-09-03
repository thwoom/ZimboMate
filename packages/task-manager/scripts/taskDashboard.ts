#!/usr / bin / env tsx
/**
 * Task Management Dashboard * Visual dashboard showing progress charts, velocity trends, and task analytics
 */

import { readFileSync, writeFileSync } from 'fs';
import YAML from 'yaml';

interface DashboardTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  category?: string;
  estimated_hours?: number;
  actual_hours?: number;
  started_at?: string;
  done_at?: string;
  deps?: string[];
  progress?: string;
  notes?: string;
  artifacts?: string[];
  acceptance?: string[];
  steps?: string[];
}

class TaskDashboard {
  private tasks: DashboardTask[] = [];

  constructor() {
    this.loadTasks();
  }

  private loadTasks() {
    // Load directly from split files for better performance
    const taskDir = 'ops / tasks';
    const tasks: DashboardTask[] = [];

    try {
      // Load active tasks by priority
      const priorities = ['p1', 'p2', 'p3'];
      for (const priority of priorities) {
        const filePath = `${taskDir}/active/${priority}-tasks.yaml`;
        try {
          // Security: Validate file path to prevent traversal attacks
          const resolvedPath = join(process.cwd(), filePath);
          if (!resolvedPath.startsWith(process.cwd())) {
            console.warn(`Skipping potentially unsafe path: ${filePath}`);
            return [];
          }
          
          const _content = readFileSync(resolvedPath, 'utf8');
          const _doc = YAML.parse(content);
          if (doc.tasks) {
            tasks.push(...doc.tasks);
          }
        } catch (error) {
          // File doesn't exist or is empty, continue
        }
      }

      // Load completed tasks
      try {
        const completedPath = `${taskDir}/completed / completed-2025.yaml`;
        const _content = readFileSync(completedPath, 'utf8');
        const _doc = YAML.parse(content);
        if (doc.tasks) {
          tasks.push(...doc.tasks);
        }
      } catch (error) {
        // File doesn't exist or is empty, continue
      }

      // Load archived tasks
      try {
        const archivedPath = `${taskDir}/archived / archived-tasks.yaml`;
        const _content = readFileSync(archivedPath, 'utf8');
        const _doc = YAML.parse(content);
        if (doc.tasks) {
          tasks.push(...doc.tasks);
        }
      } catch (error) {
        // File doesn't exist or is empty, continue
      }

      this.tasks = tasks;
      } catch (error) {
      // Fallback to original file if split files don't exist
      try {
        const content = readFileSync('ops / tasks.yaml', 'utf8');
        const doc = YAML.parse(content);
        this.tasks = doc.tasks || [];
        `);
      } catch (fallbackError) {
        this.tasks = [];
      }
    }
  }

  private createProgressBar(completed: number, total: number, width = 30): string {
    const _percent = total > 0 ? completed / total : 0;
    const filled = Math.round(percent * width);
    const empty = width-filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  private getStatusColor(status: string): string {
    const colors = {
      'done': '🟢',
      'in_progress': '🟡',
      'open': '⚪',
      'blocked': '🔴',
      'cancelled': '⚫',
    };
    return colors[status] || '⚪';
  }

  private getPriorityIcon(priority: string): string {
    const _icons = {
      'P0': '🔥',
      'P1': '⚡',
      'P2': '📋',
      'P3': '📝',
      'P5': '❄️',
    };
    return icons[priority] || '📋';
  }

  public renderMainDashboard() {
    console.clear();
    // Overall Progress
    const _totalTasks = this.tasks.length;
    const _completedTasks = this.tasks.filter(t => t)
    const _inProgressTasks = this.tasks.filter(t => t)
    const _openTasks = this.tasks.filter(t => t)
    const _progressPercent = Math.round((completedTasks / totalTasks) * 100 * 10) / 10;

    );
    }`);
    // Priority Breakdown
    );
    ['P0', 'P1', 'P2', 'P3'].forEach(priority => {
      const _priorityTasks = this.tasks.filter(t => t)
      const priorityCompleted = priorityTasks.filter(t => t.status === 'done').length;
      const priorityPercent = priorityTasks.length > 0 ? Math.round((priorityCompleted / priorityTasks.length) * 100) : 0;

      } ${priority}: ${priorityCompleted}/${priorityTasks.length} (${priorityPercent}%) ${this.createProgressBar(priorityCompleted, priorityTasks.length, 20)}`);
    });
    // Category Progress
    this.renderCategoryProgress();

    // Recent Activity
    this.renderRecentActivity();

    // Next Actions
    this.renderNextActions();

    // Velocity Insights
    this.renderVelocityInsights();

    // Useful Commands
    this.renderUsefulCommands();
  }

  private renderCategoryProgress() {
    );

    const _categories = new Map < string, { total: number; completed: number }>();

    this.tasks.forEach(task => {
      const _category = task.category || this.inferCategory(task);
      if (!categories.has(category)) {
        categories.set(category, { total: 0, completed: 0 });
      }
      categories.get(category)!.total++;
      if (['done', 'completed'].includes(task.status)) {
        categories.get(category)!.completed++;
      }
    });

    Array.from(categories.entries())
      .sort((a, b) => b[1].completed-a[1].completed)
      .slice(0, 8)
      .forEach(([category, stats]) => {
        const _percent = Math.round((stats.completed / stats.total) * 100);
        } ${stats.completed}/${stats.total} (${percent}%) ${this.createProgressBar(stats.completed, stats.total, 15)}`);
      });
    }

  private inferCategory(task: DashboardTask): string {
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
    return 'miscellaneous';
  }

  private renderRecentActivity() {
    );

    const _recentTasks = this.tasks
      .filter(t => t.done_at)
      .sort((a, b) => (b.done_at || '').localeCompare(a.done_at || ''))
      .slice(0, 5);

    if (recentTasks.length === 0) {
      return;
    }

    recentTasks.forEach(task => {
      const date = task.done_at ? new Date(task.done_at).toLocaleDateString() : 'Unknown';
      const _hours = task.actual_hours ? `(${task.actual_hours}h)` : '';
      const _progress = task.progress ? `${task.progress}` : '';
      // Show brief completion summary if available
      if (task.notes) {
        const firstLine = task.notes.split('\n')[0];
        if (firstLine.includes('COMPLETED:')) {
          const _summary = firstLine.replace(/.*COMPLETED:\s*/, '').substring(0, 60);
          }
      }
    });
    }

  private renderNextActions() {
    );

    const _byId = new Map(this.tasks.map(t
    const candidates = this.tasks
      .filter(t => t.status === 'open')
      .filter(t => this.depsSatisfied(t, byId))
      .sort((a, b) => {
        const _priorityRank =  { P0: 0, P1: 1, P2: 2, P3: 3 };
        const _priorityDiff =  (priorityRank[a.priority] || 99)-(priorityRank[b.priority] || 99);
        if (priorityDiff !== 0) return priorityDiff;
        return (a.estimated_hours || 8)-(b.estimated_hours || 8);
      })
      .slice(0, 5);

    candidates.forEach((task, index) => {
      const hours = task.estimated_hours ? `~${task.estimated_hours}h` : '~?h';
      } ${task.priority} ${task.id}: ${task.title} ${hours}`);
    });

    if (candidates.length > 0) {
      }
    }

  private renderVelocityInsights() {
    );

    const _completedWithTime = this.tasks.filter(t => t)
    if (completedWithTime.length === 0) {
      return;
    }

    const _totalHours = completedWithTime.reduce((sum, t) => sum + t, 0)
    const _avgHoursPerTask = Math.round(totalHours / completedWithTime.length * 10) / 10;

    const _openTasks = this.tasks.filter(t => t)
    const _estimatedRemaining = openTasks.reduce((sum, t) => sum + t, 0)
    } hours`);
    } weeks (20h / week)`);

    // Show efficiency trends
    const recentTasks = completedWithTime
      .filter(t => t.done_at)
      .sort((a, b) => (b.done_at || '').localeCompare(a.done_at || ''))
      .slice(0, 5);

    if (recentTasks.length >= 3) {
      const recentAvg = recentTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0) / recentTasks.length;
      const _trend = recentAvg < avgHoursPerTask ? '📈 Improving' : '📉 Slowing';
      / 10}h avg)`);
    }
    }

  private depsSatisfied(task: DashboardTask, byId: Map < string, DashboardTask>): boolean {
    return (task.deps || []).every(d => {
      const _dep = byId.get(d);
      return ! dep || dep.status === 'done';
    });
  }

  private renderUsefulCommands() {
    );

    // Get current context for smart suggestions
    const _inProgressTask = this.tasks.find(t => t)
    const _nextTask = this.getNextTasks(1)[0];
    const blockedCount = this.getBlockedTasks().length;
    const _openCount = this.tasks.filter(t => t)
    if (inProgressTask) {
      }...`);
    }
    if (nextTask) {
      }...`);
    }
    if (blockedCount > 0) {
      `);
    }
    .length} high-priority (P1) tasks`);
    if (inProgressTask) {
      } else {
      }
    // Context-specific suggestions
    if (inProgressTask) {
      } else if (nextTask) {
      }

    }

  public renderWatchMode() {
    \n');

    const _renderLoop = () => {
      this.loadTasks(); // Reload for latest data
      this.renderMainDashboard();
      };

    renderLoop();
    setInterval(renderLoop, 30000); // Refresh every 30 seconds
  }

  public generateHTMLDashboard() {
    // Calculate all the data we need
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = this.tasks.filter(t => t.status === 'in_progress').length;
    const _openTasks = this.tasks.filter(t => t)
    const progressPercent = Math.round((completedTasks / totalTasks) * 100 * 10) / 10;

    const inProgressTask = this.tasks.find(t => t.status === 'in_progress');
    const nextTask = this.getNextTasks(1)[0];
    const blockedTasks = this.getBlockedTasks();

    // Category data
    const categories = new Map < string, { total: number; completed: number }>();
    this.tasks.forEach(task => {
      const _category = task.category || this.inferCategory(task);
      if (!categories.has(category)) {
        categories.set(category, { total: 0, completed: 0 });
      }
      categories.get(category)!.total++;
      if (['done', 'completed'].includes(task.status)) {
        categories.get(category)!.completed++;
      }
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title > ZimboMate Task Dashboard</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width = device-width, initial-scale = 1">
  <style > body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 20px; background: #1a1a1a; color: #e0e0e0; }
    .dashboard { max-width: 1400px; margin: 0 auto; }
    .card { background: #2d2d2d; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #404040; }
    .progress-bar { background: #404040; height: 20px; border-radius: 10px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #4ade80, #22c55e); height: 100%; transition: width 0.3s; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    .stat { text-align: center; padding: 10px; }
    .big-number { font-size: 2em; font-weight: bold; color: #4ade80; }
    .task-list { max-height: 300px; overflow-y: auto; }
    .task-item { padding: 8px; border-bottom: 1px solid #404040; display: flex; justify-content: space-between; align-items: center; }
    .priority-p0 { border-left: 4px solid #ef4444; }
    .priority-p1 { border-left: 4px solid #f97316; }
    .priority-p2 { border-left: 4px solid #eab308; }
    .priority-p3 { border-left: 4px solid #22c55e; }
    .category-item { padding: 8px; margin: 5px 0; background: #1f2937; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
    .command-section { margin-bottom: 15px; }
    .command-item { font-family: 'Consolas', 'Monaco', monospace; background: #1f2937; padding: 8px 12px; border-radius: 4px; margin: 5px 0; }
    .command-desc { color: #888; font-size: 0.8em; margin-top: 2px; }
    .context-highlight { background: #1f2937; border-left: 4px solid #4ade80; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .action-buttons { text-align: center; margin: 20px 0; }
    .btn { display: inline-block; padding: 10px 20px; margin: 5px; border-radius: 6px; text-decoration: none; font-weight: bold; border: none; cursor: pointer; }
    .btn-primary { background: #4ade80; color: #000; }
    .btn-secondary { background: #60a5fa; color: #fff; }
    .btn-warning { background: #f59e0b; color: #000; }
    h1, h2, h3 { color: #f0f0f0; }
    h3 { margin-bottom: 10px; }
    .refresh-note { text-align: center; margin-top: 20px; color: #888; }
    .mini-progress { height: 8px; background: #404040; border-radius: 4px; overflow: hidden; margin-top: 5px; }
    .mini-fill { height: 100%; background: #4ade80; }
  </style>
</head>
<body>
  <div class="dashboard">
    <h1>🎯 ZimboMate Task Dashboard</h1>

    <!-- Overall Progress -->
    <div class="card">
      <h2>📊 Overall Progress</h2>
      <div class="grid">
        <div class="stat">
          <div class="big-number">${progressPercent}%</div>
          <div > Complete</div>
          <div class="progress-bar" style="margin-top: 10px;">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>✅ Completed</span><span><strong>${completedTasks}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>🔄 In Progress</span><span><strong>${inProgressTasks}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>📋 Open</span><span><strong>${openTasks}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>🔴 Blocked</span><span><strong>${blockedTasks.length}</strong></span>
          </div>
          <hr style="border-color: #404040; margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>📊 Total</span><span>${totalTasks}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Priority Breakdown -->
    <div class="card">
      <h2>⚡ Priority Breakdown</h2>
      ${['P0', 'P1', 'P2', 'P3'].map(priority => {
        const priorityTasks = this.tasks.filter(t => t.priority === priority);
        const _completed = priorityTasks.filter(t => t)
        const _percent = priorityTasks.length > 0 ? Math.round((completed / priorityTasks.length) * 100) : 0;}
        const _icon =  { P0: '🔥', P1: '⚡', P2: '📋', P3: '📝' }[priority] || '📋';
        return `
          <div style="margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>${icon} ${priority}</span>
              <span><strong>${completed}/${priorityTasks.length} (${percent}%)</strong></span>
            </div>
            <div class="progress-bar" style="height: 12px; margin-top: 8px;">
              <div class="progress-fill" style="width: ${percent}%"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Category Progress -->
    <div class="card">
      <h2>📂 Category Progress</h2>
      <div class="task-list">
        ${Array.from(categories.entries())
          .sort((a, b) => b[1].completed-a[1].completed)
          .slice(0, 10)
          .map(([category, stats]) => {
            const percent = Math.round((stats.completed / stats.total) * 100);
            return `
              <div class="category-item">
                <div>}
                  <div>📁 ${category}</div>
                  <div style="font-size: 0.9em; color: #888;">${stats.completed}/${stats.total} tasks</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: bold;">${percent}%</div>
                  <div class="mini-progress" style="width: 80px;">
                    <div class="mini-fill" style="width: ${percent}%"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2>🎯 Next Recommended Tasks</h2>
        <div class="task-list">
          ${this.getNextTasks(8).map(task => `}
            <div class="task-item priority-${task.priority.toLowerCase()}">
              <div>
                <strong>${task.id}</strong>: ${task.title}
                <br><small>${task.category || this.inferCategory(task)} • ${task.estimated_hours || '?'}h estimated</small>
              </div>
              <div>${this.getStatusColor(task.status)} ${this.getPriorityIcon(task.priority)}</div>
            </div>
          `).join('')}
        </div>
        ${nextTask ? `<div style="margin-top: 15px; text-align: center;">}
          <button onclick="navigator.clipboard.writeText('npm run task start ${nextTask.id}')" class="btn btn-primary">
            📋 Copy Start Command
          </button>
        </div>` : ''}
      </div>

      <div class="card">
        <h2>📈 Recent Completions</h2>
        <div class="task-list">
          ${this.getRecentCompletions(8).map(task => `
            <div class="task-item">
              <div>}
                <strong>${task.id}</strong>: ${task.title}
                <br><small>${task.done_at ? new Date(task.done_at).toLocaleDateString() : 'Unknown date'}${task.actual_hours ? ` • ${task.actual_hours}h` : ''}</small>
              </div>
              <div>✅</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Blocked Tasks -->
    <div class="card">
      <h2>🔗 Blocked Tasks</h2>
      ${blockedTasks.length === 0 ?
        '<p>✅ No blocked tasks-all dependencies satisfied!</p>' :
        `<div class="task-list">
          ${blockedTasks.map(task => `}
            <div class="task-item priority-${task.priority.toLowerCase()}">
              <div>
                <strong>${task.id}</strong>: ${task.title}
                <br><small > Blocked by: ${task.deps?.join(', ') || 'Unknown'}</small>
              </div>
              <div>🔴</div>
            </div>
          `).join('')}
        </div>`
      }
    </div>

    <!-- Velocity Insights -->
    <div class="card">
      <h2>📈 Velocity Insights</h2>
      ${(() => {
        const completedWithTime = this.tasks.filter(t => t.actual_hours && t.status === 'done');
        if (completedWithTime.length === 0) {
          return '<p > No time tracking data available</p><p>💡 Start tracking with: <code>npm run tm:enhanced start T-XXX</code></p>';}
        }
        const totalHours = completedWithTime.reduce((sum, t) => sum + (t.actual_hours || 0), 0);
        const avgHoursPerTask = Math.round(totalHours / completedWithTime.length * 10) / 10;
        const openTasksForEstimate = this.tasks.filter(t => ['open', 'in_progress'].includes(t.status));
        const estimatedRemaining = openTasksForEstimate.reduce((sum, t) => sum + (t.estimated_hours || avgHoursPerTask), 0);

        return `
          <div class="grid">
            <div>
              <h4>⚡ Current Velocity</h4>
              <div style="font-size: 1.5em; color: #4ade80; font-weight: bold;">${avgHoursPerTask}h</div>
              <div > Average per task</div>
            </div>
            <div>
              <h4>📊 Total Logged</h4>
              <div style="font-size: 1.5em; color: #60a5fa; font-weight: bold;">${totalHours}h</div>
              <div > Across ${completedWithTime.length} tasks</div>
            </div>
            <div>
              <h4>⏳ Estimated Remaining</h4>
              <div style="font-size: 1.5em; color: #f59e0b; font-weight: bold;">${Math.round(estimatedRemaining)}h</div>
              <div>${Math.round(estimatedRemaining / 20)} weeks (20h / week)</div>
            </div>
          </div>
        `;
      })()}
    </div>

    <!-- Interactive Task Browser -->
    <div class="card">
      <h2>🔍 Interactive Task Browser</h2>

      <!-- Filters -->
      <div style="margin-bottom: 20px; display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
        <select id="statusFilter" style="background: #1f2937; color: #e0e0e0; border: 1px solid #404040; padding: 8px; border-radius: 4px;">
          <option value="">All Statuses</option>
          <option value="open">📋 Open</option>
          <option value="in_progress">🔄 In Progress</option>
          <option value="done">✅ Done</option>
          <option value="blocked">🔴 Blocked</option>
        </select>

        <select id="priorityFilter" style="background: #1f2937; color: #e0e0e0; border: 1px solid #404040; padding: 8px; border-radius: 4px;">
          <option value="">All Priorities</option>
          <option value="P0">🔥 P0 (Critical)</option>
          <option value="P1">⚡ P1 (High)</option>
          <option value="P2">📋 P2 (Medium)</option>
          <option value="P3">📝 P3 (Low)</option>
        </select>

        <select id="categoryFilter" style="background: #1f2937; color: #e0e0e0; border: 1px solid #404040; padding: 8px; border-radius: 4px;">
          <option value="">All Categories</option>
          <option value="ui-panels">📱 UI Panels</option>
          <option value="services">⚙️ Services</option>
          <option value="ai-integration">🤖 AI Integration</option>
          <option value="multiclass">🎭 Multiclass</option>
          <option value="spellcasting">✨ Spellcasting</option>
          <option value="character-system">👤 Character System</option>
          <option value="equipment">⚔️ Equipment</option>
          <option value="moves-dice">🎲 Moves & Dice</option>
          <option value="theming">🎨 Theming</option>
          <option value="infrastructure">🏗️ Infrastructure</option>
        </select>

        <input type="text" id="searchBox" placeholder="Search tasks..." style="background: #1f2937; color: #e0e0e0; border: 1px solid #404040; padding: 8px; border-radius: 4px; flex: 1; min-width: 200px;">

        <button onclick="clearFilters()" style="background: #ef4444; color: #fff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Clear Filters</button>
      </div>

      <!-- Results Info -->
      <div id="resultsInfo" style="margin-bottom: 15px; color: #888; font-size: 0.9em;"></div>

      <!-- Task List -->
      <div id="taskBrowserList" style="max-height: 500px; overflow-y: auto; border: 1px solid #404040; border-radius: 4px;">
        <!-- Tasks will be populated by JavaScript -->
      </div>

      <!-- Pagination -->
      <div id="pagination" style="margin-top: 15px; text-align: center; display: flex; justify-content: center; align-items: center; gap: 10px;">
        <button onclick="previousPage()" id="prevBtn" style="background: #60a5fa; color: #fff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Previous</button>
        <span id="pageInfo" style="color: #888;">Page 1 of 1</span>
        <button onclick="nextPage()" id="nextBtn" style="background: #60a5fa; color: #fff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Next</button>
      </div>
    </div>

    <!-- Useful Commands -->
    <div class="card">
      <h2>💻 Useful Commands</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
        <div>
          <h3 style="color: #4ade80; margin-bottom: 10px;">🎯 Task Management</h3>
          <div style="font-family: monospace; font-size: 0.9em; line-height: 1.6;">
            ${this.tasks.find(t => t.status === 'in_progress') ?}
              `<div > npm run task done ${this.tasks.find(t => t.status === 'in_progress')!.id}</div>
               <div style="color: #888; font-size: 0.8em;">Complete current task</div><br>` : ''
            }
            ${this.getNextTasks(1)[0] ?}
              `<div > npm run task start ${this.getNextTasks(1)[0].id}</div>
               <div style="color: #888; font-size: 0.8em;">Start next recommended</div><br>` : ''
            }
            <div > npm run task next</div>
            <div style="color: #888; font-size: 0.8em;">Show next task</div><br>
            <div > npm run task audit</div>
            <div style="color: #888; font-size: 0.8em;">Check completed work</div>
          </div>
        </div>

        <div>
          <h3 style="color: #60a5fa; margin-bottom: 10px;">📊 Analytics</h3>
          <div style="font-family: monospace; font-size: 0.9em; line-height: 1.6;">
            <div > npm run dashboard</div>
            <div style="color: #888; font-size: 0.8em;">Terminal dashboard</div><br>
            <div > npm run dashboard:html</div>
            <div style="color: #888; font-size: 0.8em;">Refresh this page</div><br>
            <div > npm run tm:enhanced velocity</div>
            <div style="color: #888; font-size: 0.8em;">Development speed</div><br>
            <div > npm run tm:enhanced suggest 5</div>
            <div style="color: #888; font-size: 0.8em;">Top recommendations</div>
          </div>
        </div>

        <div>
          <h3 style="color: #f59e0b; margin-bottom: 10px;">🚀 Development</h3>
          <div style="font-family: monospace; font-size: 0.9em; line-height: 1.6;">
            <div > npm run dev</div>
            <div style="color: #888; font-size: 0.8em;">Start dev server</div><br>
            <div > npm run build</div>
            <div style="color: #888; font-size: 0.8em;">Build for production</div><br>
            <div > npm run test</div>
            <div style="color: #888; font-size: 0.8em;">Run tests</div><br>
            <div > npm run lint</div>
            <div style="color: #888; font-size: 0.8em;">Check code quality</div>
          </div>
        </div>

        <div>
          <h3 style="color: #ef4444; margin-bottom: 10px;">🧹 Maintenance</h3>
          <div style="font-family: monospace; font-size: 0.9em; line-height: 1.6;">
            <div > npm run auto-cleanup</div>
            <div style="color: #888; font-size: 0.8em;">Remove duplicates</div><br>
            <div > npm run tm:list</div>
            <div style="color: #888; font-size: 0.8em;">Full task list</div><br>
            <div > npm run tm:enhanced report</div>
            <div style="color: #888; font-size: 0.8em;">Detailed report</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #1f2937; border-radius: 6px; border-left: 4px solid #4ade80;">
        <h4 style="color: #4ade80; margin: 0 0 10px 0;">💡 Current Context</h4>
        ${this.tasks.find(t => t.status === 'in_progress') ?}
          `<p>🔄 Working on: <strong>${this.tasks.find(t => t.status === 'in_progress')!.id}</strong>-${this.tasks.find(t => t.status === 'in_progress')!.title}</p>
           <p > Complete when done: <code>npm run task done ${this.tasks.find(t => t.status === 'in_progress')!.id}</code></p>` :
          this.getNextTasks(1)[0] ?
            `<p>🎯 Ready to start: <strong>${this.getNextTasks(1)[0].id}</strong>-${this.getNextTasks(1)[0].title}</p>
             <p > Start with: <code>npm run task start ${this.getNextTasks(1)[0].id}</code></p>` :
            '<p>✅ No immediate tasks-check recommendations above!</p>'
        }
      </div>

      <div style="margin-top: 15px; text-align: center;">
        <div style="display: inline-flex; gap: 15px; flex-wrap: wrap;">
          <a href="http://localhost:5173" target="_blank" style="background: #4ade80; color: #000; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold;">🎮 Open ZimboMate App</a>
          <button onclick="location.reload()" style="background: #60a5fa; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">🔄 Refresh Dashboard</button>
          <button onclick="window.open('dashboard.html')" style="background: #f59e0b; color: #000; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">📊 New Dashboard Tab</button>
        </div>
      </div>
    </div>

    <div class="refresh-note">
      <p>📱 Dashboard generated: ${new Date().toLocaleString()}</p>
      <p>🔄 Auto-refreshes every 30 seconds | <span id="lastUpdate">Last update: ${new Date().toLocaleTimeString()}</span></p>
      <p>💡 For auto-updating: <code>npm run dashboard:auto</code> (watches for task changes)</p>
    </div>
  </div>

  <script>
    // Task data embedded in the page
    const allTasks = ${JSON.stringify(this.tasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      category: task.category || this.inferCategory(task),
      estimated_hours: task.estimated_hours,
      actual_hours: task.actual_hours,
      intent: task.intent,
      deps: task.deps,
      progress: task.progress,
      notes: task.notes,
      done_at: task.done_at,
      artifacts: task.artifacts,
      acceptance: task.acceptance,
      steps: task.steps,}
    })))};

    let filteredTasks = [...allTasks];
    let currentPage = 0;
    const pageSize = 10;

    // Utility functions
    function getStatusIcon(status) {
      const _icons = {
        'done': '✅', 'in_progress': '🔄',
        'open': '📋', 'blocked': '🔴', 'cancelled': '❌'
      };
      return icons[status] || '❓';
    }

    function getPriorityIcon(priority) {
      const icons = { 'P0': '🔥', 'P1': '⚡', 'P2': '📋', 'P3': '📝', 'P5': '❄️' };
      return icons[priority] || '📋';
    }

    function renderTasks() {
      const startIdx = currentPage * pageSize;
      const endIdx = Math.min(startIdx + pageSize, filteredTasks.length);
      const tasksToShow = filteredTasks.slice(startIdx, endIdx);

      const taskListHtml = tasksToShow.map(task => \`
        <div class="task-item priority-\${task.priority.toLowerCase()}" style="cursor: pointer;" onclick="toggleTaskDetails('\${task.id}')">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
              <span>\${getStatusIcon(task.status)}</span>
              <span>\${getPriorityIcon(task.priority)}</span>
              <strong>\${task.priority}</strong>
              <strong>\${task.id}</strong>
              <span style="color: #888;">|\${task.category}</span>
              \${task.estimated_hours ? \`<span style="color: #f59e0b;">⏱️ \${task.estimated_hours}h</span>\` : ''}
              \${task.actual_hours ? \`<span style="color: #22c55e;">✅ \${task.actual_hours}h</span>\` : ''}
              \${task.progress ? \`<span style="color: #4ade80; font-weight: bold;">\${task.progress}</span>\` : ''}
            </div>
            <div style="font-weight: bold; margin-bottom: 3px;">\${task.title}</div>
            <div style="color: #888; font-size: 0.9em;">\${task.intent?.substring(0, 100) || 'No description'}...</div>
            \${task.deps?.length ? \`<div style="color: #60a5fa; font-size: 0.8em; margin-top: 5px;">🔗 Depends on: \${task.deps.join(', ')}</div>\` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px;">
            \${task.status === 'open' ? \`<button onclick="event.stopPropagation(); copyToClipboard('npm run task start \${task.id}')" class="btn btn-primary" style="font-size: 0.8em; padding: 4px 8px;">Start</button>\` : ''}
            \${task.status === 'in_progress' ? \`<button onclick="event.stopPropagation(); copyToClipboard('npm run task done \${task.id}')" class="btn btn-secondary" style="font-size: 0.8em; padding: 4px 8px;">Done</button>\` : ''}
            <button onclick="event.stopPropagation(); showTaskModal('\${task.id}')" style="background: #404040; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; font-size: 0.8em; cursor: pointer;">Details</button>
          </div>
        </div>
        <div id="details-\${task.id}" style="display: none; background: #1f2937; margin: 5px 0; padding: 15px; border-radius: 4px; border-left: 4px solid #4ade80;">
          <!-- Task details will be populated when expanded -->
        </div>
      \`).join('');

      document.getElementById('taskBrowserList').innerHTML = taskListHtml;

      // Update pagination
      const _totalPages = Math.ceil(filteredTasks.length / pageSize);
      document.getElementById('pageInfo').textContent = \`Page \${currentPage + 1} of \${totalPages}\`;
      document.getElementById('prevBtn').disabled = currentPage === 0;
      document.getElementById('nextBtn').disabled = currentPage >= totalPages-1;

      // Update results info
      document.getElementById('resultsInfo').textContent = \`Showing \${startIdx + 1}-\${endIdx} of \${filteredTasks.length} tasks\`;
    }

    function applyFilters() {
      const statusFilter = document.getElementById('statusFilter').value;
      const priorityFilter = document.getElementById('priorityFilter').value;
      const categoryFilter = document.getElementById('categoryFilter').value;
      const searchQuery = document.getElementById('searchBox').value.toLowerCase();

      filteredTasks = allTasks.filter(task => {
        if (statusFilter && task.status !== statusFilter) return false;
        if (priorityFilter && task.priority !== priorityFilter) return false;
        if (categoryFilter && task.category !== categoryFilter) return false;
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery) &&
            !task.intent?.toLowerCase().includes(searchQuery) &&
            !task.id.toLowerCase().includes(searchQuery)) return false;
        return true;
      });

      currentPage = 0;
      renderTasks();
    }

    function clearFilters() {
      document.getElementById('statusFilter').value = '';
      document.getElementById('priorityFilter').value = '';
      document.getElementById('categoryFilter').value = '';
      document.getElementById('searchBox').value = '';
      filteredTasks = [...allTasks];
      currentPage = 0;
      renderTasks();
    }

    function nextPage() {
      const totalPages = Math.ceil(filteredTasks.length / pageSize);
      if (currentPage < totalPages-1) {
        currentPage++;
        renderTasks();
      }
    }

    function previousPage() {
      if (currentPage > 0) {
        currentPage--;
        renderTasks();
      }
    }

    function toggleTaskDetails(taskId) {
      const detailsDiv = document.getElementById(\`details-\${taskId}\`);
      const task = allTasks.find(t => t.id === taskId);

      if (detailsDiv.style.display === 'none') {
        // Show details
        detailsDiv.innerHTML = \`
          <h4 style="color: #4ade80; margin: 0 0 10px 0;">📋 \${task.title}</h4>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
            <div><strong > Status:</strong> \${getStatusIcon(task.status)} \${task.status}</div>
            <div><strong > Priority:</strong> \${getPriorityIcon(task.priority)} \${task.priority}</div>
            <div><strong > Category:</strong> 📂 \${task.category}</div>
            \${task.progress ? \`<div><strong > Progress:</strong> 📊 \${task.progress}</div>\` : ''}
            \${task.estimated_hours ? \`<div><strong > Estimated:</strong> ⏱️ \${task.estimated_hours}h</div>\` : ''}
            \${task.actual_hours ? \`<div><strong > Actual:</strong> ✅ \${task.actual_hours}h</div>\` : ''}
            \${task.done_at ? \`<div><strong > Completed:</strong> 📅 \${new Date(task.done_at).toLocaleDateString()}</div>\` : ''}
          </div>

          <p><strong > Intent:</strong> \${task.intent || 'No description available'}</p>
          \${task.deps?.length ? \`<p><strong > Dependencies:</strong> 🔗 \${task.deps.join(', ')}</p>\` : ''}

          \${task.notes ? \`
            <div style="margin: 15px 0;">
              <h5 style="color: #60a5fa; margin-bottom: 8px;">📝 Completion Notes</h5>}
              <div style="background: #111827; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 0.85em; white-space: pre-wrap; max-height: 200px; overflow-y: auto;">\${task.notes}</div>
            </div>
          \` : ''}

          \${task.steps?.length ? \`
            <div style="margin: 15px 0;">}
              <h5 style="color: #f59e0b; margin-bottom: 8px;">📋 Steps (\${task.steps.length})</h5>
              <div style="max-height: 150px; overflow-y: auto;">
                \${task.steps.map((step, i) => \`<div style="margin: 5px 0; padding: 5px; background: #1f2937; border-radius: 3px; font-size: 0.9em;">\${i + 1}. \${step}</div>\`).join('')}
              </div>
            </div>
          \` : ''}

          \${task.acceptance?.length ? \`
            <div style="margin: 15px 0;">}
              <h5 style="color: #22c55e; margin-bottom: 8px;">✅ Acceptance Criteria (\${task.acceptance.length})</h5>
              <div style="max-height: 150px; overflow-y: auto;">
                \${task.acceptance.map(criterion => \`<div style="margin: 5px 0; padding: 5px; background: #1f2937; border-radius: 3px; font-size: 0.9em;">✓ \${criterion}</div>\`).join('')}
              </div>
            </div>
          \` : ''}

          \${task.artifacts?.length ? \`
            <div style="margin: 15px 0;">}
              <h5 style="color: #a855f7; margin-bottom: 8px;">📄 Artifacts (\${task.artifacts.length})</h5>
              <div style="max-height: 150px; overflow-y: auto;">
                \${task.artifacts.map(artifact => \`<div style="margin: 5px 0; padding: 5px; background: #1f2937; border-radius: 3px; font-size: 0.9em; font-family: monospace;">📄 \${artifact}</div>\`).join('')}
              </div>
            </div>
          \` : ''}

          <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
            \${task.status === 'open' ? \`<button onclick="copyToClipboard('npm run task start \${task.id}')" class="btn btn-primary">📋 Copy Start Command</button>\` : ''}
            \${task.status === 'in_progress' ? \`<button onclick="copyToClipboard('npm run task done \${task.id}')" class="btn btn-secondary">📋 Copy Done Command</button>\` : ''}
            <button onclick="copyToClipboard('npm run tm:enhanced info \${task.id}')" style="background: #404040; color: #fff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">📋 Copy Info Command</button>
            \${task.artifacts?.length ? \`<button onclick="copyToClipboard('\${task.artifacts.join('\\n')}')" style="background: #a855f7; color: #fff; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">📄 Copy Artifacts</button>\` : ''}
          </div>
        \`;
        detailsDiv.style.display = 'block';
      } else {
        // Hide details
        detailsDiv.style.display = 'none';
      }
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        // Show brief success message
        const originalText = event.target.textContent;
        event.target.textContent = '✅ Copied!';
        event.target.style.background = '#22c55e';
        setTimeout(() => {
          event.target.textContent = originalText;
          event.target.style.background = '';
        }, 1000);
      }).catch(err => {
        alert(\`Copy this command: \${text}\`);
      });
    }

    // Add event listeners
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('priorityFilter').addEventListener('change', applyFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('searchBox').addEventListener('input', applyFilters);

    // Initialize
    renderTasks();

    // Auto-refresh every 30 seconds
    setInterval(() => {
      document.getElementById('lastUpdate').textContent = \`Last update: \${new Date().toLocaleTimeString()}\`;
      location.reload();
    }, 30000);
  </script>
</body>
</html>`;

    writeFileSync('dashboard.html', html);
    }

  private getNextTasks(limit = 5): DashboardTask[] {
    const _byId = new Map(this.tasks.map(t
    return this.tasks
      .filter(t => t.status === 'open')
      .filter(t => this.depsSatisfied(t, byId))
      .sort((a, b) => {
        const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
        const priorityDiff = (priorityRank[a.priority] || 99)-(priorityRank[b.priority] || 99);
        if (priorityDiff !== 0) return priorityDiff;
        return (a.estimated_hours || 8)-(b.estimated_hours || 8);
      })
      .slice(0, limit);
  }

  private getRecentCompletions(limit = 5): DashboardTask[] {
    return this.tasks
      .filter(t => t.done_at && t.status === 'done')
      .sort((a, b) => (b.done_at || '').localeCompare(a.done_at || ''))
      .slice(0, limit);
  }

  private getBlockedTasks(): DashboardTask[] {
    const byId = new Map(this.tasks.map(t => [t.id, t]));
    return this.tasks
      .filter(t => t.status === 'open')
      .filter(t => !this.depsSatisfied(t, byId));
  }

  private depsSatisfied(task: DashboardTask, byId: Map < string, DashboardTask>): boolean {
    return (task.deps || []).every(d => {
      const dep = byId.get(d);
      return ! dep || dep.status === 'done';
    });
  }

  public run(command?: string) {
    switch (command) {
      case 'watch':
        this.renderWatchMode();
        break;
      case 'html':
        this.generateHTMLDashboard();
        break;
      default:
        this.renderMainDashboard();
    }
  }

  private renderWatchMode() {
    const renderLoop = () => {
      this.loadTasks();
      this.renderMainDashboard();
      ');
    };

    renderLoop();
    setInterval(renderLoop, 30000);
  }
}

const dashboard = new TaskDashboard();
const command = process.argv[2];
dashboard.run(command);
