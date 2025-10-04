# Repository Guidelines

Focus all work on the root application. Source lives directly under src/ (components, hooks, stores, lib utilities), Playwright specs and visual baselines live in ests/e2e/ and isual-_, and shared Tailwind tokens sit in src/index.css. Generated artifacts such as dist/, isual-_, screenshots/, and playwright-report/ must remain unedited. Legacy workspaces ( ask-manager, dungeon-world, .claude-screenshots) now live in C:\ZimboMateExternal for safekeeping.

## Build, Test, and Development Commands

- pm run dev /
  pm run dev:tauri – Vite web shell or the Tauri desktop shell.
- pm run build +
  pm run build:tauri – production bundles for web and desktop.
- pm run test – unit and integration suites;
  pm run test:visual covers Matsu snapshots.
- pm run screenshot then
  pm run screenshot:analyze – refresh and verify Playwright baselines before merging UI work.
- pm run lint:fix followed by
  pm run format – resolve ESLint and Prettier drift together.

## Theme Compliance (Matsu)

The UI must mirror https://matsu-theme.vercel.app/. Tokens live in src/index.css and Tailwind utilities (g-primary, order-border, shadow-primary, chart palettes). Re-run the registry installer when upstream theme changes ship:
`npx shadcn@latest add https://matsu-theme.vercel.app/r/matsu-theme.json`
After syncing tokens, keep Nunito/PT Serif font imports, preserve the .texture overlay at the app root, and retire ad-hoc HSL colors. Prefer Tailwind utilities or token-backed CSS variables over inline styles; derive bespoke accents with color-mix from the official palette.

## Coding Style & Naming Conventions

TypeScript stays strict; favor typed hooks, explicit return values, and pure selectors. Components and hooks use PascalCase, stores and helpers stay camelCase. Use class-variance-authority for variant-heavy UI, and mutate shared Zustand stores only through defined actions. Keep comments focused on intent when logic is non-obvious.

## Testing & Pull Requests

Run
pm run screenshot:analyze on every theme-affecting change; CI enforces the same suite. Hold Vitest coverage near 70% overall (higher for src/stores and src/services). Follow conventional commit prefixes (eat:, ix:, chore:,
efactor:). Each PR should list verification commands, link issues, and attach refreshed screenshots whenever visuals shift. Flag any remaining TODOs (e.g., legacy inline styles) so the next agent can finish the pass.

## AI Integration (ChatGPT Responses)

Set `OPENAI_API_KEY` in your environment before launching `npm run dev` or `npm run dev:tauri`; without it the storyteller tab falls back to pattern-only prose. Optional overrides:

- `OPENAI_BASE_URL` for custom gateways (defaults to https://api.openai.com/v1)
- `OPENAI_RESPONSES_MODEL` when you want something other than `gpt-4.1-mini`

The runtime streams progress events from Tauri via the `llm_progress` channel. Reinitialize with `/init` if you change credentials during a session.
