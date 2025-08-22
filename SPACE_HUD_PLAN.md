# Rebuilding the Dungeon World Control Panel (Space-HUD Edition) — Tool-Integrated Plan

## 1) Vision & Experience

- **Unified Space-HUD Theme**
  - **Design tokens via native CSS variables** (HSL/alpha): `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--motion-*`. These are the *only* source of truth for visuals.  
  - **Tailwind** consumes tokens for layout/typography/utilities; **Panda CSS** consumes the same tokens for typed component “recipes.”
  - **Augmented-UI** provides image-free sci-fi frames (clipped corners, notches, seams, scanlines) layered with **native CSS effects** (clip-path, mask-composite, backdrop-filter, gradient stacks) to achieve chrome without bitmaps.

- **Accessibility**
  - WCAG AA contrast validated per token pair.
  - Full **Radix UI** keyboard/focus semantics across dialogs/menus.
  - **prefers-reduced-motion** respected in **Framer Motion** and in any timed CSS animations.
  - HUD effects and 3D/particles gated behind **feature flags** in **Zustand**; default **off**.

- **Motion Philosophy**
  - Micro-interactions (hover, press, list reorders) via **Framer Motion** with short timings and motion tokens.
  - Spectacle moments (level-up, rare drop) optionally enhanced by **three.js/@react-three/fiber/drei** + **react-postprocessing** + **tsParticles** (gated).

---

## 2) Core Architecture

### Frontend

- **Framework:** React + TypeScript (Vite).
- **UI Behavior:** **Radix UI** primitives for accessibility/focus management.
- **Component Shells:** **shadcn/ui** as thin wrappers over Radix; *every* shell reskinned using tokens + **Panda recipes** (typed variants).
- **Layout & Utilities:** **Tailwind CSS** for spacing, grid/flex, typography utilities mapped to tokens.  
- **Styling Compiler Stack:** **Panda CSS** (recipes, slots, cva-like APIs) + **PostCSS + Autoprefixer** behind both Tailwind and Panda.
- **Icons & Type:** **Lucide** SVG via **vite-plugin-svgr + SVGO**; system UI font stack (no font payload).
- **State:** **Zustand** for feature flags and lightweight global UI state (`ui.skin`, `effects.particles.enabled`, `effects.three.enabled`, `haptics.enabled`).
- **Async:** React Query (or SWR) for data fetch/cache; immutable data boundaries.
- **Animation:** **Framer Motion** with theme motion tokens; `reducedMotion` guard.

### Routing / Targets

- **Desktop Primary:** **Tauri** (menus, file access, OS keychain).  
- **Web/PWA Secondary:** Vite + React Router; offline via SW + cache rules.  
- (If you later need SSR: keep Next.js as an alternate target, but *current* plan is Vite-first.)

### Data Layer

- **Local-first:** SQLite (via Drizzle/Prisma) for desktop; IndexedDB fallback in web.  
- **Sync:** optional service (Rust/Axum or Node/Fastify) + Postgres/Supabase.  
- **Schema:** `characters`, `moves`, `inventory`, `sessions`, `notes`, `settings` (feature flags persist), `theme_profiles`. All migrations versioned.

### Backend/API (Optional Phase)

- **Service:** Rust (Axum) or Node (Fastify).  
- **Auth:** Supabase/Clerk (OAuth/email link).  
- **Realtime/Collab:** Y.js CRDT + WebSockets if/when co-op lands.

---

## 3) Space-HUD Feature Breakdown (Bound to Tools)

### Character Management
- CRUD with **shadcn/Radix** forms; shells styled by **Panda recipes**; layout by **Tailwind**.  
- Auto-XP on failed rolls.  
- Export/Print: CSS print theme uses tokens + **Augmented-UI** “flat” variant for legible output.

### Dice Roller
- 2D micro-roller UI (**Framer Motion**), history and modifiers.  
- **Optional 3D mode**: **R3F** dice with **react-postprocessing** (bloom/outline) for highlights. Gate via **Zustand** flag.

### Session Control
- Markdown notes with autosave; session timer; EoS reminders.  
- **Toasts** via Radix; dialogs/sheets via **shadcn**; shells styled by **Panda** and framed by **Augmented-UI**.

### HUD Presentation
- Responsive grid (Tailwind CSS).  
- Panels/Toolbars/Dialogs/HUD pills: **Radix behavior → shadcn shell → Panda recipe → Augmented-UI chrome + native CSS effects**.  
- **tsParticles** for celebratory bursts (flagged); paused offscreen.

### Themes We Ship (token-driven)
- **Classic:** baseline flat, high-legibility.
- **Cosmic:** glass + neon seams + scanlines (**Augmented-UI** heavy).
- **Moebius:** artful outlines/wireframes; lower glow, sharper contrast.  
Switch via **Zustand** `ui.skin` → tokens update Tailwind/Panda/Framer automatically.

---

## 4) Development Workflow (Tool-Enforced)

### Foundations
- **Token Authoring:** Start in `/design/tokens.css` (native variables). Generate Tailwind theme from these via a small build step or manual mapping in `tailwind.config.ts`. Panda consumes tokens directly in `panda.config.ts`.  
- **PostCSS + Autoprefixer:** Required in Vite pipeline for cross-browser CSS.  
- **Figma Library:** Mirror tokens + components; document Augmented-UI patterns.

### Component Library & Docs
- **Storybook (or Ladle)** is mandatory:  
  - Stories include token knobs (color mode, radius, shadow, motion).  
  - Visual diffs for *each* shell in **Classic/Cosmic/Moebius**.  
  - Fixture scenes for effects: particles on/off, R3F on/off, reduced motion on/off.

### Testing & Quality
- **Playwright** E2E: dialog focus traps, keyboard navigation, dice roll flow, theme toggles, reduced-motion compliance.  
- **Vitest + Testing Library** for unit/integration.  
- **ESLint + Prettier + eslint-plugin-tailwindcss**:  
  - Rule: **no raw colors or spacing**—must reference tokens.  
  - Tailwind class ordering enforced.  
- **SVGO + vite-plugin-svgr** for Lucide SVG ingestion/optimization.

### CI/CD
- Pipeline (GitHub Actions): typecheck → lint → unit → Storybook build → Playwright (headed/CI mode) → Vite build (web) → Tauri bundle (desktop).  
- Artifacts: installers (.msi/.dmg/.AppImage), Storybook static site.

### Distribution
- **Desktop:** Tauri bundler (signed installers).  
- **Web/PWA:** Vite output + SW; deploy to Vercel/Netlify.  
- **Docs:** Publish Storybook; keep `/docs` ADRs updated.

### Governance
- ADRs for choices (Tailwind+Panda coexistence, Augmented-UI usage boundaries, motion policy).  
- Conventional commits, Husky + lint-staged gates.

---

## 5) Long-Term Enhancements (Tools Pre-Wired)

- **Plugins:** Public API surface for custom playbooks/moves using Panda recipe slots and Radix behaviors to guarantee accessibility.  
- **Cloud sync & co-op:** Y.js rooms; server relays; per-character permissions.  
- **Marketplace:** Token-driven premium skins that still respect Space-HUD visual language.

---

## 6) Implementation Roadmap (Concrete, Tool-Bound)

### Milestone 0 — Environment Lock-In (1–2 days)
- Install & configure: Tailwind, Panda, PostCSS+Autoprefixer, Radix, shadcn, Lucide via SVGR/SVGO, Zustand, Framer Motion, tsParticles, R3F + drei + react-postprocessing, Storybook/Ladle, Playwright, ESLint+Prettier+tailwind plugin, Vite plugins, Tauri.  
- Create `/design/tokens.css` and map into `tailwind.config.ts` and `panda.config.ts`.  
- Add **Zustand store** for `ui.skin` and effect flags.  
- Add **global reduced-motion detector** and motion token helper.

**Exit criteria:** App boots; token override toggles in a barebones Storybook; reduced-motion test passes.

### Milestone 1 — Shell System (1 week)
- Build **Panda recipes** for: Panel, Toolbar, Dialog, HUD Pill, Button, Toggle, Tabs, Slider.  
- Wrap **Radix** behaviors with **shadcn** shells; apply **Augmented-UI** frames per variant.  
- Provide **three shipped themes** (Classic/Cosmic/Moebius); toggle in Storybook.

**Exit criteria:** Visual parity across shells in Storybook under all three themes; Playwright snapshots stable.

### Milestone 2 — HUD Layout & Core Screens (1 week)
- Implement responsive **Tailwind** grid layout.  
- Integrate Character List/Detail, Moves, Inventory, Session screens using shells.  
- Add **Framer Motion** micro-interactions; ensure `prefers-reduced-motion` reflects immediately.  
- Add **tsParticles** celebratory effect with flag.

**Exit criteria:** Keyboard nav complete; dialogs focus-safe; particles off by default; E2E flows pass.

### Milestone 3 — Dice & Spectacle (3–5 days)
- 2D roller (always on).  
- **3D roller** (**R3F** dice + **drei** orbit controls locked + **react-postprocessing** bloom/outline); flag-gated.  
- Performance budgets: <2% CPU idle cost when 3D off; particles pause offscreen.

**Exit criteria:** 3D can be toggled live; Playwright scenario verifies no-3D path works identically.

### Milestone 4 — Data, Export, Packaging (1 week)
- Wire SQLite/IndexedDB; persist feature flags and theme profiles.  
- Print/PDF styles (Augmented-UI “flat” preset).  
- Tauri bundling with code signing; PWA build with offline cache.

**Exit criteria:** Desktop installer produced; PWA installs; export to PDF looks consistent.

---

## 7) Coexistence Rules (Tailwind × Panda × Tokens)

- **Tokens:** Only in `tokens.css`. Tailwind theme maps to those; Panda recipes read them directly.  
- **Layout vs. Look:**  
  - **Tailwind** = layout/spacing/typography utilities only.  
  - **Panda** = component skins/variants/slots (visual polish).  
- **No raw literals:** ESLint rule blocks raw hex/rgb/px for visual properties.  
- **Augmented-UI:** Applied *after* Panda classnames, using tokenized custom properties for seams/angles/glow.  
- **Motion:** All durations/distances/springs sourced from motion tokens; **Framer** variants read them; CSS animations (if any) mirror them.

---

## 8) Feature Flags (Zustand)

```text
ui.skin: "classic" | "cosmic" | "moebius"
effects.particles.enabled: boolean
effects.three.enabled: boolean
effects.bloom.enabled: boolean
motion.reduced: boolean (derived)
```

- Defaults: all effects **false**; motion respects OS setting.

---

## 9) Acceptance Tests (Playwright)

1. **Accessibility Core**
   - Radix dialogs trap focus; Esc closes; Tab cycles; screen reader labels present.
   - AA contrast verified for all interactive states across themes.

2. **Motion Compliance**
   - With reduced motion: no scale/slide animations > 50ms; 3D/particles forcibly off.

3. **Theme Integrity**
   - Snapshot diffs for each shell in Classic/Cosmic/Moebius; tokens swap without layout shift.

4. **Dice Flow**
   - 2D roll produces correct ranges and history.  
   - 3D enabled → render succeeds; disabled → identical UX sans canvas.

5. **Persistence**
   - Feature flags/theme persisted; cold start restores exactly.

6. **Packaging**
   - Tauri build launches; Web/PWA installs; offline notes persist.

---

## 10) Repository Layout (Enforced)

```
/design/
  tokens.css              # CSS variables (HSL) — single source of truth
/docs/
  adrs/*.md               # decisions, motion policy, HUD chrome rules
/src/
  /app                    # routes/views
  /components
    /primitives           # Radix + shadcn wrappers (unstyled behavior)
    /shells               # Panda recipes + Augmented-UI chrome
    /hud                  # Panel/Toolbar/Dialog/HUD pill composites
  /icons                  # Lucide via SVGR (optimized by SVGO)
  /state                  # Zustand store (feature flags, UI state)
  /styles                 # Tailwind base, Augmented-UI theme glue
  /effects                # R3F scenes, post-fx, tsParticles wrappers
  /utils                  # tokens accessors, reducedMotion helpers
.storybook/ or /ladle/
playwright/
```

---

## 11) Non-Negotiable Tool Usage (Quick Reference)

- **CSS Variable Tokens**: all visuals sourced here.  
- **Tailwind CSS**: layout/typography utilities only.  
- **Panda CSS**: typed recipes for every shell; variants documented.  
- **PostCSS + Autoprefixer**: always on in Vite.  
- **Radix UI + shadcn**: behavior + shells for every interactive element.  
- **Augmented-UI + Native CSS effects**: HUD chrome; no images.  
- **Framer Motion**: micro-interactions + overlay transitions.  
- **three.js/@react-three/fiber/drei + react-postprocessing**: optional 3D dice/parallax; gated.  
- **tsParticles**: optional bursts; gated and paused offscreen.  
- **Lucide + SVGR + SVGO**: icon pipeline.  
- **Zustand**: feature flags + theme state.  
- **Storybook/Ladle**: component/theming lab with controls.  
- **Playwright**: E2E for accessibility, motion, theming, dice.  
- **ESLint + Prettier + eslint-plugin-tailwindcss**: quality gates.  
- **Vite**: build/dev.  
- **Tauri**: desktop packaging, keychain, updates.

---

## 12) Risks & Mitigations

- **Tailwind + Panda overlap** → Strict “layout vs look” rule; lint rule for disallowed properties in JSX classNames.  
- **Effect bloat** → All spectacle tools behind flags; Storybook perf panel and Playwright perf budget checks.  
- **3D perf on low-end** → Canvas detached unless explicitly enabled; SSR-safe lazy imports.  
- **A11y regression with heavy chrome** → Radix focus rings remain visible; Augmented-UI never obscures focus outlines.
