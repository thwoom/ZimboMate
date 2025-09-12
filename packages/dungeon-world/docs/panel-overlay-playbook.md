# Panel Overlay Playbook (Glassmorphism Exact-Match)

Living guide for porting panels to sidebar-style glass overlays with 1:1 visual parity.

## Goal

- Implement each panel as a sidebar‑glass overlay (clone) with a 1:1 match to the HP overlay.
- Show only on its page, move with the rail, and remain perfectly readable.

## Key Architecture (Do Not Deviate)

- Use `OverlayManager` for scoping:
  - Register: `OverlayManager.register('<layerId>', element)` → unregister fn
  - Switch: `OverlayManager.setActiveLayer(activePanelId)`
  - Character Stats layer: `character-stats`.
- Render overlays as fixed-position clones using the same classes as HP:
  - Outer: `<div class="sidebar sidebar--hp-clone" style={{ position:'fixed', left, top, width, height }}>`
  - Inner: `<div class="sidebar__inner floating-glass">…</div>`
- Do NOT add z-index hacks to clones unless explicitly stated (keeps native blur fidelity).

## Positioning Rules (Avoid Historical Bugs)

- Measure the REAL card’s DOMRect and use viewport coords only:
  ```ts
  const r = el.getBoundingClientRect()
  style = { position:'fixed', left:r.left, top:r.top, width:r.width, height:r.height }
  ```
- Never use margins or ad‑hoc offsets; anchor ONLY to the card rect.
- Rail motion:
  - Clone shifts via `.main-layout.rail-open .sidebar.sidebar--hp-clone { transform: translateX(var(--rail-delta)); }`
  - Disable hover-driven clip-path on clones; only transform should animate.
- Pointer events & stacking:
  - `#overlay-layer` → `pointer-events:none`, `z-index:1049` (below rail).
  - Rail and clones → `z-index:1050`, `pointer-events:auto`.
- Modals must render above overlays:
  - Render modal via `createPortal(document.body)` and give overlay a high `z-index` (e.g., 2000).

## Glass Consistency (Exact Match)

- Glass is provided by `.sidebar__inner::before` (buffer/outline) and `.sidebar__inner::after` (`backdrop-filter: blur(14px) saturate(140%)`).
- Do NOT modify these or add top-level filters.
- Inner sizing must be:
  ```css
  .sidebar--hp-clone .sidebar__inner { width:100%; height:100%; display:flex; flex-direction:column; }
  ```

## Readability & Content Styling (Apply to EVERY Overlay)

- Strip legacy row visuals inside the overlay scope (prevents double-dimming behind glass):
  ```css
  .sidebar.sidebar--hp-clone .stat-item,
  .sidebar.sidebar--hp-clone .combat-stats .stat-item,
  .sidebar.sidebar--hp-clone .experience-stats .stat-item,
  .sidebar.sidebar--hp-clone .load-stats .stat-item,
  .sidebar.sidebar--hp-clone .<panel>-stats .stat-item {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    filter: none !important;
    opacity: 1 !important;
  }
  ```
- Tone/weights matching HP:
  - Labels: `color: var(--color-text-secondary); font-weight:600;`
  - Values: `color: var(--color-text-primary); font-weight:700; text-shadow: 0 1px 12px rgba(255,255,255,0.10);`
- Typography differences create perceived halo differences; match HP font size/weight when in doubt.
- Extra wrappers with `opacity/filter/overflow` change compositing; keep wrapper minimal.
- To isolate backdrop vs styling: temporarily co-locate the new overlay at the HP rect, compare, then restore.
- Bars/progress in overlays: `filter:none; opacity:1;` compact height (~6px). No hover scale on buttons.

### Ultra-Compact Tiles (Bars)

For short bars that must contain many controls (e.g., 6 Attributes), use a compact, columnar layout while preserving glass clarity:

- Use a dense grid in the overlay scope:
  ```css
  .sidebar.sidebar--hp-clone .attributes-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 4px;
  }
  ```
- Make each control a small vertical button stack; disable hover transforms:
  ```css
  .sidebar.sidebar--hp-clone .attributes-grid .attribute-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px; padding: 4px 4px; border-radius: 8px; min-height: 24px;
    text-align: center;
  }
  .sidebar.sidebar--hp-clone .attribute-button:hover { transform: none; }
  ```
- Strip legacy visuals; keep tones identical to HP/Combat (prevents dim/blur):
  ```css
  .sidebar.sidebar--hp-clone .attributes-grid .attribute-card,
  .sidebar.sidebar--hp-clone .attributes-grid .attribute-button { background: transparent !important; border: none !important; box-shadow: none !important; }
  .sidebar.sidebar--hp-clone .attributes-grid .attribute-card *,
  .sidebar.sidebar--hp-clone .attributes-grid .attribute-button * { filter: none !important; opacity: 1 !important; }
  .sidebar.sidebar--hp-clone .attribute-name { color: var(--color-text-secondary); font-weight: 600; font-size: 10px; line-height: 1; }
  .sidebar.sidebar--hp-clone .attribute-score,
  .sidebar.sidebar--hp-clone .attribute-modifier { color: var(--color-text-primary); font-weight: 700; text-shadow: 0 1px 12px rgba(255,255,255,0.10); font-size: 12px; line-height: 1; }
  .sidebar.sidebar--hp-clone .attribute-button--debility { background: transparent !important; }
  ```
- If space is still tight, reduce `gap` by 1–2px or abbreviate labels further (but keep tone and weight consistent to preserve the halo match).

## Interactivity & Data

- Integrate with `useGameStore`. If no active character, provide LOCAL fallback state so buttons still work:
  ```ts
  const [localValue, setLocalValue] = useState(DEFAULT)
  // when character exists: update store; else: update local state
  ```
- Feature parity examples:
  - Clamp XP to threshold (`<= level + 7`).
  - Emit domain events via `panelEventBus` when thresholds are reached (e.g., `'level-up-available'`).
  - Provide direct action buttons that also emit events (e.g., open modal).

### Domain Event Integration (Equipment / Stats)

Some overlays are driven by equipment/state events. Subscribe via `panelEventBus` and update derived values without breaking store rules.

```ts
// Example: Load overlay – reflect equipment weight in real time
useEffect(() => {
  const off = panelEventBus.on('equipment-weight-changed', (evt: any) => {
    const totalWeight = evt?.data?.totalWeight
    if (typeof totalWeight === 'number') setEquipLoad(totalWeight)
  })
  return () => off()
}, [])

const maxLoad = character ? calculateMaxLoad(character) : fallbackMax
const load = character ? (equipLoad ?? character.load?.current ?? fallbackLoad) : (equipLoad ?? fallbackLoad)
const overloaded = load > maxLoad
```

Similarly, consider `'equipment-armor-changed'` and `'equipment-damage-changed'` for panels that surface Armor/Damage aggregates.

## Visibility Scoping

- Register each overlay element to its page layer (e.g., `'character-stats'`).
- Overlays must disappear on navigation via `OverlayManager.setActiveLayer(activePanelId)`.

## Replace Original Content

- Replace card body with a bare placeholder (e.g., `<div class="stat-card--<name>" />`) so only the overlay renders.
- For layout parity, prefer `<div class="stat-card stat-card--<name>" />` so the grid reserves height/spacing.
- Give placeholders a minimum vertical footprint (≈ 140px) to ensure a visible rect for the overlay to anchor to.

## Failure Handling (Fail Fast)

- If the anchor selector isn’t found, **LOG and SKIP** rendering (do not guess positions). Include the expected selector in the warning.

## Implementation Checklist

- [ ] Query anchor: `.stat-card--<name>`
- [ ] Measure rect; fixed positioning with viewport coords
- [ ] Classes EXACTLY as HP: "sidebar sidebar--hp-clone" → "sidebar__inner floating-glass"
- [ ] Register/unregister with `OverlayManager`
- [ ] Moves with rail; zero hover wiggle
- [ ] No dim row backgrounds; legible values (HP-like text-shadow)
- [ ] Buttons: store-first, fallback-otherwise; clamp to rules; emit events
- [ ] Co-locate next to HP for A/B; then restore to rect
- [ ] Hides on page switch; no overlay stacking
- [ ] Original card replaced with placeholder only

## Verification Checklist (Functionality + Integration)

- [ ] Visual: Glass tone/blur matches HP when co-located and at final position
- [ ] Interaction: Store updates when character exists; fallback works otherwise
- [ ] Motion: Smooth rail shift; pointer events correct
- [ ] Scoping: Visible only on its page; disappears on navigation; no overlap layers
- [ ] Modals: Render via portal above overlays; visible and interactive
- [ ] Accessibility: Keyboard navigable; ARIA not degraded
- [ ] Console: No warnings/errors; anchor-not-found logs once and skips

## Seeding / Dummy Character (Optional for Development)

To enable immediate end‑to‑end testing when the creator flow isn’t available, seed a temporary character on app start if none exists. Keep it contained to development/testing code paths.

```ts
// In MainLayout (dev-only bootstrap)
useEffect(() => {
  if (!state.activeCharacterId) setCharacter(createDummyCharacter())
}, [state.activeCharacterId, setCharacter])
```

Ensure inventories are initialized alongside the character so equipment-driven overlays (like Load) work from the start.


