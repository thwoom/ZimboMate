#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import YAML from 'yaml';

type Status = 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled';
type Priority = 'P1' | 'P2' | 'P3';

interface Task {
  id: string;
  title: string;
  intent: string;
  owner?: string;
  status: Status;
  priority: Priority;
  labels?: string[];
  deps?: string[];
  steps?: string[];
  acceptance?: string[];
  artifacts?: string[];
}

interface Doc { tasks: Task[] }

function detectBase(): string {
  const candidates = [
    resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks'),
    resolve(process.cwd(), 'ops', 'tasks')
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return candidates[0];
}

function load(path: string): Task[] { if (!existsSync(path)) return []; const raw = readFileSync(path, 'utf8'); const parsed = YAML.parse(raw) as Doc | null; return parsed?.tasks ?? []; }
function save(path: string, tasks: Task[]) { const dir = dirname(path); if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); writeFileSync(path, YAML.stringify({ tasks }, { indent: 2 }), 'utf8'); }

function nextId(all: Task[]): string { let max = 0; for (const t of all) { const m = /^T-(\d+)$/.exec(t.id); if (m) max = Math.max(max, parseInt(m[1], 10)); } return `T-${String(max + 1).padStart(3, '0')}`; }

function main() {
  const base = detectBase();
  const p1Path = resolve(base, 'active', 'p1-tasks.yaml');
  const p2Path = resolve(base, 'active', 'p2-tasks.yaml');
  const p3Path = resolve(base, 'active', 'p3-tasks.yaml');
  const p1 = load(p1Path); const p2 = load(p2Path); const p3 = load(p3Path);
  const all = [...p1, ...p2, ...p3];

  const owner = 'cursor-agent';
  const tag = 'tag:theming-hud-migration';
  const parentId = 'T-228';

  const reserve = (): string => { const id = nextId(all); all.push({ id, title: '', intent: '', status: 'open', priority: 'P3' }); return id; };

  const tasks: Task[] = [
    {
      id: reserve(),
      title: 'T-228.A: Tailwind v4 install & config bootstrap',
      intent: 'Add Tailwind v4, initialize config with @theme inline scaffolding in monorepo (no styling changes yet).',
      owner, status: 'open', priority: 'P1', labels: ['theming', 'tailwind', tag], deps: [parentId],
      steps: [
        'Add Tailwind v4 deps and postcss config as needed',
        'Create base Tailwind config and entry CSS imports',
        'Verify build runs without style regressions'
      ],
      acceptance: [
        'Tailwind v4 present and builds pass',
        '@theme inline available for tokens'
      ]
    },
    {
      id: reserve(),
      title: 'T-228.B: Token maps (colors/spacing/radii/typography/elevation/motion/scale)',
      intent: 'Define token scales via @theme inline and expose var(--token) for JS consumption.',
      owner, status: 'open', priority: 'P1', labels: ['tokens', 'theming', tag], deps: [parentId],
      steps: [
        'Create theme maps for colors/spacing/radii/elevation/typography',
        'Add motion curves/durations and UI scale tokens',
        'Provide JS export helpers for tokens'
      ],
      acceptance: [
        'Tokens accessible via utilities and var(--token)',
        'JS helpers return expected values'
      ]
    },
    {
      id: reserve(),
      title: 'T-228.C: Initial utility pass & smoke verification',
      intent: 'Introduce minimal utility usage on non-critical UI to verify tokens/utilities without visual churn.',
      owner, status: 'open', priority: 'P2', labels: ['utilities', 'verification', tag], deps: [parentId],
      steps: [
        'Apply a small utility-only change in a safe component',
        'Run project smoke (dev + core flows)'
      ],
      acceptance: [
        'No regressions; tokens/utilities verified in UI'
      ]
    }
  ];

  // Append to appropriate buckets
  const add = (t: Task) => {
    if (t.priority === 'P1') p1.push(t); else if (t.priority === 'P2') p2.push(t); else p3.push(t);
  };
  tasks.forEach(add);

  save(p1Path, p1); save(p2Path, p2); save(p3Path, p3);
  console.log(`Added ${tasks.length} subtasks for ${parentId}`);
}

main();


