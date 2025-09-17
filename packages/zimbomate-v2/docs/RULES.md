---
description: Operational rules to run and develop ZimboMate V2 without breakages
globs: packages/zimbomate-v2/**/*
alwaysApply: true
---

### Dev server
- Always start from `packages/zimbomate-v2`:
  - `npm run dev` → must show Local: http://localhost:3000/
- Kill strays before switching: `taskkill /F /IM node.exe`

### Entrypoint and HTML
- **CURRENT ENTRY**: `packages/zimbomate-v2/main.tsx` (uses App.Enhanced)
- **BACKUP ENTRY**: `packages/zimbomate-v2/src/main.tsx` (if main.tsx fails)
- `packages/zimbomate-v2/index.html` must reference:
  - `<script type="module" src="./main.tsx"></script>`
- **App Versions**:
  - `App.Enhanced.tsx` - Current version with roll results UI & navigation
  - `App.Complete.tsx` - Previous stable version (fallback)

### Radix UI imports
- Use scoped packages only:
  - `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-scroll-area`
- Keep these in `dependencies` (not `devDependencies`).

### Tailwind/PostCSS (v4)
- PostCSS config lives at `packages/zimbomate-v2/postcss.config.cjs` (CommonJS):
  - plugins: `{ 'postcss-import': {}, '@tailwindcss/postcss': {} }`
- `src/index.css` must begin with `@import "tailwindcss";`
- Custom utilities must be alphanumeric; do not include pseudo-elements. Use plain selectors for `::before/::after`.

### Browser-safe dependencies
- Do not import Node core modules in client code (e.g. `events`, `fs`, `path`, `crypto`, `stream`, etc.).
  - If you need an event emitter, use a browser-friendly lib:
    - `npm i eventemitter3`
    - `import EventEmitter from 'eventemitter3'`
  - Or use the platform `EventTarget` and `CustomEvent`.
- Never rely on Vite aliases/polyfills for Node core in the browser.

### Defensive data access in UI
- Components must not throw if data is loading or partial. Guard reads and provide defaults:
  - Example: `const hp = character?.hp?.current ?? 0; const max = Math.max(1, character?.hp?.max ?? 1);`
  - Example: `const mod = character?.stats?.[stat]?.modifier ?? 0;`
- Panels should render a lightweight skeleton/placeholder instead of crashing on `undefined`.

### Ports
- `vite.config.ts` must include:
  - `server: { port: 3000, strictPort: true, open: false }`
- Never accept auto-fallback ports for the V2 app.

### HMR/cache recovery
- If UI or styles don’t update:
  - `taskkill /F /IM node.exe`
  - Delete `packages/zimbomate-v2/node_modules/.vite`
  - Re-run `npm run dev` from `packages/zimbomate-v2`

### Repo hygiene
- Do not add demo entry files at package root; keep demos as components/routes only.
- If a demo entry is needed temporarily, name it clearly and remove before commit.

### Pre-commit checklist
- From `packages/zimbomate-v2`:
  - `npm run dev` → shows http://localhost:3000/
  - Network tab: `main.tsx` and `src/index.css` return 200
  - Terminal: no `vite:import-analysis` or PostCSS errors
  - Page renders `App.Enhanced` with roll results UI and navigation
  - Test: Navigate between tabs, roll dice, see toast notifications
  - **CRITICAL**: Check console for component import errors

