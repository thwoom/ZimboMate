# ZimboMate V2 – Developer Guide (2025‑10)

_This is the canonical reference for working on the current ZimboMate codebase. Update it whenever the implementation changes._

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [State Management Patterns](#state-management-patterns)
4. [Data & Services](#data--services)
5. [UI Layer Guidelines](#ui-layer-guidelines)
6. [Testing & Quality Gates](#testing--quality-gates)
7. [Development Workflow](#development-workflow)
8. [Build & Release](#build--release)
9. [Tooling & Conventions](#tooling--conventions)
10. [Keeping the Guide Accurate](#keeping-the-guide-accurate)

---

## Architecture Overview

```
src/
  components/            # React UI grouped by domain (game/, chronicle/, layout/, ui/)
  data/                  # Static Dungeon World datasets (class moves, spells, advancement tables)
  hooks/                 # Reusable hooks (modal form helpers, string-list handlers, etc.)
  lib/                   # Small shared libraries (formatters, markdown helpers)
  models/                # TypeScript domain models (Character, Campaign, Spells, etc.)
  services/              # Business logic (MoveCompendiumService, SpellCastingService, etc.)
  stores/                # Zustand stores for app state (characterStore, campaignStore, uiStore)
  styles/                # Tailwind / token config
  test/                  # Shared test utilities and mocks
  types/                 # Cross-cutting type aliases
  utils/                 # Generic utilities (guards, promises, id helpers)
public/                  # Static assets
docs/
  data/                  # Raw SRD datasets and structured exports
  product/               # Product PRDs and feature catalogs
  operations/            # Rollout, testing, release playbooks
  reference/             # Player/support/reference documentation
  comms/                 # Communication templates
  smoke-tests/           # Smoke test specs and scripts
  olddocs/               # Archived/legacy documents kept for reference
```

### Key Ideas

- **Domain-first folders:** Game-specific UI lives in `components/game`, assistant-specific widgets in `components/chronicle`. Reusable primitives sit in `components/ui`.
- **Data vs. services:** Everything in `src/data` is pure TypeScript data. Services consume those datasets and implement rules; they should remain side-effect free beyond store/API calls.
- **Single source of truth for docs:** Active docs live in the categorized subfolders under `docs/` (data, product, operations, reference, etc.); anything moved to `docs/olddocs/` is historical reference only.

---

## Tech Stack

| Area                | Selection                                                                                  |
|---------------------|---------------------------------------------------------------------------------------------|
| Framework           | React 19 + TypeScript 5                                                                    |
| Build tooling       | Vite 7 (ESM, React plugin)                                                                 |
| Desktop shell       | Tauri 2 (optional—`dev:tauri` / `build:tauri`)                                            |
| State               | Zustand 4 for stores, TanStack React Query 5 for async caching                             |
| UI primitives       | Radix UI + Tailwind CSS v4 tokens, Lucide icons, Sonner toasts                             |
| Forms               | React Hook Form + Zod (used where form validation is complex)                              |
| Animations          | Framer Motion (select components)                                                          |
| 3D / Audio          | React Three Fiber, @react-three/drei, howler (used by the assistant scene)                 |
| Testing             | Vitest + Testing Library, Playwright (UI/a11y/perf visual suites)                          |
| Lint / Formatting   | ESLint (custom config via @antfu preset), Prettier 3, perfectionist import ordering        |

---

## State Management Patterns

1. **Zustand stores live in `src/stores/`:**
   - `characterStore.ts` tracks player characters, advancement state, and selections.
   - `campaignStore.ts` handles journal entries, locations, NPCs, sessions.
   - Each store exposes selectors for React components; avoid `getState()` outside services/tests.

2. **Services orchestrate cross-store logic:**
   - `AdvancementService` enforces move prerequisites using `CLASS_MOVES`.
   - `SpellCastingService` manages preparation budgets, available spells, and progression.
   - Never mutate store state inside components; delegate to service helpers or store actions.

3. **Modal hooks (`useModalForm`, `useStringListField`)**
   - Manage reducer-based form state, validation, and cleanup when dialogs open/close.
   - All campaign modals already follow this pattern—reuse the hook for new modals.

4. **React Query** is available for remote data (e.g., when the assistant hits LLM endpoints). Co-locate hooks next to API clients in `services/` or `lib/assistant/`.

---

## Data & Services

- `src/data/advancement/classMoves.ts` and `spellProgression.ts` contain the authoritative Dungeon World advancement data.
- `src/data/spells/wizardSpells.ts` and `clericSpells.ts` are the canonical spell lists; each includes casting-rule metadata.
- Services (`MoveCompendiumService`, `SpellCastingService`, `SpellCastingService`, etc.) import these datasets—no runtime fetching is required.
- When adding new datasets, follow the same pattern:
  1. Keep the raw source in `docs/data/` if it comes from SRD notes.
  2. Convert it into a TypeScript module under `src/data/`.
  3. Update services/stores to consume the compiled dataset.

---

## UI Layer Guidelines

- **Design tokens:** use Tailwind utility classes that map to tokens (`bg-app`, `text-muted`, `border-primary`). Avoid inline HSL values.
- **Radix dialogs/forms:** prefer Radix primitives for accessibility. Ensure Esc closes dialogs, Tab trapping is respected, and keyboard shortcuts (Enter to add tags, Delete to remove) remain intact.
- **Path aliases:** use `@/` alias for imports (configured via `tsconfig.json` and Vite). Example: `import { Button } from '@/components/ui/Button'`.
- **3D scenes:** all Three.js usage sits under `components/game/Scene/...`; keep them isolated and ensure they lazy load to keep bundle size down.
- **Toast notifications:** use `sonner` (wrapped in `components/ui/ToastProvider`).

---

## Testing & Quality Gates

| Command                    | Purpose                                                                                                   |
|----------------------------|-----------------------------------------------------------------------------------------------------------|
| `npm run test:run`         | Vitest unit/integration suite (runs fast, headless)                                                       |
| `npm run test:a11y`        | Playwright accessibility checks                                                                           |
| `npm run test:perf`        | Playwright performance smoke                                                                              |
| `npm run test:visual`      | Playwright visual regression (Desktop Chrome snapshots)                                                   |
| `npm run lint`             | ESLint (perfectionist import sorting + hooks rules + TS)                                                  |
| `npm run format`           | Prettier write                                                                                             |
| `npm run test:smoke`       | CI “all-in-one” gate: lint → build → vitest → Playwright desktop smoke                                    |
| `npm run test:watch`       | Vitest watch mode                                                                                         |

Key expectations:

- Keep new code lint-clean (`npm run lint`). The config enforces sorted imports and hook dependency hygiene.
- Unit-test reducer/service logic in `src/test/` helpers or alongside the source file inside `__tests__`.
- Add Playwright coverage when UI interactions change (e.g., new modal flows).

---

## Development Workflow

1. **Install & run dev server**
   ```bash
   npm install
   npm run dev         # web
   npm run dev:tauri   # desktop shell (optional)
   ```
2. **Recommended extensions / settings**
   - VS Code: ESLint, Tailwind CSS IntelliSense, Radix Snippets.
   - Enable `editor.formatOnSave` with Prettier.
3. **Branching**
   - Use feature branches (`feat/`, `fix/`, `chore/`) and keep commits focused.
4. **Before pushing**
   ```bash
   npm run lint
   npm run test:run
   npm run test:visual   # if you touched visual components
   ```

---

## Build & Release

- **Web build:** `npm run build` → outputs to `dist/`.
- **Desktop (Tauri):** `npm run build:tauri` → cross-platform installer packages.
- **Preview:** `npm run preview` serves the built assets locally.
- **Release process:** see [`launch-plan`](./launch-plan.md), [`rollout`](../operations/rollout.md), and [`release-checklist`](../operations/release-checklist.md) for current launch sequencing.

Deployment artifacts (dist bundles, installers) must pass `npm run test:smoke` before release.

---

## Tooling & Conventions

- **ESLint config:** extends `@antfu/eslint-config` with custom rules (import sorting, hook dependency enforcement).
- **Type imports:** prefer `import type { ... } from '...'` at the top-level rather than inline type specifiers.
- **Naming conventions:** components/hooks use PascalCase, stores/services camelCase, types PascalCase.
- **Path sorting:** keep `import` statements grouped and sorted (the linter enforces the order automatically).
- **Documentation:** if you touch shared architecture, update this guide or its sibling docs with the same PR.

---

## Keeping the Guide Accurate

- When new directories appear or dependencies change, update the relevant sections.
- If you archive a doc (move to `docs/olddocs/`), note it here if it affects onboarding.
- The “living document” commitment is real: reviewers should push back on PRs that materially change architecture without touching this guide.

---

_Last updated: 2025-10-13_ (match the header with your changes when you modify this file.)
