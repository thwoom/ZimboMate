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
  category?: string;
}

interface Doc { tasks: Task[] }

function detectTasksBase(): string {
  const candidates = [
    resolve(process.cwd(), 'packages', 'task-manager', 'ops', 'tasks'),
    resolve(process.cwd(), 'ops', 'tasks')
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return candidates[0];
}

function loadTasks(path: string): Task[] {
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, 'utf8');
  const parsed = YAML.parse(raw) as Doc | null;
  return parsed?.tasks ?? [];
}

function saveTasks(path: string, tasks: Task[]) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const content = YAML.stringify({ tasks }, { indent: 2 });
  writeFileSync(path, content, 'utf8');
}

function loadActiveBuckets(base: string) {
  const p1Path = resolve(base, 'active', 'p1-tasks.yaml');
  const p2Path = resolve(base, 'active', 'p2-tasks.yaml');
  const p3Path = resolve(base, 'active', 'p3-tasks.yaml');
  return {
    p1Path,
    p2Path,
    p3Path,
    p1: loadTasks(p1Path),
    p2: loadTasks(p2Path),
    p3: loadTasks(p3Path),
  };
}

function nextId(all: Task[]): string {
  let max = 0;
  for (const t of all) {
    const m = /^T-(\d+)$/.exec(t.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `T-${String(max + 1).padStart(3, '0')}`;
}

function main() {
  const base = detectTasksBase();
  const { p1Path, p2Path, p3Path, p1, p2, p3 } = loadActiveBuckets(base);
  const all = [...p1, ...p2, ...p3];

  const epic = all.find(t => (t.labels || []).includes('epic') || /Epic: Theming HUD Migration/i.test(t.title));
  if (!epic) {
    console.error('❌ Epic not found. Run addThemingTasks.ts first.');
    process.exit(1);
  }

  const phase1Ids = all.filter(t => /^Phase 1:/i.test(t.title)).map(t => t.id);

  const owner = 'cursor-agent';
  const tag = 'tag:theming-hud-migration';

  const reserveId = (): string => {
    const id = nextId(all);
    all.push({ id, title: '', intent: '', status: 'open', priority: 'P3' });
    return id;
  };

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

  // Phase 2 (migration, HUD, motion, R3F)
  const phase2Deps = [epic.id, ...phase1Ids];
  const phase2: Task[] = [
    {
      id: reserveId(),
      title: 'Phase 2: Panel migrations batch 1 (Stats, Equipment, Moves, Nav)',
      intent: 'Refactor these panels to shadcn primitives and tokens; remove bespoke theming CSS.',
      owner, status: 'open', priority: 'P1', labels: ['migration', 'components', tag], deps: phase2Deps,
      steps: [
        'Migrate CharacterStatsPanel primitives',
        'Migrate EquipmentPanel primitives',
        'Migrate MovesPanel primitives',
        'Migrate menus/navigation to shadcn'
      ],
      acceptance: [
        'All listed panels use shadcn primitives',
        'No legacy color/spacing/radius/shadow in these panels',
        'Keyboard/focus flows validated'
      ]
    },
    {
      id: reserveId(),
      title: 'Phase 2: Panel migrations batch 2 (Inventory, Content Studio, Move Library)',
      intent: 'Refactor remaining high-traffic panels to shadcn primitives and tokens.',
      owner, status: 'open', priority: 'P2', labels: ['migration', 'components', tag], deps: phase2Deps,
      steps: [
        'Migrate InventoryPanel primitives',
        'Migrate ContentStudio primitives',
        'Migrate MoveLibrary primitives'
      ],
      acceptance: [
        'Panels migrated and visually consistent with tokens',
        'No bespoke theming CSS remains in these panels'
      ]
    },
    {
      id: reserveId(),
      title: 'Phase 2: HUDFrame system + react-cyber-elements integration',
      intent: 'Introduce reusable HUDFrame wrappers; integrate CyberFrame/HUDButton/GlitchText as needed.',
      owner, status: 'open', priority: 'P1', labels: ['hud', 'react-cyber-elements', tag], deps: phase2Deps,
      steps: [
        'Create HUDFrame wrapper with SVG overlays and scanlines',
        'Wrap shadcn Card/Dialog/Sheet with HUDFrame',
        'Integrate HUDButton and GlitchText where beneficial'
      ],
      acceptance: [
        'HUDFrame applied to applicable primitives',
        'Visuals tokenized; defaults allowed for secondary effects'
      ]
    },
    {
      id: reserveId(),
      title: 'Phase 2: Motion layer (Framer Motion) + tokenized curves/variants',
      intent: 'Implement power-on/glitch transitions; expose motion tokens; support motion-reduce.',
      owner, status: 'open', priority: 'P1', labels: ['motion', 'framer-motion', tag], deps: phase2Deps,
      steps: [
        'Add tokenized curves/durations (ease-out 300ms, ease-in 200ms, glitch 50–150ms, cosmic 800–1200ms)',
        'Apply variants to HUDFrame/primitives',
        'Honor prefers-reduced-motion globally'
      ],
      acceptance: [
        'Motion budgets met; 60fps on desktop in critical paths',
        'Variants switched via tokens; reduced-motion disables animations'
      ]
    },
    {
      id: reserveId(),
      title: 'Phase 2: R3F overlays (intro, HUD grid, panel backdrops) + fallbacks',
      intent: 'Introduce optional 3D overlays with graceful SVG/CSS fallbacks and runtime toggle.',
      owner, status: 'open', priority: 'P2', labels: ['r3f', '3d', tag], deps: phase2Deps,
      steps: [
        'Intro scene (animated logo) in <Canvas>',
        'HUD background grid overlay',
        'Optional panel backdrops',
        'Feature detection + toggle + SVG/CSS fallbacks'
      ],
      acceptance: [
        '3D scenes lazy-loaded and isolated',
        'Fallbacks render correctly in unsupported contexts'
      ]
    },
    {
      id: reserveId(),
      title: 'Phase 2: Adapter layer deep pass (unified API)',
      intent: 'Ensure unified props/slots across shadcn and cyber components; add stories/examples.',
      owner, status: 'open', priority: 'P2', labels: ['adapter', 'components', tag], deps: phase2Deps,
      steps: [
        'Define shared props for HUDButton and base Button',
        'Add storybook/examples for adapter components',
        'Document adapter usage patterns'
      ],
      acceptance: [
        'Adapters provide consistent API across implementations',
        'Docs and examples published'
      ]
    }
  ];

  const phase3Deps = [...phase2Deps, ...phase2.map(t => t.id)];
  const phase3: Task[] = [
    {
      id: reserveId(),
      title: 'Phase 3: Accessibility hardening (axe, AA contrast, keyboard flows)',
      intent: 'Add automated axe checks; ensure AA contrast; validate keyboard flows and focus traps.',
      owner, status: 'open', priority: 'P1', labels: ['a11y', 'quality', tag], deps: phase3Deps,
      steps: [
        'Integrate axe-core in CI; fix violations',
        'High-contrast token variant + prefers-contrast',
        'Playwright keyboard nav and focus trap tests'
      ],
      acceptance: [
        'Lighthouse ≥ 90 (A11y, Best Practices)',
        'WCAG AA contrast across surfaces and text',
        'All dialogs/menus pass keyboard tests'
      ]
    },
    {
      id: reserveId(),
      title: 'Phase 3: Testing & visual regression (themes/modes/motion)',
      intent: 'Baseline visual snapshots per theme/mode; add reduced/normal motion snapshots; stabilize CI.',
      owner, status: 'open', priority: 'P1', labels: ['testing', 'playwright', tag], deps: phase3Deps,
      steps: [
        'Snapshot Dark/Light/Moon/High-Contrast/Cosmic/Timey-Wimey',
        'Reduced-motion vs normal-motion snapshots',
        'Version baselines and document process'
      ],
      acceptance: [
        'Stable CI snapshots with clear update workflow',
        'Coverage for key panels and primitives'
      ]
    },
    {
      id: reserveId(),
      title: 'Phase 3: Extension/webview parity (simplified HUD + feature detection)',
      intent: 'Apply tokens and shadcn in VS Code webview; use simplified HUD; detect GPU/audio features.',
      owner, status: 'open', priority: 'P2', labels: ['extension', 'webview', tag], deps: phase3Deps,
      steps: [
        'Theme webview with shared tokens and primitives',
        'Simplified HUD (scanlines/glitch text)',
        'Feature detection + fallbacks for WebGL/audio'
      ],
      acceptance: [
        'Webview performant and consistent',
        'Fallbacks applied when unavailable'
      ]
    },
    {
      id: reserveId(),
      title: 'Phase 3: Documentation & release (tokens, HUD, governance)',
      intent: 'Publish token catalog, HUD patterns, adapter docs; pin versions; prepare Changesets.',
      owner, status: 'open', priority: 'P2', labels: ['docs', 'release', tag], deps: phase3Deps,
      steps: [
        'Token catalog + usage guide',
        'HUD patterns and adapter API docs',
        'Pin/lock versions and write upgrade policy',
        'Changesets per milestone'
      ],
      acceptance: [
        'Docs published; governance recorded',
        'Changesets ready for release'
      ]
    }
  ];

  // Distribute new tasks by priority
  const appendP1 = [...p1, ...phase2.filter(t => t.priority === 'P1'), ...phase3.filter(t => t.priority === 'P1')];
  const appendP2 = [...p2, ...phase2.filter(t => t.priority === 'P2'), ...phase3.filter(t => t.priority === 'P2')];
  const appendP3 = [...p3, ...phase2.filter(t => t.priority === 'P3'), ...phase3.filter(t => t.priority === 'P3')];

  saveTasks(p1Path, appendP1);
  saveTasks(p2Path, appendP2);
  saveTasks(p3Path, appendP3);

  console.log(`Added Phase 2 tasks: ${phase2.length}, Phase 3 tasks: ${phase3.length}`);
}

main();


