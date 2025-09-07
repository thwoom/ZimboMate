#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import YAML from 'yaml';

interface Task { id: string; deps?: string[]; [k: string]: any }
interface Doc { tasks: Task[] }

function load(p: string): Task[] { if (!existsSync(p)) return []; const raw = readFileSync(p, 'utf8'); const d = YAML.parse(raw) as Doc | null; return d?.tasks ?? []; }
function save(p: string, tasks: Task[]) { writeFileSync(p, YAML.stringify({ tasks }, { indent: 2 }), 'utf8'); }

function main(){
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
  const subIds = new Set(['T-243','T-244','T-245','T-246','T-247']);
  let changedAny = false;
  for (const f of files){
    const tasks = load(f);
    let changed = false;
    for (const t of tasks){
      if (subIds.has(t.id) && t.deps){
        const before = t.deps.length;
        t.deps = t.deps.filter(d => d !== 'T-231');
        if (t.deps.length !== before) changed = true;
      }
    }
    if (changed){ save(f, tasks); changedAny = true; }
  }
  console.log(changedAny ? 'Removed T-231 dependency from subtasks.' : 'No changes needed.');
}

main();


