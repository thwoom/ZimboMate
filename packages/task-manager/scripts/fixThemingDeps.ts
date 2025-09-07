#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import YAML from 'yaml';

interface Task { id: string; title: string; deps?: string[]; [k: string]: any }
interface Doc { tasks: Task[] }

function load(path: string): Task[] {
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, 'utf8');
  const parsed = YAML.parse(raw) as Doc | null;
  return parsed?.tasks ?? [];
}

function save(path: string, tasks: Task[]) {
  const content = YAML.stringify({ tasks }, { indent: 2 });
  writeFileSync(path, content, 'utf8');
}

function main() {
  const bases = [
    resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks'),
    resolve(process.cwd(), 'ops', 'tasks')
  ];
  const base = bases.find(b => existsSync(b)) || bases[0];
  const files = [
    resolve(base, 'active', 'p1-tasks.yaml'),
    resolve(base, 'active', 'p2-tasks.yaml'),
    resolve(base, 'active', 'p3-tasks.yaml')
  ];
  const epicId = 'T-227';

  for (const file of files) {
    const tasks = load(file);
    let changed = false;
    for (const t of tasks) {
      if (t.deps && t.deps.includes(epicId)) {
        t.deps = t.deps.filter(d => d !== epicId);
        changed = true;
      }
    }
    if (changed) save(file, tasks);
  }
  console.log('Removed epic dependency T-227 from Phase tasks where present.');
}

main();


