# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Focus

**Primary Development**: repository root – ZimboMate V2, a Dungeon World companion with the official Matsu theme applied end to end.

**Legacy Packages** (archived outside the repo):

- C:/ZimboMateExternal/task-manager – Legacy task manager
- C:/ZimboMateExternal/dungeon-world – Original Dungeon World control panel
- C:/ZimboMateExternal/.claude-screenshots – Historical screenshot runs

## Development Commands (run from repo root)

`ash
npm run dev           # Vite development server
npm run dev:tauri     # Launch the Tauri shell
npm run build         # Production web build
npm run build:tauri   # Production desktop build
npm run test          # Vitest suite
npm run e2e           # Playwright E2E tests
npm run test:visual   # Playwright snapshot tests (Matsu theme)
npm run screenshot    # Update visual baselines (Desktop Chrome)
npm run screenshot:analyze # Compare current UI to baselines
npm run lint          # ESLint
npm run lint:fix      # ESLint with autofix
npm run format        # Prettier formatting
`

## Architecture & Technology Stack

### Core Technologies

- **React 19** with strict TypeScript
- **Vite** for dev/build with Tailwind CSS v4
- **Radix UI** primitives + shadcn registry (Matsu theme)
- **Zustand** for client state, React Query for data fetching
- **Tauri 2** bindings for the desktop build

### Key Dependencies

- Forms: React Hook Form + Zod
- Visual polish: Framer Motion, Lottie, class-variance-authority
- 3D/Audio: React Three Fiber, Drei, Rapier, Howler
- Testing: Vitest, Playwright, Testing Library, Axe, Lighthouse CI

### Design System

- **Theme**: Official Matsu palette (OKLCH tokens in src/index.css)
- **Fonts**: Nunito (UI) + PT Serif (headings)
- **Layout**: Panel-based workspace with 2px borders & watercolor texture overlay
- **Accessibility**: Keyboard-first controls and semantic landmarks

## Project Structure

`src/
  components/     # React UI modules
  hooks/          # Reusable hooks
  stores/         # Zustand stores
  services/       # Business logic & integrations
  styles/         # Tailwind entry + tokens (index.css)
tests/
  e2e/            # Playwright suites (visual, accessibility, perf)
visual-baselines/ # Stored Playwright baselines
visual-current/   # Latest snapshot captures
visual-diffs/     # Visual diff output`

## Development Guidelines

### Screenshot Regression Workflow (MANDATORY)

1.  pm run screenshot before large UI refactors to refresh baselines when appearance intentionally changes.
2.  pm run screenshot:analyze after each feature branch to ensure no unintended diffs.
3.  Capture supplemental PNGs with ests/e2e/visual/theme-visual.spec.ts updates when new panels appear.
4.  Attach new screenshots and list verification commands in every PR.

### Theme Discipline

- Keep the .texture overlay and root token imports intact.
- Use Tailwind utilities (g-primary, order-border, shadow-primary, chart palettes) instead of inline styles.
- Derive bespoke accents with color-mix from the provided palette if necessary.
- When upstream theme updates ship, rerun
  `ash
npx shadcn@latest add https://matsu-theme.vercel.app/r/matsu-theme.json
`
  then re-run the screenshot workflow.

### Testing Strategy

- Vitest for logic/unit coverage (~70% target, higher for src/stores & src/services).
- Playwright for end-to-end, accessibility, and performance suites.
- Playwright visual snapshots for UI drift detection.
- Lighthouse CI for performance audits when bundling.

### Code Style

- Strict TypeScript, explicit returns on hooks and utilities.
- PascalCase components, camelCase hooks/stores/utilities.
- Mutate Zustand state only inside store actions.
- Keep comments concise and intent-focused.

## Important Files

- src/App.Complete.tsx – Primary application composition.
- src/index.css – Tailwind + Matsu token definitions.
- ite.config.ts / itest.config.ts / playwright.config.ts – Tooling entry points.
-     ests/e2e/visual/theme-visual.spec.ts – Snapshot coverage across top-level tabs.

## Notes

- Ignore the archived packages unless specifically asked to port code from them.
- Re-run
  pm install after pulling structural changes (repo is no longer a monorepo).
- Document intentional UI changes and remaining TODOs in commits/PR descriptions.
