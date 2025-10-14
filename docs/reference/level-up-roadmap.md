# ZimboMate V2 - Level-Up Roadmap

Last updated: 14 Oct 2025
Owner: Gameplay / Chronicle Pod
Status: Phases 0–3 complete (wizard live) – Phase 4 polish outstanding

## Why This Exists

Dungeon World advancement is more than incrementing a level counter – players must spend XP, choose a new move (or stat bump, capped at 18), update HP/Load, and sync spell repertoires. This roadmap tracks how we implemented the full ceremony and what polish remains.

## Guiding Principles

1. **Rules fidelity** – Mirror the Dungeon World SRD (stat cap 18, one move per level, optional stat raise, caster spell additions).
2. **No silent upgrades** – Reaching the XP threshold should queue a guided wizard until the player completes it.
3. **Atomic application** – Stats, moves, spells, HP/Load, and history all commit together.
4. **Observable progress** – Store-level state exposes pending advancements so UX and automation can react.
5. **Incremental delivery** – Ship in slices (data plumbing → UI wizard → polish).

## Current State Snapshot (2025-10-13)

- `AdvancementService` consumes `CLASS_MOVES`, `SPELL_PROGRESSION`, and spell datasets to return fully populated advancement options.
- `characterStore` queues pending level-ups, persists drafts via Zustand storage, and applies them through `applyLevelUpChoices`.
- `LevelUpWizard` guides the user through XP spend, stat/move/spell selection, review, and confirmation. `XPProgressTracker` launches it once the threshold is reached.
- Pending advancements surface in `ContextAwareSystem` and `XPProgressTracker`, so the UI can badge navigation and remind players.

## Phase Breakdown

### Phase 0 – Discovery & UX Alignment ✅

- [x] Audit existing services/stores and document gaps.
- [x] Define Dungeon World contract + success criteria.
- [x] Decide on wizard vs inline drawer (we shipped the modal wizard).
- [x] Capture requirements in this roadmap.
- [x] Confirm advancement data sources (`docs/data/compendium_data.md`, `src/data/advancement`, `src/data/spells`).

**Exit criteria met:** Stakeholders signed off on scope/UX.

### Phase 1 – Domain & Store Enhancements ✅

- [x] Flesh out `AdvancementService.getAdvancementOptions` using real move/spell data.
- [x] Track `pendingAdvancements` in `characterStore` (per-character queue, deltas, timestamps).
- [x] Update `levelUpCharacter` to subtract XP, carry remainder, and create pending records.
- [x] Add `startLevelUp`, `applyLevelUpChoices`, `cancelLevelUp` actions.
- [x] Persist pending state via Zustand storage.
- [x] Emit XP notifications through `xpIntegrationService` when thresholds are reached.

**Exit criteria met:** Store/state reflects pending level-ups; unit tests cover XP rollover, stat caps, move availability.

### Phase 2 – Level-Up Wizard UI ✅

- [x] Ship `LevelUpWizard` modal (overview → stat → move → spell → review).
- [x] Wire entry points (`XPProgressTracker`, ContextAware suggestions, nav badges).
- [x] Resume drafts automatically when reopening.
- [x] Provide Chronicle logging toggle during confirmation.

**Exit criteria met:** End-to-end flow works for martials & casters; validation ensures stat cap, move selection, resume-from-draft.

### Phase 3 – Apply Choices & Persistence ✅

- [x] Apply choices via `applyLevelUpChoices` (stat, move, spell).
- [x] Recalculate HP/Load and append to `advancements` history.
- [x] Update spell lists via `SpellCastingService` respecting progression tables.
- [x] Clear pending queue, fire success toast, update XP history/Chronicle.

**Exit criteria met:** Character sheet reflects changes immediately; pending queue empties; reloads resume correctly.

### Phase 4 – QA, Documentation, Polish (tracking)

- [x] Optional Playwright scenario (earn XP → level up → verify move/spell).
- [x] Refresh in-app Help + `docs/zimbo-v2-feature-catalog.md` + README with final screenshots/copy.
- [x] Publish regression checklist covering casters vs martials, multiple level gains, stat-cap edge cases, cancel/resume.
- [x] Telemetry hooks emit `level_up.confirmed` events (character id, class, new level, applied choices). _Added 2025-10-14._

**Exit criteria:** QA sign-off; documentation merged; telemetry notes logged. _(Store + component unit tests landed with Phases 1–3.)_

## Future Enhancements (Backlog)

- Class-specific move metadata via SRD import (including prerequisites / multi-class restrictions).
- GM approval workflow before applying advancements _(blocked until shared-session networking/support for remote tables is in place; requires cross-client coordination)_.
- ~~Auto-prompt to rewrite Bonds on level-up (Dungeon World canon).~~ ✅ Minimal reminder modal now appears after confirmation (2025-10-14); expand to a full rewrite workflow later.
- ~~Chronicle timeline integration ("Eldara reached Level 4; gained Merciless").~~ ✅ Timeline entries now record every level-up with optional detailed narrative (2025-10-14).
- Batch level-ups when players bank XP for multiple levels.

## Open Questions

- Do we need to support custom classes/homebrew moves at launch?
- Who owns SRD licensing for additional move/spell text?
- Should XP spent fire analytics events or remain local telemetry?
- Do we allow undoing a level-up after confirmation?

## Links & References

- Dungeon World SRD – Advancement: https://www.dungeonworldsrd.com/advancement-and-moves/
- XP tracker entry point: `src/components/game/XPProgressTracker.tsx`
- Store implementation: `src/stores/characterStore.ts`
- Services: `src/services/AdvancementService.ts`, `src/services/SpellCastingService.ts`
- Wizard UI: `src/components/game/LevelUpWizard.tsx`

---

_Keep this roadmap accurate. When Phase 4 items land, check the boxes above and bump the timestamp._
