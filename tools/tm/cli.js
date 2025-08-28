#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const TASKS_PATH = resolve(process.cwd(), 'ops', 'tasks.yaml');

// ---------- utils ----------
function loadTasks() {
  if (!existsSync(TASKS_PATH)) {
    throw new Error(`Missing ${TASKS_PATH}. Create ops/tasks.yaml first.`);
  }
  const raw = readFileSync(TASKS_PATH, 'utf8');
  const doc = YAML.parse(raw);
  if (!doc || !Array.isArray(doc.tasks)) {
    throw new Error(`Invalid tasks.yaml: expected { tasks: [...] }`);
  }
  for (const t of doc.tasks) {
    t.deps = Array.isArray(t.deps) ? t.deps : [];
    t.status = t.status || 'open'; // open | in_progress | blocked | done
    t.priority = t.priority || 'P2'; // P0|P1|P2|P3
    t.labels = Array.isArray(t.labels) ? t.labels : [];
  }
  return doc;
}
function saveTasks(doc) {
  const yaml = YAML.stringify(doc, { indent: 2 });
  const outDir = dirname(TASKS_PATH);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(TASKS_PATH, yaml, 'utf8');
}
function topoOrder(tasks) {
  const idToTask = new Map(tasks.map((t) => [t.id, t]));
  const indeg = new Map(tasks.map((t) => [t.id, 0]));
  for (const t of tasks)
    for (const d of t.deps) {
      if (!idToTask.has(d)) continue; // treat external dep as satisfied
      indeg.set(t.id, (indeg.get(t.id) ?? 0) + 1);
    }
  const q = [];
  for (const [id, deg] of indeg) if (deg === 0) q.push(id);
  const out = [];
  while (q.length) {
    q.sort(); // stable deterministic order
    const id = q.shift();
    out.push(id);
    for (const t of tasks) {
      if (t.deps?.includes(id)) {
        indeg.set(t.id, indeg.get(t.id) - 1);
        if (indeg.get(t.id) === 0) q.push(t.id);
      }
    }
  }
  if (out.length !== tasks.length) {
    const remaining = tasks
      .map((t) => t.id)
      .filter((id) => !out.includes(id))
      .sort();
    return out.concat(remaining); // cycle hint
  }
  return out;
}
function depsSatisfied(task, byId) {
  return (task.deps || []).every((d) => {
    const dep = byId.get(d);
    return !dep || dep.status === 'done'; // external or finished
  });
}
function comparePriority(a, b) {
  const rank = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return (rank[a.priority] ?? 999) - (rank[b.priority] ?? 999);
}

// ---------- commands ----------
function cmdList() {
  const { tasks } = loadTasks();
  const order = topoOrder(tasks);
  const byId = new Map(tasks.map((t) => [t.id, t]));
  console.log('\\nID    Status        Pri  Owner           Title');
  console.log(
    '----  ------------  ----  --------------  --------------------------------',
  );
  for (const id of order) {
    const t = byId.get(id);
    const line = `${(t.id || '').padEnd(4)}  ${(t.status || '').padEnd(12)}  ${(t.priority || '').padEnd(4)}  ${String(t.owner || '').padEnd(14)}  ${t.title || ''}`;
    console.log(line);
  }
  console.log('');
}
function cmdNext() {
  const { tasks } = loadTasks();
  const order = topoOrder(tasks);
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const candidates = order
    .map((id) => byId.get(id))
    .filter((t) => ['open', 'in_progress'].includes(t.status))
    .filter((t) => depsSatisfied(t, byId))
    .sort((a, b) => comparePriority(a, b) || a.id.localeCompare(b.id));
  if (!candidates.length) {
    console.log('No unblocked tasks. Either all done or blocked by deps.');
    return;
  }
  const t = candidates[0];
  console.log(`Next task: ${t.id} — ${t.title}`);
  console.log(
    `Status: ${t.status} | Priority: ${t.priority} | Owner: ${t.owner || ''}`,
  );
  console.log(`Deps: ${t.deps?.join(', ') || '-'}`);
  if (Array.isArray(t.acceptance) && t.acceptance.length) {
    console.log('\\nAcceptance:');
    for (const a of t.acceptance) console.log(` - ${a}`);
  }
  if (Array.isArray(t.steps) && t.steps.length) {
    console.log('\\nSteps:');
    for (const s of t.steps) console.log(` - ${s}`);
  }
}
function cmdMove(args) {
  // usage: npm run tm:move -- --id T-003 --status in_progress
  const idArg = findFlag(args, '--id');
  const statusArg = findFlag(args, '--status');
  if (!idArg || !statusArg) {
    console.error(
      'Usage: npm run tm:move -- --id <TASK_ID> --status <open|in_progress|blocked|done>',
    );
    process.exit(1);
  }
  const allowed = new Set(['open', 'in_progress', 'blocked', 'done']);
  if (!allowed.has(statusArg)) {
    console.error(
      `Invalid status: ${statusArg}. Allowed: ${[...allowed].join(', ')}`,
    );
    process.exit(1);
  }
  const doc = loadTasks();
  const idx = doc.tasks.findIndex((t) => t.id === idArg);
  if (idx < 0) {
    console.error(`Task not found: ${idArg}`);
    process.exit(1);
  }
  if (['in_progress', 'done'].includes(statusArg)) {
    const byId = new Map(doc.tasks.map((t) => [t.id, t]));
    if (!depsSatisfied(doc.tasks[idx], byId)) {
      console.error(
        `Cannot set ${idArg} to ${statusArg}: unmet dependencies [${(doc.tasks[idx].deps || []).join(', ')}].`,
      );
      process.exit(2);
    }
  }
  const prev = doc.tasks[idx].status || 'open';
  doc.tasks[idx].status = statusArg;
  if (statusArg === 'done') doc.tasks[idx].done_at = new Date().toISOString();
  saveTasks(doc);
  console.log(`Updated ${idArg}: ${prev} -> ${statusArg}`);
}
function findFlag(argv, name) {
  const i = argv.indexOf(name);
  if (i === -1 || i === argv.length - 1) return null;
  return argv[i + 1];
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
    console.log(`Usage:
  npm run tm:list
  npm run tm:next
  npm run tm:move -- --id T-001 --status in_progress`);
}
