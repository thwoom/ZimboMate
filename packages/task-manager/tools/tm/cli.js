#!/usr/bin/env node
import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import YAML from 'yaml';

function detectTasksDir() {
  const candidates = [
    resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks'),
    resolve(process.cwd(), 'ops', 'tasks')
  ];
  for (const dir of candidates) if (existsSync(dir)) return dir;
  // Try repo root above package dir (when run from package workspace)
  const upOne = resolve(process.cwd(), '..', '..');
  const alt = resolve(upOne, 'packages', 'task-manager', 'ops', 'tasks');
  if (existsSync(alt)) return alt;
  const alt2 = resolve(upOne, 'ops', 'tasks');
  if (existsSync(alt2)) return alt2;
  return candidates[0];
}

const TASKS_DIR = detectTasksDir();

function safeLoadYaml(path) {
  const text = readFileSync(path, 'utf8');
  return YAML.parse(text);
}

function loadTasks() {
  const tasks = [];
  const p1 = resolve(TASKS_DIR, 'active', 'p1-tasks.yaml');
  const p2 = resolve(TASKS_DIR, 'active', 'p2-tasks.yaml');
  const p3 = resolve(TASKS_DIR, 'active', 'p3-tasks.yaml');
  for (const filePath of [p1, p2, p3]) {
    if (!existsSync(filePath)) continue;
    const doc = safeLoadYaml(filePath);
    if (doc && Array.isArray(doc.tasks)) tasks.push(...doc.tasks);
  }
  const completedPath = resolve(TASKS_DIR, 'completed', 'completed-2025.yaml');
  if (existsSync(completedPath)) {
    const doc = safeLoadYaml(completedPath);
    if (doc && Array.isArray(doc.tasks)) tasks.push(...doc.tasks);
  }
  if (tasks.length === 0) {
    const originalPath = resolve(TASKS_DIR, '..', 'tasks.yaml');
    if (existsSync(originalPath)) {
      const doc = safeLoadYaml(originalPath);
      if (!doc || !Array.isArray(doc.tasks)) throw new Error('Invalid tasks.yaml shape');
      tasks.push(...doc.tasks);
    } else {
      throw new Error('Missing tasks data under ops/tasks.');
    }
  }
  for (const t of tasks) {
    t.deps = Array.isArray(t.deps) ? t.deps : [];
    t.status = t.status || 'open';
    t.priority = t.priority || 'P2';
    t.owner = t.owner || '';
  }
  return { tasks };
}

function saveTasks(doc) {
  const completed = [];
  const archived = [];
  const active = { p1: [], p2: [], p3: [] };
  for (const task of doc.tasks) {
    if (task.status === 'done') completed.push(task);
    else if (task.status === 'cancelled') archived.push(task);
    else {
      switch (task.priority) {
        case 'P1': active.p1.push(task); break;
        case 'P2': active.p2.push(task); break;
        case 'P3': default: active.p3.push(task); break;
      }
    }
  }
  const dirs = [
    resolve(TASKS_DIR, 'active'),
    resolve(TASKS_DIR, 'completed'),
    resolve(TASKS_DIR, 'archived')
  ];
  dirs.forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });
  for (const [key, list] of Object.entries(active)) {
    const filePath = resolve(TASKS_DIR, 'active', `${key}-tasks.yaml`);
    writeFileSync(filePath, YAML.stringify({ tasks: list }, { indent: 2 }), 'utf8');
  }
  writeFileSync(resolve(TASKS_DIR, 'completed', 'completed-2025.yaml'), YAML.stringify({ tasks: completed }, { indent: 2 }), 'utf8');
  writeFileSync(resolve(TASKS_DIR, 'archived', 'archived-tasks.yaml'), YAML.stringify({ tasks: archived }, { indent: 2 }), 'utf8');
}

function topoOrder(tasks) {
  const byId = new Map(tasks.map(t => [t.id, t]));
  const indeg = new Map(tasks.map(t => [t.id, 0]));
  for (const t of tasks) for (const d of (t.deps || [])) if (byId.has(d)) indeg.set(t.id, (indeg.get(t.id) || 0) + 1);
  const q = [];
  for (const [id, deg] of indeg) if (deg === 0) q.push(id);
  const out = [];
  while (q.length) {
    q.sort();
    const id = q.shift();
    out.push(id);
    for (const t of tasks) if ((t.deps || []).includes(id)) {
      indeg.set(t.id, (indeg.get(t.id) - 1));
      if (indeg.get(t.id) === 0) q.push(t.id);
    }
  }
  if (out.length !== tasks.length) {
    const remaining = tasks.map(t => t.id).filter(id => !out.includes(id)).sort();
    return out.concat(remaining);
  }
  return out;
}

function depsSatisfied(task, byId) {
  return (task.deps || []).every(d => {
    const dep = byId.get(d);
    return !dep || dep.status === 'done';
  });
}

function comparePriority(a, b) {
  const rank = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return (rank[a.priority] ?? 999) - (rank[b.priority] ?? 999);
}

function cmdList() {
  const { tasks } = loadTasks();
  const order = topoOrder(tasks);
  const byId = new Map(tasks.map(t => [t.id, t]));
  console.log('ID    STATUS        PRIO  OWNER           TITLE');
  console.log('----  ------------  ----  --------------  ----------------');
  for (const id of order) {
    const t = byId.get(id);
    const line = `${String(t.id || '').padEnd(4)}  ${String(t.status || '').padEnd(12)}  ${String(t.priority || '').padEnd(4)}  ${String(t.owner || '').padEnd(14)}  ${t.title || ''}`;
    console.log(line);
  }
}

function cmdNext() {
  const { tasks } = loadTasks();
  const order = topoOrder(tasks);
  const byId = new Map(tasks.map(t => [t.id, t]));
  const candidates = order
    .map(id => byId.get(id))
    .filter(t => ['open', 'in_progress'].includes(t.status))
    .filter(t => depsSatisfied(t, byId))
    .sort((a, b) => comparePriority(a, b) || a.id.localeCompare(b.id));
  if (!candidates.length) {
    console.log('No actionable tasks (all done or blocked).');
    return;
  }
  const t = candidates[0];
  console.log(`Next: ${t.id} [${t.priority}] - ${t.title}`);
}

function cmdMove(argv) {
  const idIdx = argv.indexOf('--id');
  const statusIdx = argv.indexOf('--status');
  if (idIdx === -1 || statusIdx === -1) {
    console.error('Usage: tm:move -- --id <ID> --status <open|in_progress|blocked|done>');
    process.exit(1);
  }
  const id = argv[idIdx + 1];
  const status = argv[statusIdx + 1];
  const allowed = new Set(['open', 'in_progress', 'blocked', 'done', 'cancelled']);
  if (!allowed.has(status)) {
    console.error('Invalid status');
    process.exit(1);
  }
  const doc = loadTasks();
  const idx = doc.tasks.findIndex(t => t.id === id);
  if (idx < 0) {
    console.error(`Task not found: ${id}`);
    process.exit(1);
  }
  if (['in_progress', 'done'].includes(status)) {
    const byId = new Map(doc.tasks.map(t => [t.id, t]));
    if (!depsSatisfied(doc.tasks[idx], byId)) {
      console.error(`Dependencies not satisfied for ${id}: ${doc.tasks[idx].deps.join(', ')}`);
      process.exit(2);
    }
  }
  doc.tasks[idx].status = status;
  if (status === 'done') doc.tasks[idx].done_at = new Date().toISOString();
  saveTasks(doc);
  console.log(`Updated ${id} -> ${status}`);
}

const sub = process.argv[2] || 'help';
switch (sub) {
  case 'list':
    cmdList();
    break;
  case 'next':
    cmdNext();
    break;
  case 'move':
    cmdMove(process.argv.slice(3));
    break;
  default:
    console.log('Usage: tm <list|next|move>');
}
