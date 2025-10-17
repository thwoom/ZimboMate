# Repository Guidelines

## Project Structure & Module Organization
The root app lives in `src/`, housing components, hooks, stores, and shared libs. Tailwind tokens and global styles live in `src/index.css`; treat those variables as the source of truth. Desktop shell logic sits in `src-tauri/`. Test suites land in `tests/` (for example `tests/e2e/visual` for Playwright snapshots). Generated artifacts such as `dist/`, `visual-*`, `screenshots/`, and `playwright-report/` stay read-only. Legacy workspaces (e.g., `ask-manager`, `dungeon-world`, `.claude-screenshots`) reside in `C:\ZimboMateExternal`.

## Build, Test, and Development Commands
- `npm run dev` / `npm run dev:tauri` — start the Vite web shell or the Tauri desktop shell.
- `npm run build` / `npm run build:tauri` — create production bundles for web and desktop.
- `npm run test` — execute unit and integration suites with Vitest.
- `npm run screenshot` then `npm run screenshot:analyze` — refresh and review Playwright visual baselines before merging UI changes.
- `npm run lint:fix` followed by `npm run format` — resolve ESLint issues and normalize formatting together.

## Coding Style & Naming Conventions
TypeScript is strict; favor typed hooks, explicit returns, and pure selectors. Components and hooks use PascalCase; stores, utilities, and Zustand actions stay camelCase. Avoid inline colors—prefer Tailwind utilities or token-backed variables. Use class-variance-authority for variant-heavy UI and mutate shared state only through store actions.

## Testing Guidelines
Vitest powers unit coverage—target about 70% overall (higher for `src/stores` and `src/services`). Playwright handles visual, accessibility, and performance suites. Name tests after the feature or scenario they protect, mirroring the component or route structure. Always run `npm run screenshot:analyze` when theme or layout shifts and update baselines when diffs are intentional.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`). Every PR should list verification commands, link relevant issues or tickets, and attach refreshed screenshots whenever UI changes occur. Flag outstanding TODOs so the next agent can continue the thread.

## AI Integration & Configuration
Set `OPENAI_API_KEY` before launching `npm run dev` or `npm run dev:tauri`; otherwise storyteller mode falls back to static prose. Optional overrides include `OPENAI_BASE_URL` and `OPENAI_RESPONSES_MODEL`, and `/init` refreshes credentials so the `llm_progress` channel streams correctly.
