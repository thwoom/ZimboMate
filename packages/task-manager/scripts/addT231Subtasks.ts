#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import YAML from 'yaml';

type Status = 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
type Priority = 'P1' | 'P2' | 'P3';
interface Task { id: string; title: string; intent: string; owner?: string; status: Status; priority: Priority; labels?: string[]; deps?: string[]; steps?: string[]; acceptance?: string[] }
interface Doc { tasks: Task[] }

function baseDir(): string {
  const c = [resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks'), resolve(process.cwd(), 'ops', 'tasks')];
  for (const p of c) if (existsSync(p)) return p; return c[0];
}
function load(p: string): Task[] { if (!existsSync(p)) return []; const raw = readFileSync(p, 'utf8'); const d = YAML.parse(raw) as Doc | null; return d?.tasks ?? []; }
function save(p: string, tasks: Task[]) { const dir = dirname(p); if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); writeFileSync(p, YAML.stringify({ tasks }, { indent: 2 }), 'utf8'); }
function nextId(all: Task[]): string { let max = 0; for (const t of all) { const m = /^T-(\d+)$/.exec(t.id); if (m) max = Math.max(max, parseInt(m[1], 10)); } return `T-${String(max + 1).padStart(3, '0')}`; }

function main(){
  const base = baseDir();
  const p1Path = resolve(base, 'active', 'p1-tasks.yaml');
  const p2Path = resolve(base, 'active', 'p2-tasks.yaml');
  const p3Path = resolve(base, 'active', 'p3-tasks.yaml');
  const p1 = load(p1Path), p2 = load(p2Path), p3 = load(p3Path);
  const all = [...p1, ...p2, ...p3];
  const owner = 'cursor-agent';
  const tag = 'tag:theming-hud-migration';
  const parent = all.find(t => t.id === 'T-231');
  if (!parent) { console.error('T-231 not found'); process.exit(1); }
  const reserve = () => { const id = nextId(all); all.push({ id, title: '', intent: '', status: 'open', priority: 'P3' }); return id; };

  const subtasks: Task[] = [
    { id: reserve(), title: 'T-231.A: Migrate Button primitive', intent: 'Introduce shadcn-style Button with tokens/utilities and replace custom usage incrementally.', owner, status: 'open', priority: 'P1', labels: ['migration','components',tag], deps: [parent.id], steps: ['Create components/ui/button.tsx','Smoke build and basic usage in one component'], acceptance: ['Button primitive compiles and matches tokens','No regressions in build'] },
    { id: reserve(), title: 'T-231.B: Migrate Input and Label primitives', intent: 'Add Input/Label primitives and prepare replacements.', owner, status: 'open', priority: 'P1', labels: ['migration','components',tag], deps: [parent.id] },
    { id: reserve(), title: 'T-231.C: Dialog, Tooltip, Dropdown Menu', intent: 'Add Radix-backed Dialog/Tooltip/Menu wrappers styled by tokens.', owner, status: 'open', priority: 'P1', labels: ['migration','components',tag], deps: [parent.id] },
    { id: reserve(), title: 'T-231.D: Tabs, Card, Switch, Badge', intent: 'Add remaining primitives.', owner, status: 'open', priority: 'P2', labels: ['migration','components',tag], deps: [parent.id] },
    { id: reserve(), title: 'T-231.E: Toast (Sonner)', intent: 'Adopt Sonner for toasts consistent with tokens.', owner, status: 'open', priority: 'P2', labels: ['migration','components',tag], deps: [parent.id] }
  ];

  for (const t of subtasks) {
    if (t.priority === 'P1') p1.push(t); else p2.push(t);
  }
  save(p1Path, p1); save(p2Path, p2); save(p3Path, p3);
  console.log(`Added ${subtasks.length} subtasks under T-231`);
}

main();


