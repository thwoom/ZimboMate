# ZimboMate V2 – Level-Up Roadmap

Last updated: 12 Oct 2025  
Owner: Gameplay / Chronicle Pod  
Status: Phase 1 kickoff (domain & store groundwork in progress)

## Why This Exists

Players currently press “Level Up” and only see their level integer advance. Dungeon World requires a full advancement ceremony: spend XP, select new moves, optionally raise a stat (≤18), adjust HP/Load, expand spellbooks, and log the change. This roadmap breaks the upgrade into phases so we can deliver a complete, compliant experience without losing momentum.

## Guiding Principles

1. **Rules Fidelity** – Follow the Dungeon World SRD closely (stat cap 18, one move per level, optional stat raise, caster spell additions, etc.).
2. **No Silent Upgrades** – XP threshold should trigger a guided wizard; choices must persist until the player completes them.
3. **Atomic Application** – Stats, moves, spells, HP/Load, and Chronicle logging all commit together.
4. **Observable Progress** – Store-level state exposes pending advancements so UX, automation, and analytics can react.
5. **Incremental Delivery** – Ship in slices (data plumbing → UI skeleton → class-specific polish).

## Current State Snapshot

- `AdvancementService.levelUp()` returns `LevelUpResult` with placeholder option data but the app ignores the options.
- `useCharacterStore.levelUpCharacter()` consumes the service result and overwrites the character (XP isn’t reduced; no choices applied).
- `XPProgressTracker` shows a “Level Up to N!” button that blindly calls the store method.
- No dedicated UI exists for choosing moves/stat bumps; Chronicle/automation can’t reflect the change.

## Phase Breakdown

### Phase 0 – Discovery & UX Alignment ✅ (planning complete)

- [x] Audit existing services/stores and document gaps.
- [x] Define Dungeon World contract + success criteria.
- [x] Decide on wizard vs inline drawer (default: modal wizard unless design team objects).
- [x] Capture requirements in this roadmap.
- [x] Spikes: confirm class advancement tables & spell upgrade logic with design (captured in `docs/compendium_data.md` and mirrored in `src/data/advancement` + `src/data/spells`).

**Exit criteria:** Stakeholders sign off on UX approach and scope.

### Phase 1 - Domain & Store Enhancements (in progress)

- [ ] Flesh out `AdvancementService.getAdvancementOptions` using real move/spell data (hook into `MoveCompendiumService`, `SpellCastingService`).
- [ ] Track `pendingAdvancements` in `characterStore` (per-character queue with options, HP/Load deltas, creation timestamp).
- [ ] Update `levelUpCharacter` to:
  - [ ] Subtract XP threshold, carry remainder.
  - [ ] Populate pending record instead of mutating character immediately.
- [ ] Add actions: `startLevelUp`, `applyLevelUpChoices`, `cancelLevelUp` (or similar).
- [ ] Persist pending state via Zustand storage (survives reload).
- [ ] Emit XP notifications (`xpIntegrationService`) when threshold reached.

  **2025-10-12 kickoff:** Auditing `AdvancementService` and `characterStore` to design pending level-up queue, XP rollover, and new store actions (`startLevelUp`, `applyLevelUpChoices`, `cancelLevelUp`). Implementation should consume the structured datasets under `src/data/advancement` and `src/data/spells`.

**Exit criteria:** Store/state reflects pending level-ups and exposes options; unit tests cover XP rollover, stat caps, move availability.

### Phase 2 – Level-Up Wizard UI (not started)

- [ ] Build `LevelUpWizard` component (modal/drawer) reading from store.
  - Step 1: Overview (XP spend, HP/Load delta).
  - Step 2: Stat increase (optional, enforce <18).
  - Step 3: Move selection (class table, disable already learned).
  - Step 4: Spell updates (conditional for Cleric/Wizard).
  - Step 5: Review + confirm.
- [ ] Integrate entry points:
  - [ ] Replace XP tracker button to open wizard.
  - [ ] Add ContextAware suggestion + toast.
  - [ ] Optionally badge the Character tab nav.
- [ ] Persist in-progress selections so closing + reopening resumes.
- [ ] Chronicle logging toggle (optional, default on).

**Exit criteria:** End-to-end happy path works for non-casters; unit tests verify validation (must pick move, stat optional, cannot exceed stat cap).

### Phase 3 – Apply Choices & Persistence (not started)

- [ ] Wire wizard confirmation to new `applyLevelUpChoices` store action.
- [ ] For stat choice: call `advancementService.applyAdvancement` or direct attribute bump; recalc HP/Load.
- [ ] For move choice: record in `knownMoves`, update `advancements` log.
- [ ] For spellcasters: update known/prepared lists via `SpellCastingService`.
- [ ] Clear pending record, fire success toast/notification.
- [ ] Chronicle auto-entry (if toggle on) summarizing gain.
- [ ] XP history update to show threshold spend.

**Exit criteria:** Character sheet reflects new stats/moves/spells immediately; pending queue empty; tests cover edge cases (multiple queues, reload resumes).

### Phase 4 – QA, Documentation, Polish (not started)

- [ ] Add unit + integration tests (store, wizard, XP tracker).
- [ ] Optional Playwright scenario (earn XP, level up, verify new move).
- [ ] Update in-app Help + `docs/zimbo-v2-feature-catalog.md` + README.
- [ ] Provide regression checklist (casters vs martials, multiple level gains, stat cap, cancellation).
- [ ] Telemetry hooks (if analytics wanted later).

**Exit criteria:** QA sign-off; documentation merged; telemetry notes logged.

## Future Enhancements (Backlog)

- Class-specific move metadata via SRD import (including prerequisites, advanced/multi-class restrictions).
- Support GM approval before applying advancements.
- Auto-prompt to rewrite Bonds on level-up (Dungeon World canon).
- Chronicle timeline integration (“Eldara reached Level 4; gained Merciless”).
- Batch level-ups (if a character accumulates XP for multiple levels before spending).

## Open Questions

- Do we need to support custom classes/homebrew moves at launch?
- Who owns the SRD data licensing for move descriptions?
- Should XP spent trigger analytics events (for balancing) or is local telemetry sufficient?
- Do we allow undoing a level-up after confirmation (probable “no” but needs design decision)?

## Links & References

- Dungeon World SRD – Advancement: https://www.dungeonworldsrd.com/advancement-and-moves/
- Existing XP tracker component: `src/components/game/XPProgressTracker.tsx`
- Advancement service baseline: `src/services/AdvancementService.ts`
- Spellbook utilities: `src/components/game/CharacterSheet/FolioSpellsPage.tsx`
- Move data reference: `src/services/MoveCompendiumService.ts`

---

_Keep this roadmap updated as tasks land. Add assignees, PR links, and notes beneath each checkbox when progress is made._
