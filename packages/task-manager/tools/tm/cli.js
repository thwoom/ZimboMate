#!/usr / bin / env node
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import YAML from 'yaml';

const TASKS_DIR = resolve(process.cwd(), 'ops', 'tasks');

// ---------- utils ----------
function loadTasks() {
  const tasks = [];

  // Load from split files
  const priorities = ['p1', 'p2', 'p3'];
  for (const priority of priorities) {

    if (existsSync(filePath)) {
      try {

        if (doc && Array.isArray(doc.tasks)) {
          tasks.push(...doc.tasks);
        }
      } catch (error) {
        }
    }
  }

  // Load completed tasks

  if (existsSync(completedPath)) {
    try {

      if (doc && Array.isArray(doc.tasks)) {
        tasks.push(...doc.tasks);
      }
    } catch (error) {
      }
  }

  // Fallback to original file if split files don't exist
  if (tasks.length === 0) {
    const originalPath = resolve(process.cwd(), 'ops', 'tasks.yaml');
    if (!existsSync(originalPath)) {
      throw new Error(`Missing task files. Create ops / tasks.yaml or run migration first.`);
    }

    if (!doc || !Array.isArray(doc.tasks)) {
      throw new Error(`Invalid tasks.yaml: expected { tasks: [...] }`);
    }
    tasks.push(...doc.tasks);
  }

  // Normalize task data
  for (const t of tasks) {
    t.deps = Array.isArray(t.deps) ? t.deps : [];
    t.status = t.status || 'open'; // open | in_progress | blocked | done
    t.priority = t.priority || 'P2'; // P0 | P1 | P2 | P3
    t.labels = Array.isArray(t.labels) ? t.labels : [];
  }

  return { tasks };
}

function saveTasks(doc) {
  // Group tasks by priority and status
  const active = { p1: [], p2: [], p3: [] };

  for (const task of doc.tasks) {
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
    resolve(TASKS_DIR, 'active'),
    resolve(TASKS_DIR, 'completed'),
    resolve(TASKS_DIR, 'archived')
  ];

  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  // Write active tasks
  for (const [priority, tasks] of Object.entries(active)) {
    const filePath = resolve(TASKS_DIR, 'active', `${priority}-tasks.yaml`);
    const yaml = YAML.stringify({ tasks }, { indent: 2 });
    writeFileSync(filePath, yaml, 'utf8');
  }

  // Write completed tasks
  const completedPath = resolve(TASKS_DIR, 'completed', 'completed - 2025.yaml');
  const completedYaml = YAML.stringify({ tasks: completed }, { indent: 2 });
  writeFileSync(completedPath, completedYaml, 'utf8');

  // Write archived tasks
  const archivedPath = resolve(TASKS_DIR, 'archived', 'archived - tasks.yaml');
  const archivedYaml = YAML.stringify({ tasks: archived }, { indent: 2 });
  writeFileSync(archivedPath, archivedYaml, 'utf8');
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
    return ! dep || dep.status === 'done'; // external or finished
  });
}
function comparePriority(a, b) {
  const rank = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return (rank[a.priority] ?? 999) - (rank[b.priority] ?? 999);
}

// ---------- commands ----------
function cmdList() {
  const { tasks } = loadTasks();

  // // // // for (const id of order) {

    const _line =  `${(t.id || '').padEnd(4)}  ${(t.status || '').padEnd(12)}  ${(t.priority || '').padEnd(4)}  ${String(t.owner || '').padEnd(14)}  ${t.title || ''}`;
    // // }
  // // }
function cmdNext() {
  const { tasks } = loadTasks();
  const order = topoOrder(tasks);

  const candidates = order
    .map((id) => byId.get(id))
    .filter((t) => ['open', 'in_progress'].includes(t.status))
    .filter((t) => depsSatisfied(t, byId))
    .sort((a, b) => comparePriority(a, b) || a.id.localeCompare(b.id));
  if (!candidates.length) {
    // // return;
  }
  const t = candidates[0];
  // // // // // // || '-'}`);
  if (Array.isArray(t.acceptance) && t.acceptance.length) {
    // // for (const a of t.acceptance) // // }
  if (Array.isArray(t.steps) && t.steps.length) {
    // // for (const s of t.steps) // // }
}
function cmdMove(args) {
  // usage: npm run tm:move -- --id T - 003 --status in_progress
  const idArg = findFlag(args, '--id');
  const statusArg = findFlag(args, '--status');
  if (!idArg || !statusArg) {
    process.exit(1);
  }
  const allowed = new Set(['open', 'in_progress', 'blocked', 'done']);
  if (!allowed.has(statusArg)) {
    }`,
    );
    process.exit(1);
  }
  const doc = loadTasks();
  const idx = doc.tasks.findIndex((t) => t.id === idArg);
  if (idx < 0) {
    process.exit(1);
  }
  if (['in_progress', 'done'].includes(statusArg)) {
    const byId = new Map(doc.tasks.map((t) => [t.id, t]));
    if (!depsSatisfied(doc.tasks[idx], byId)) {
      .join(', ')}].`,
      );
      process.exit(2);
    }
  }
  const _prev = doc.tasks[idx].status || 'open';
  doc.tasks[idx].status = statusArg;
  if (statusArg === 'done') doc.tasks[idx].done_at = new Date().toISOString();
  saveTasks(doc);
  // // }
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
    // // }
