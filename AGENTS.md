# Repository Guidelines
ZimboMate V2 is a React + TypeScript workspace centered on the tabletop experience. Every contribution should preserve our Matsu Theme presentation and keep the build scripts green across platforms.

## Project Structure & Module Organization
The root workspace holds shared tooling, while the active application resides in packages/zimbomate-v2. Core UI flows live under src/components and state managers under src/stores. Domain utilities sit in src/lib and src/utils, with cross-cutting hooks in src/hooks. Tauri integration stays isolated in src-tauri. End-to-end helpers live in src/test, and Playwright suites are grouped in 	ests/accessibility and 	ests/performance. Generated artifacts (dist, 	est-output, isual-*) should never be edited manually.

## Build, Test, and Development Commands
- 
pm run dev — start Vite with hot reload.
- 
pm run dev:tauri — run the desktop shell.
- 
pm run build / 
pm run build:tauri — produce production bundles.
- 
pm run test:all — execute unit, accessibility, performance, and gaming suites.
- 
pm run lint:fix — apply ESLint fixes; follow with 
pm run format if Prettier drift is detected.
- 
pm run screenshot — refresh the visual baseline before committing UI changes.

## Coding Style & Naming Conventions
Follow the workspace ESLint configuration and keep TypeScript strictness in mind. Name React components and hooks in PascalCase; state stores stay camelCase (for example, campaignStore.ts). Use SCREAMING_SNAKE_CASE for shared constants, prefer named exports, and keep modules focused. Let Prettier enforce formatting via 
pm run format, and avoid lint disables unless justified with a comment.

## Theme Compliance (Matsu)
All UI work must align with the palette, typography, and spacing tokens published at https://matsu-theme.vercel.app/. Reference those tokens through Tailwind utilities or shared CSS variables instead of ad-hoc values. When modifying components, update baselines with 
pm run screenshot and analyze differences using 
pm run screenshot:analyze to confirm Matsu parity.

## Testing Guidelines
Use Vitest for unit coverage; maintain the configured thresholds (70% overall, elevated for src/stores and src/services). Playwright drives accessibility and performance checks—keep specs co-located with their suites and suffix helpers with .spec.ts. Record regressions with fresh screenshots when UI shifts.

## Commit & Pull Request Guidelines
Follow the conventional commit style already in history (chore(repo):, efactor:). Each pull request should describe intent, link issues or tickets, list verification commands, and attach screenshots or recordings for visual changes. Call out any theme-specific updates and reference the Matsu components or tokens applied.
