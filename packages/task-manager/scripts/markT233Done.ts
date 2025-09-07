#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import YAML from 'yaml';

interface Task { id: string; status: string; [k: string]: any }
interface Doc { tasks: Task[] }

function load(p: string): Task[] { if (!existsSync(p)) return []; const raw = readFileSync(p, 'utf8'); const d = YAML.parse(raw) as Doc | null; return d?.tasks ?? []; }
function save(p: string, tasks: Task[]) { writeFileSync(p, YAML.stringify({ tasks }, { indent: 2 }), 'utf8'); }

function main(){
  const baseCandidates = [resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks'), resolve(process.cwd(), 'ops', 'tasks')];
  const base = baseCandidates.find(b => existsSync(b)) || baseCandidates[0];
  const p1Path = resolve(base, 'active', 'p1-tasks.yaml');
  const tasks = load(p1Path);
  const idx = tasks.findIndex(t => t.id === 'T-233');
  if (idx >= 0) {
    tasks[idx].status = 'done';
    save(p1Path, tasks);
    console.log('Marked T-233 done');
  } else {
    console.log('T-233 not found');
  }
}

main();


