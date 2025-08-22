# Dungeon World Control Panel (Space-HUD Edition) — Task Roadmap

This file is a **working execution guide**. It complements `SPACE_HUD_PLAN.md` (full spec).  
CursorAI should follow tasks here step-by-step, but always validate choices against the spec.

---

## Milestone 0 — Environment Lock-In (1–2 days)

**Tasks**
- Install & configure: Tailwind, Panda, PostCSS+Autoprefixer, Radix, shadcn, Lucide via SVGR/SVGO, Zustand, Framer Motion, tsParticles, R3F + drei + react-postprocessing, Storybook/Ladle, Playwright, ESLint+Prettier+tailwind plugin, Vite plugins, Tauri.  
- Create `/design/tokens.css` (HSL vars).  
- Map tokens into `tailwind.config.ts` and `panda.config.ts`.  
- Add Zustand store for `ui.skin` and effect flags.  
- Add reduced-motion detector + motion token helper.

**Exit Criteria**
- App boots.  
- Tokens override toggles in Storybook.  
- Reduced-motion test passes.

---

## Milestone 1 — Shell System (1 week)

**Tasks**
- Build Panda recipes for: Panel, Toolbar, Dialog, HUD Pill, Button, Toggle, Tabs, Slider.  
- Wrap Radix behaviors with shadcn shells.  
- Apply Augmented-UI frames per variant.  
- Implement Classic, Cosmic, Moebius themes.  
- Storybook stories for all.

**Exit Criteria**
- Visual parity across shells in all themes.  
- Playwright snapshots stable.

---

## Milestone 2 — HUD Layout & Core Screens (1 week)

**Tasks**
- Implement responsive Tailwind grid layout.  
- Add Character List/Detail, Moves, Inventory, Session screens.  
- Integrate Framer Motion micro-interactions.  
- Ensure reduced-motion compliance.  
- Add tsParticles celebratory effect (flagged).

**Exit Criteria**
- Keyboard navigation complete.  
- Dialogs safe for focus/esc.  
- Particles off by default.  
- E2E flows pass.

---

## Milestone 3 — Dice & Spectacle (3–5 days)

**Tasks**
- Build 2D dice roller with history.  
- Add 3D dice roller (R3F + drei + react-postprocessing bloom/outline).  
- Gate 3D via Zustand flag.  
- Optimize: <2% CPU idle cost when 3D off.

**Exit Criteria**
- 3D toggle works live.  
- Playwright verifies no-3D flow works identically.

---

## Milestone 4 — Data, Export, Packaging (1 week)

**Tasks**
- Wire SQLite/IndexedDB persistence.  
- Persist feature flags & theme profiles.  
- Print/PDF export (Augmented-UI flat preset).  
- Tauri bundling with signing.  
- Web/PWA build with offline cache.

**Exit Criteria**
- Desktop installer produced.  
- PWA installs.  
- Export to PDF consistent.

---

## Acceptance Tests (Playwright)

1. **Accessibility Core**
   - Radix dialogs trap focus; Esc closes; Tab cycles; screen reader labels present.
   - AA contrast verified for all interactive states across themes.

2. **Motion Compliance**
   - With reduced motion: no animations >50ms.  
   - 3D/particles forcibly off.

3. **Theme Integrity**
   - Snapshot diffs: Classic, Cosmic, Moebius.  
   - Tokens swap with no layout shift.

4. **Dice Flow**
   - 2D roll produces correct results + history.  
   - 3D enabled → render succeeds.  
   - Disabled → identical UX sans canvas.

5. **Persistence**
   - Flags/themes restored on cold start.

6. **Packaging**
   - Tauri build launches.  
   - Web/PWA installs.  
   - Offline notes persist.
