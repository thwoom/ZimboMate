#!/usr/bin/env tsx

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
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
  category?: string;
}

interface TasksDoc { tasks: Task[] }

function loadYamlArray(path: string): Task[] {
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, 'utf8');
  const parsed = YAML.parse(raw) as TasksDoc | null;
  return parsed?.tasks ?? [];
}

function saveYamlArray(path: string, tasks: Task[]) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const content = YAML.stringify({ tasks }, { indent: 2 });
  writeFileSync(path, content, 'utf8');
}

function detectTasksRoots(): { activeP1: string; activeP2: string; activeP3: string; completed: string } {
  const candidates = [
    resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks'),
    resolve(process.cwd(), 'ops', 'tasks')
  ];
  for (const base of candidates) {
    const p1 = resolve(base, 'active', 'p1-tasks.yaml');
    const p2 = resolve(base, 'active', 'p2-tasks.yaml');
    const p3 = resolve(base, 'active', 'p3-tasks.yaml');
    const comp = resolve(base, 'completed', 'completed-2025.yaml');
    // Consider this root valid if either p1/p2/p3 or completed exists
    if (existsSync(dirname(p1)) || existsSync(comp)) {
      return { activeP1: p1, activeP2: p2, activeP3: p3, completed: comp };
    }
  }
  // Default to packages/task-manager
  const fallback = resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks');
  return {
    activeP1: resolve(fallback, 'active', 'p1-tasks.yaml'),
    activeP2: resolve(fallback, 'active', 'p2-tasks.yaml'),
    activeP3: resolve(fallback, 'active', 'p3-tasks.yaml'),
    completed: resolve(fallback, 'completed', 'completed-2025.yaml')
  };
}

function nextId(existing: Task[]): string {
  let max = 0;
  for (const t of existing) {
    const m = /^T-(\d+)$/.exec(t.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `T-${String(max + 1).padStart(3, '0')}`;
}

function main() {
  const roots = detectTasksRoots();
  const p1 = loadYamlArray(roots.activeP1);
  const p2 = loadYamlArray(roots.activeP2);
  const p3 = loadYamlArray(roots.activeP3);
  const completed = loadYamlArray(roots.completed);
  const all = [...p1, ...p2, ...p3, ...completed];

  const mkId = () => {
    const id = nextId(all);
    all.push({ id, title: '', intent: '', status: 'open', priority: 'P3' }); // temp to reserve id
    return id;
  };

  const labelTag = 'tag:theming-hud-migration';
  const owner = 'cursor-agent';

  // Top-level epic (P1)
  const epic: Task = {
    id: mkId(),
    title: 'Epic: Theming HUD Migration (Tailwind v4 + shadcn/ui)',
    intent: 'Migrate all UI to shadcn primitives styled via Tailwind v4 tokens; deliver HUD effects and strict a11y/perf guarantees.',
    owner,
    status: 'open',
    priority: 'P1',
    labels: ['epic', 'migration', labelTag],
    deps: [],
    steps: [
      'Establish token source of truth with Tailwind v4 @theme inline',
      'Adopt shadcn primitives and adapter layer',
      'Implement HUD frames, motion, and 3D overlays where applicable'
    ],
    acceptance: [
      'All UI flows through shadcn or adapter-wrapped components',
      'Tokens available in utilities and var(--token) for JS',
      'WCAG AA and performance budgets met'
    ]
  };

  // Phase 1 tasks (P1 unless noted)
  const phase1: Task[] = [
    {
      id: mkId(),
      title: 'Phase 1: Tailwind v4 setup and tokenization',
      intent: 'Install Tailwind v4; configure @theme inline; define tokens (colors, spacing, radii, elevation, typography, motion, scale).',
      owner,
      status: 'open',
      priority: 'P1',
      labels: ['theming', 'tailwind', labelTag],
      deps: [epic.id],
      steps: [
        'Install Tailwind v4 and initialize config',
        'Create tokens for colors/spacing/radii/elevation/typography',
        'Add motion/curve/scale tokens; expose var(--token) for JS'
      ],
      acceptance: [
        'Tailwind v4 active with @theme inline',
        'Tokens available in CSS and JS',
        'Build and lints pass'
      ]
    },
    {
      id: mkId(),
      title: 'Phase 1: Dark-mode bridge and ThemeService integration',
      intent: 'Introduce .dark class; keep ThemeService persistence/system-follow; map data-theme variants to token sets.',
      owner,
      status: 'open',
      priority: 'P1',
      labels: ['theming', 'dark-mode', labelTag],
      deps: [epic.id],
      steps: [
        'Add .dark class handling and sync with ThemeService',
        'Token mappings for light/dark/high-contrast',
        'Meta theme-color updates verified'
      ],
      acceptance: [
        '.dark class switches themes correctly',
        'High-contrast variant available',
        'ThemeService continues persistence and system-follow'
      ]
    },
    {
      id: mkId(),
      title: 'Phase 1: Install shadcn/ui, react-cyber-elements, Framer Motion, R3F (pinned)',
      intent: 'Add dependencies with locked versions; scaffold adapter layer; ensure basic imports compile.',
      owner,
      status: 'open',
      priority: 'P1',
      labels: ['deps', 'shadcn', 'framer-motion', 'r3f', labelTag],
      deps: [epic.id],
      steps: [
        'Install shadcn/ui and peers (Radix, tailwind-merge, clsx, lucide-react)',
        'Install react-cyber-elements, framer-motion, react-three-fiber',
        'Pin versions and document upgrade policy',
        'Scaffold adapter layer API (e.g., <HUDButton />)'
      ],
      acceptance: [
        'All deps installed and pinned',
        'Adapter layer compiles',
        'No runtime errors in dev build'
      ]
    },
    {
      id: mkId(),
      title: 'Phase 1: Core primitive migration (Buttons, Inputs, Selects, Dialogs, Tooltips, Menus, Tabs, Card, Toast, Switch, Badge)',
      intent: 'Replace bespoke styles with shadcn primitives; use tokens/utilities; keep layouts intact.',
      owner,
      status: 'open',
      priority: 'P1',
      labels: ['migration', 'components', labelTag],
      deps: [epic.id],
      steps: [
        'Migrate Button / Input / Label / Select / Textarea',
        'Migrate Dialog / Sheet / AlertDialog / Tooltip / DropdownMenu',
        'Migrate Tabs / Card / Toast(Sonner) / Switch / Badge'
      ],
      acceptance: [
        'All listed primitives use shadcn',
        'Legacy color/spacing/radius/shadow removed from these components',
        'Keyboard navigation and focus traps validated'
      ]
    },
    {
      id: mkId(),
      title: 'Phase 1: Global CSS cleanup and utilities pass',
      intent: 'Move global color/spacing/radius/shadow/typography to Tailwind utilities; leave only complex layout CSS.',
      owner,
      status: 'open',
      priority: 'P2',
      labels: ['cleanup', 'utilities', labelTag],
      deps: [epic.id],
      steps: [
        'Replace globals with utilities/tokens',
        'Audit remaining CSS for layout-only rules',
        'Ensure no bespoke color systems remain'
      ],
      acceptance: [
        'Globals rely on Tailwind utilities',
        'No duplicate color/spacing/radius/shadow scales remain',
        'Build and visual checks pass'
      ]
    }
  ];

  // Append to in-memory buckets
  const newP1: Task[] = [];
  const newP2: Task[] = [];
  const newP3: Task[] = [];

  const add = (t: Task) => {
    switch (t.priority) {
      case 'P1': newP1.push(t); break;
      case 'P2': newP2.push(t); break;
      default: newP3.push(t); break;
    }
  };

  add(epic);
  phase1.forEach(add);

  // Save merged arrays (append to existing)
  saveYamlArray(roots.activeP1, [...p1, ...newP1]);
  saveYamlArray(roots.activeP2, [...p2, ...newP2]);
  saveYamlArray(roots.activeP3, [...p3, ...newP3]);

  // Print summary
  const total = newP1.length + newP2.length + newP3.length;
  console.log(`Added ${total} tasks: P1=${newP1.length}, P2=${newP2.length}, P3=${newP3.length}`);
  console.log('Epic ID:', epic.id);
}

main();


