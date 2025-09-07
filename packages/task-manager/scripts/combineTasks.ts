#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import YAML from 'yaml';

interface Task { id: string; [k: string]: any }
interface Doc { tasks: Task[] }

function loadDoc(path: string): Task[] {
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, 'utf8');
  const parsed = YAML.parse(raw) as Doc | null;
  return parsed?.tasks ?? [];
}

function main() {
  const roots = [
    resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks'),
    resolve(process.cwd(), 'ops', 'tasks')
  ];
  let base = roots.find(p => existsSync(p)) || roots[0];

  const p1 = loadDoc(resolve(base, 'active', 'p1-tasks.yaml'));
  const p2 = loadDoc(resolve(base, 'active', 'p2-tasks.yaml'));
  const p3 = loadDoc(resolve(base, 'active', 'p3-tasks.yaml'));
  const completed = loadDoc(resolve(base, 'completed', 'completed-2025.yaml'));
  const archived = loadDoc(resolve(base, 'archived', 'archived-tasks.yaml'));

  const all = [...p1, ...p2, ...p3, ...completed, ...archived];

  const outPath = resolve(base, '..', 'tasks.yaml');
  const outDir = dirname(outPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, YAML.stringify({ tasks: all }, { indent: 2 }), 'utf8');
  console.log(`Combined ${all.length} tasks into ${outPath}`);
}

main();


