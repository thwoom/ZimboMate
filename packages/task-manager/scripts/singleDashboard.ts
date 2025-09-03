#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import { existsSync,readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import * as yaml from 'js-yaml';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  intent?: string;
  deps?: string[];
  artifacts?: string[];
  acceptance?: string[];
  steps?: string[];
  progress?: string;
  done_at?: string;
  owner?: string;
  labels?: string[];
}

interface ESLintResult {
  totalProblems: number;
  errors: number;
  warnings: number;
  fixable: number;
  lastRun: string;
  status: 'clean' | 'warnings' | 'errors';
}

interface SemgrepResult {
  totalIssues: number;
  security: number;
  quality: number;
  logic: number;
  fixable: number;
  lastRun: string;
  status: 'clean' | 'warnings' | 'errors';
  criticalIssues: number;
}

function loadTasks(): Task[] {
  const tasks: Task[] = [];
  
  // Load from the original tasks.yaml file
  const originalTasksFile = 'ops/tasks.yaml';
  if (existsSync(originalTasksFile)) {
    try {
      const content = readFileSync(originalTasksFile, 'utf8');
      const yamlData = yaml.load(content);
      // Handle the tasks wrapper structure
      const yamlTasks = yamlData && typeof yamlData === 'object' && 'tasks' in yamlData 
        ? (yamlData as any).tasks 
        : Array.isArray(yamlData) ? yamlData : [];
      tasks.push(...yamlTasks.filter((t: any) => t && t.id));
      console.log(`📊 Loaded ${tasks.length} tasks from tasks.yaml`);
    } catch (error) {
      console.warn(`Warning: Could not parse ${originalTasksFile}:`, error);
    }
  }
  
  return tasks;
}

function getESLintStatus(): ESLintResult | null {
  try {
    // Try to get ESLint status from the status file first
    const statusFile = join(process.cwd(), 'eslint-status.json');
    if (existsSync(statusFile)) {
      const content = readFileSync(statusFile, 'utf8');
      return JSON.parse(content);
    }
    
    // If no status file, run ESLint to get current status
    console.log('🔍 Checking ESLint status...');
    execSync('npm run lint:status', { stdio: 'pipe' });
    
    // Read the generated status
    if (existsSync(statusFile)) {
      const content = readFileSync(statusFile, 'utf8');
      return JSON.parse(content);
    }
  } catch {
    console.warn('Warning: Could not get ESLint status');
  }
  
  return null;
}

function getSemgrepStatus(): SemgrepResult | null {
  try {
    // Try to get Semgrep status from the report file first
    const reportFile = join(process.cwd(), 'semgrep-report.json');
    if (existsSync(reportFile)) {
      const content = readFileSync(reportFile, 'utf8');
      const report = JSON.parse(content);
      
      return {
        totalIssues: report.summary?.totalIssues || 0,
        security: report.summary?.byCategory?.security || 0,
        quality: report.summary?.byCategory?.quality || 0,
        logic: report.summary?.byCategory?.logic || 0,
        fixable: report.summary?.fixableIssues || 0,
        lastRun: report.generatedAt || new Date().toISOString(),
        status: (report.summary?.totalIssues || 0) === 0 ? 'clean' : 
                (report.summary?.byCategory?.security || 0) > 0 ? 'errors' : 'warnings',
        criticalIssues: report.summary?.byCategory?.security || 0
      };
    }
    
    // If no report file, run Semgrep to get current status
    console.log('🔍 Running Semgrep security scan...');
    try {
      execSync('npm run semgrep:report', { stdio: 'pipe' });
      
      // Read the generated report
      if (existsSync(reportFile)) {
        const content = readFileSync(reportFile, 'utf8');
        const report = JSON.parse(content);
        
        return {
          totalIssues: report.summary?.totalIssues || 0,
          security: report.summary?.byCategory?.security || 0,
          quality: report.summary?.byCategory?.quality || 0,
          logic: report.summary?.byCategory?.logic || 0,
          fixable: report.summary?.fixableIssues || 0,
          lastRun: report.generatedAt || new Date().toISOString(),
          status: (report.summary?.totalIssues || 0) === 0 ? 'clean' : 
                  (report.summary?.byCategory?.security || 0) > 0 ? 'errors' : 'warnings',
          criticalIssues: report.summary?.byCategory?.security || 0
        };
      }
    } catch {
      console.warn('Warning: Could not run Semgrep scan');
    }
  } catch {
    console.warn('Warning: Could not get Semgrep status');
  }
  
  return null;
}

function generateSingleDashboardHTML(tasks: Task[], eslintStatus: ESLintResult | null, semgrepStatus: SemgrepResult | null): string {
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const open = tasks.filter(t => t.status === 'open').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;
  const total = tasks.length;
  
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
  
  // Priority breakdown
  const p0Tasks = tasks.filter(t => t.priority === 'P0');
  const p1Tasks = tasks.filter(t => t.priority === 'P1');
  const p2Tasks = tasks.filter(t => t.priority === 'P2');
  const p3Tasks = tasks.filter(t => t.priority === 'P3');
  
  const p0Completed = p0Tasks.filter(t => t.status === 'done').length;
  const p1Completed = p1Tasks.filter(t => t.status === 'done').length;
  const p2Completed = p2Tasks.filter(t => t.status === 'done').length;
  const p3Completed = p3Tasks.filter(t => t.status === 'done').length;
  
  const p0Rate = p0Tasks.length > 0 ? ((p0Completed / p0Tasks.length) * 100).toFixed(0) : '0';
  const p1Rate = p1Tasks.length > 0 ? ((p1Completed / p1Tasks.length) * 100).toFixed(0) : '0';
  const p2Rate = p2Tasks.length > 0 ? ((p2Completed / p2Tasks.length) * 100).toFixed(0) : '0';
  const p3Rate = p3Tasks.length > 0 ? ((p3Completed / p3Tasks.length) * 100).toFixed(0) : '0';
  
  // Recent tasks
  const recentTasks = tasks
    .filter(t => t.status === 'done' && t.done_at)
    .sort((a, b) => new Date(b.done_at!).getTime()-new Date(a.done_at!).getTime())
    .slice(0, 5);
  
  // In progress tasks
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  
  // Next tasks
  const nextTasks = tasks
    .filter(t => t.status === 'open' && t.priority === 'P1')
    .slice(0, 5);

  // Category breakdown
  const categories = [...new Set(tasks.map(t => t.category).filter(Boolean))];
  const categoryStats = categories.map(cat => {
    const catTasks = tasks.filter(t => t.category === cat);
    const catCompleted = catTasks.filter(t => t.status === 'done').length;
    const catRate = catTasks.length > 0 ? ((catCompleted / catTasks.length) * 100).toFixed(0) : '0';
    return { name: cat, total: catTasks.length, completed: catCompleted, rate: catRate };
  }).sort((a, b) => Number.parseInt(b.rate)-Number.parseInt(a.rate));

  return `<!DOCTYPE html>
<html>
<head>
  <title>ZimboMate Dashboard</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 20px; background: #1a1a1a; color: #e0e0e0; }
    .dashboard { max-width: 1400px; margin: 0 auto; }
    .card { background: #2d2d2d; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #404040; }
    .progress-bar { background: #404040; height: 20px; border-radius: 10px; overflow: hidden; }
    .progress-fill { background: linear-gradient(90deg, #4ade80, #22c55e); height: 100%; transition: width 0.3s; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
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
    .unified-header { text-align: center; margin-bottom: 30px; }
    .unified-header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .unified-header p { color: #888; font-size: 1.1em; }
    .security-critical { color: #ef4444; }
    .security-warning { color: #f59e0b; }
    .security-clean { color: #4ade80; }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="unified-header">
      <h1>🎯 ZimboMate Dashboard</h1>
      <p>Complete task management with integrated code quality and security monitoring</p>
    </div>
    
    <!-- Overall Progress -->
    <div class="card">
      <h2>📊 Overall Progress</h2>
      <div class="grid">
        <div class="stat">
          <div class="big-number">${completionRate}%</div>
          <div>Complete</div>
          <div class="progress-bar" style="margin-top: 10px;">
            <div class="progress-fill" style="width: ${completionRate}%"></div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>✅ Completed</span><span><strong>${completed}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>🔄 In Progress</span><span><strong>${inProgress}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>📋 Open</span><span><strong>${open}</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>🔴 Blocked</span><span><strong>${blocked}</strong></span>
          </div>
          <hr style="border-color: #404040; margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>📊 Total</span><span>${total}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Code Quality & Security Status -->
    <div class="grid-2">
      <!-- ESLint Code Quality -->
      <div class="card">
        <h2>🔍 Code Quality Status (ESLint)</h2>
        ${eslintStatus ? `
          <div class="grid">
            <div class="stat">}
              <div class="big-number" style="color: ${eslintStatus.status === 'clean' ? '#4ade80' : eslintStatus.status === 'warnings' ? '#f59e0b' : '#ef4444'};">
                ${eslintStatus.status === 'clean' ? '✅' : eslintStatus.status === 'warnings' ? '⚠️' : '❌'}
              </div>
              <div>${eslintStatus.status === 'clean' ? 'Clean' : eslintStatus.status === 'warnings' ? 'Warnings' : 'Errors Found'}</div>
              <div style="margin-top: 10px; font-size: 0.9em; color: #888;">
                Last checked: ${new Date(eslintStatus.lastRun).toLocaleString()}
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>📊 Total Issues</span><span><strong>${eslintStatus.totalProblems}</strong></span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>❌ Errors</span><span><strong>${eslintStatus.errors}</strong></span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>⚠️ Warnings</span><span><strong>${eslintStatus.warnings}</strong></span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>🔧 Auto-fixable</span><span><strong>${eslintStatus.fixable}</strong></span>
              </div>
              <hr style="border-color: #404040; margin: 15px 0;">
              <div style="text-align: center; margin-top: 15px;">
                <div style="font-family: monospace; font-size: 0.9em; margin-bottom: 10px;">
                  <div>npm run lint:fix</div>
                  <div style="color: #888; font-size: 0.8em;">Fix ${eslintStatus.fixable} issues automatically</div>
                </div>
              </div>
            </div>
          </div>
        ` : '<div style="text-align: center; color: #888; padding: 20px;">ESLint status not available</div>'}
      </div>

      <!-- Semgrep Security -->
      <div class="card">
        <h2>🔒 Security Status (Semgrep)</h2>
        ${semgrepStatus ? `
          <div class="grid">
            <div class="stat">}
              <div class="big-number" style="color: ${semgrepStatus.status === 'clean' ? '#4ade80' : semgrepStatus.status === 'warnings' ? '#f59e0b' : '#ef4444'};">
                ${semgrepStatus.status === 'clean' ? '✅' : semgrepStatus.status === 'warnings' ? '⚠️' : '❌'}
              </div>
              <div>${semgrepStatus.status === 'clean' ? 'Secure' : semgrepStatus.status === 'warnings' ? 'Warnings' : 'Security Issues'}</div>
              <div style="margin-top: 10px; font-size: 0.9em; color: #888;">
                Last scanned: ${new Date(semgrepStatus.lastRun).toLocaleString()}
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>📊 Total Issues</span><span><strong>${semgrepStatus.totalIssues}</strong></span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>🚨 Security</span><span><strong class="security-critical">${semgrepStatus.security}</strong></span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>⚠️ Quality</span><span><strong class="security-warning">${semgrepStatus.quality}</strong></span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>🔧 Auto-fixable</span><span><strong>${semgrepStatus.fixable}</strong></span>
              </div>
              <hr style="border-color: #404040; margin: 15px 0;">
              <div style="text-align: center; margin-top: 15px;">
                <div style="font-family: monospace; font-size: 0.9em; margin-bottom: 10px;">
                  <div>npm run semgrep:autofix</div>
                  <div style="color: #888; font-size: 0.8em;">Fix ${semgrepStatus.fixable} security issues</div>
                </div>
              </div>
            </div>
          </div>
        ` : '<div style="text-align: center; color: #888; padding: 20px;">Semgrep status not available</div>'}
      </div>
    </div>

    <!-- Priority Breakdown -->
    <div class="card">
      <h2>⚡ Priority Breakdown</h2>
      <div class="grid-4">
        <div style="margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>🔥 P0</span>
            <span><strong>${p0Completed}/${p0Tasks.length} (${p0Rate}%)</strong></span>
          </div>
          <div class="progress-bar" style="height: 12px; margin-top: 8px;">
            <div class="progress-fill" style="width: ${p0Rate}%"></div>
          </div>
        </div>
        
        <div style="margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>⚡ P1</span>
            <span><strong>${p1Completed}/${p1Tasks.length} (${p1Rate}%)</strong></span>
          </div>
          <div class="progress-bar" style="height: 12px; margin-top: 8px;">
            <div class="progress-fill" style="width: ${p1Rate}%"></div>
          </div>
        </div>
        
        <div style="margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>📋 P2</span>
            <span><strong>${p2Completed}/${p2Tasks.length} (${p2Rate}%)</strong></span>
          </div>
          <div class="progress-bar" style="height: 12px; margin-top: 8px;">
            <div class="progress-fill" style="width: ${p2Rate}%"></div>
          </div>
        </div>
        
        <div style="margin: 15px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>📝 P3</span>
            <span><strong>${p3Completed}/${p3Tasks.length} (${p3Rate}%)</strong></span>
          </div>
          <div class="progress-bar" style="height: 12px; margin-top: 8px;">
            <div class="progress-fill" style="width: ${p3Rate}%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Progress -->
    <div class="card">
      <h2>📂 Category Progress</h2>
      <div class="grid-3">
        ${categoryStats.map(cat => `
          <div class="category-item">
            <div>}
              <strong>${cat.name}</strong>
              <div style="font-size: 0.8em; color: #888;">${cat.completed}/${cat.total} tasks</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold; color: #4ade80;">${cat.rate}%</div>
              <div class="mini-progress" style="width: 100px; margin-top: 5px;">
                <div class="mini-fill" style="width: ${cat.rate}%"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Current Work -->
    <div class="grid-2">
      <div class="card">
        <h2>🔄 In Progress</h2>
        <div class="task-list">
          ${inProgressTasks.map(task => `}
            <div class="task-item priority-${task.priority.toLowerCase()}">
              <div>
                <strong>${task.id}</strong>-${task.title}
                <div style="font-size: 0.8em; color: #888;">${task.category}</div>
              </div>
            </div>
          `).join('')}
          ${inProgressTasks.length === 0 ? '<div style="text-align: center; color: #888; padding: 20px;">No tasks in progress</div>' : ''}
        </div>
      </div>
      
      <div class="card">
        <h2>🎯 Next Up (P1)</h2>
        <div class="task-list">
          ${nextTasks.map(task => `}
            <div class="task-item priority-${task.priority.toLowerCase()}">
              <div>
                <strong>${task.id}</strong>-${task.title}
                <div style="font-size: 0.8em; color: #888;">${task.category}</div>
              </div>
            </div>
          `).join('')}
          ${nextTasks.length === 0 ? '<div style="text-align: center; color: #888; padding: 20px;">No P1 tasks available</div>' : ''}
        </div>
      </div>
    </div>

    <!-- Recent Completions -->
    <div class="card">
      <h2>✅ Recent Completions</h2>
      <div class="task-list">
        ${recentTasks.map(task => `}
          <div class="task-item priority-${task.priority.toLowerCase()}">
            <div>
              <strong>${task.id}</strong>-${task.title}
              <div style="font-size: 0.8em; color: #888;">
                ${task.category} • Completed ${new Date(task.done_at!).toLocaleDateString()}
              </div>
            </div>
          </div>
        `).join('')}
        ${recentTasks.length === 0 ? '<div style="text-align: center; color: #888; padding: 20px;">No recent completions</div>' : ''}
      </div>
    </div>

    <!-- Development Commands -->
    <div class="card">
      <h2>🛠️ Development Commands</h2>
      <div class="grid-2">
        <div>
          <h3 style="color: #4ade80; margin-bottom: 10px;">🚀 Development</h3>
          <div style="font-family: monospace; font-size: 0.9em; line-height: 1.6;">
            <div>npm run dev</div>
            <div style="color: #888; font-size: 0.8em;">Start dev server</div><br>
            <div>npm run build</div>
            <div style="color: #888; font-size: 0.8em;">Build for production</div><br>
            <div>npm run test</div>
            <div style="color: #888; font-size: 0.8em;">Run tests</div><br>
            <div>npm run lint</div>
            <div style="color: #888; font-size: 0.8em;">Check code quality</div><br>
            <div>npm run lint:fix</div>
            <div style="color: #888; font-size: 0.8em;">Auto-fix code quality issues</div><br>
            <div>npm run lint:status</div>
            <div style="color: #888; font-size: 0.8em;">Generate ESLint status</div>
          </div>
        </div>
        
        <div>
          <h3 style="color: #ef4444; margin-bottom: 10px;">🔒 Security & Maintenance</h3>
          <div style="font-family: monospace; font-size: 0.9em; line-height: 1.6;">
            <div>npm run semgrep:scan</div>
            <div style="color: #888; font-size: 0.8em;">Run security scan</div><br>
            <div>npm run semgrep:autofix</div>
            <div style="color: #888; font-size: 0.8em;">Auto-fix security issues</div><br>
            <div>npm run semgrep:report</div>
            <div style="color: #888; font-size: 0.8em;">Generate security report</div><br>
            <div>npm run auto-cleanup</div>
            <div style="color: #888; font-size: 0.8em;">Remove duplicates</div><br>
            <div>npm run task:completion T-XXX "Title"</div>
            <div style="color: #888; font-size: 0.8em;">Generate completion report</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Automation Triggers -->
    <div class="card">
      <h2>🚀 Automation Triggers</h2>
      <div class="grid-2">
        <div>
          <h3 style="color: #4ade80; margin-bottom: 10px;">🔧 Quick Actions</h3>
          <div style="text-align: center; margin: 20px 0;">
            <button onclick="runESLintFix()" class="btn btn-primary">🔧 Auto-fix ESLint Issues</button>
            <button onclick="runSemgrepAutofix()" class="btn btn-warning">🔒 Auto-fix Security Issues</button>
            <button onclick="runFullScan()" class="btn btn-secondary">🔍 Run Full Scan</button>
          </div>
        </div>
        
        <div>
          <h3 style="color: #ef4444; margin-bottom: 10px;">📊 Generate Reports</h3>
          <div style="text-align: center; margin: 20px 0;">
            <button onclick="generateESLintStatus()" class="btn btn-secondary">📊 ESLint Status</button>
            <button onclick="generateSemgrepReport()" class="btn btn-secondary">🔒 Security Report</button>
            <button onclick="generateTaskCompletion()" class="btn btn-primary">✅ Task Completion</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Display -->
    <div id="automation-status" style="display: none; margin-top: 20px; padding: 15px; background: #1f2937; border-radius: 6px; border-left: 4px solid #4ade80;">
      <h4 style="margin: 0 0 10px 0; color: #4ade80;">🔄 Automation Status</h4>
      <div id="automation-status-content"></div>
    </div>

    <div class="refresh-note">
      <p>🔄 Dashboard generated at ${new Date().toLocaleString()}</p>
      <p>💡 Run <code>npm run dashboard</code> to regenerate</p>
    </div>
  </div>

  <script>
  // Automation Functions
  async function runESLintFix() {
    showAutomationStatus('🔧 Running ESLint auto-fix...', 'info');
    try {
      const command = 'npm run lint:fix';
      await navigator.clipboard.writeText(command);
      showAutomationStatus('📋 Command copied to clipboard: ' + command + '\\n\\n💡 Paste and run in your terminal, then refresh this page to see results.', 'info');
      
      setTimeout(() => {
        showAutomationStatus('⏳ Waiting for you to run the command...\\n\\n🔄 Refresh this page after running: ' + command, 'info');
      }, 2000);
    } catch (error) {
      showAutomationStatus('❌ Could not copy to clipboard. Run manually: npm run lint:fix', 'error');
    }
  }

  async function runSemgrepAutofix() {
    showAutomationStatus('🔒 Running Semgrep auto-fix...', 'info');
    try {
      const command = 'npm run semgrep:autofix';
      await navigator.clipboard.writeText(command);
      showAutomationStatus('📋 Command copied to clipboard: ' + command + '\\n\\n💡 Paste and run in your terminal, then refresh this page to see results.', 'info');
      
      setTimeout(() => {
        showAutomationStatus('⏳ Waiting for you to run the command...\\n\\n🔄 Refresh this page after running: ' + command, 'info');
      }, 2000);
    } catch (error) {
      showAutomationStatus('❌ Could not copy to clipboard. Run manually: npm run semgrep:autofix', 'error');
    }
  }

  async function runFullScan() {
    showAutomationStatus('🔍 Running full code quality and security scan...', 'info');
    try {
      const command = 'npm run lint:status && npm run semgrep:report';
      await navigator.clipboard.writeText(command);
      showAutomationStatus('📋 Commands copied to clipboard: ' + command + '\\n\\n💡 Paste and run in your terminal, then refresh this page to see results.', 'info');
      
      setTimeout(() => {
        showAutomationStatus('⏳ Waiting for you to run the commands...\\n\\n🔄 Refresh this page after running: ' + command, 'info');
      }, 2000);
    } catch (error) {
      showAutomationStatus('❌ Could not copy to clipboard. Run manually: npm run lint:status && npm run semgrep:report', 'error');
    }
  }

  async function generateESLintStatus() {
    showAutomationStatus('📊 Generating ESLint status report...', 'info');
    try {
      const command = 'npm run lint:status';
      await navigator.clipboard.writeText(command);
      showAutomationStatus('📋 Command copied to clipboard: ' + command + '\\n\\n💡 Paste and run in your terminal to generate the report.', 'info');
    } catch (error) {
      showAutomationStatus('❌ Could not copy to clipboard. Run manually: npm run lint:status', 'error');
    }
  }

  async function generateSemgrepReport() {
    showAutomationStatus('🔒 Generating security report...', 'info');
    try {
      const command = 'npm run semgrep:report';
      await navigator.clipboard.writeText(command);
      showAutomationStatus('📋 Command copied to clipboard: ' + command + '\\n\\n💡 Paste and run in your terminal to generate the report.', 'info');
    } catch (error) {
      showAutomationStatus('❌ Could not copy to clipboard. Run manually: npm run semgrep:report', 'error');
    }
  }

  async function generateTaskCompletion() {
    const taskId = prompt('Enter task ID (e.g., T-123):');
    const taskTitle = prompt('Enter task title:');
    
    if (!taskId || !taskTitle) {
      showAutomationStatus('❌ Task ID and title are required', 'error');
      return;
    }
    
    showAutomationStatus('✅ Generating completion report for ' + taskId + '...', 'info');
    try {
      const command = 'npm run task:completion ' + taskId + ' "' + taskTitle + '"';
      await navigator.clipboard.writeText(command);
      showAutomationStatus('📋 Command copied to clipboard: ' + command + '\\n\\n💡 Paste and run in your terminal to generate the completion report.', 'info');
    } catch (error) {
      showAutomationStatus('❌ Could not copy to clipboard. Run manually: npm run task:completion ' + taskId + ' "' + taskTitle + '"', 'error');
    }
  }

  function showAutomationStatus(message, type) {
    const statusDiv = document.getElementById('automation-status');
    const contentDiv = document.getElementById('automation-status-content');
    
    statusDiv.style.display = 'block';
    contentDiv.innerHTML = message.replace(/\\n/g, '<br>');
    
    // Set border color based on type
    const borderColor = type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#60a5fa';
    statusDiv.style.borderLeftColor = borderColor;
    
    // Auto-hide after 10 seconds for longer messages
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 10000);
  }

  // Initialize dashboard
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 ZimboMate Dashboard loaded with automation triggers!');
  });
  </script>
</body>
</html>`;
}

function main() {
  console.log('🚀 Generating single unified dashboard...');
  
  const tasks = loadTasks();
  const eslintStatus = getESLintStatus();
  const semgrepStatus = getSemgrepStatus();
  
  console.log(`📊 Loaded ${tasks.length} tasks`);
  if (eslintStatus) {
    console.log(`🔍 ESLint status: ${eslintStatus.totalProblems} issues (${eslintStatus.errors} errors, ${eslintStatus.warnings} warnings)`);
  }
  if (semgrepStatus) {
    console.log(`🔒 Semgrep status: ${semgrepStatus.totalIssues} issues (${semgrepStatus.security} security, ${semgrepStatus.quality} quality)`);
  }
  
  const html = generateSingleDashboardHTML(tasks, eslintStatus, semgrepStatus);
  const outputPath = join(process.cwd(), 'dashboard.html');
  writeFileSync(outputPath, html);
  
  console.log(`✅ Single unified dashboard generated: ${outputPath}`);
}

// Run the script
main();