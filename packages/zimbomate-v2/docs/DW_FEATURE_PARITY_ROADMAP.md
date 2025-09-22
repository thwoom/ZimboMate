# ZimboMate V2 — Dungeon World Feature Parity Roadmap

A comprehensive, actionable plan to bring ZimboMate V2 to full Dungeon World parity while preserving the V2 vision: magical-first UX, simple modern architecture, and great performance/accessibility.

This document is intended for ongoing team execution. It includes:
- A high-level status matrix
- Detailed work items with acceptance criteria
- File references and suggested implementation notes
- Checklists to mark progress over time

Use this as the canonical progress tracker. Update checkboxes and notes as you land work.


## Legend

- **Status values**:
  - ✅ Implemented
  - 🟡 Partial / In progress
  - ⏳ Planned / Not started
- **Priority values**:
  - 🔥 High | 📌 Medium | 🧊 Low
- **Checklists**: GitHub-style `- [ ]` / `- [x]`


## Executive Summary

- V2 delivers the right stack (Zustand, Radix, Tailwind, Framer Motion, Three.js, Howler) and many core player tools (character sheet, dice, moves, trackers, session tools).
- Biggest gaps vs vision: Play/Prep/Build contexts, PWA/offline, AI assist, multiplayer foundation, and some compendium coverage (spells, monsters, gear tags).
- Focus next: Re-center navigation around contexts; hide dev/admin surfaces from main UI; ship one PWA, one AI assist, and one real-time feature to close the experiential loop.


## Status Matrix (Feature Areas)

| Area | Status | Priority | Notes / Primary Files |
|---|---|---|---|
| Character Builder (Creation) | 🟡 Partial | 🔥 | Store supports `createCharacter`; builder UI not complete. `src/stores/characterStore.ts`, `src/models/Character.ts` |
| Character Sheet | ✅ Implemented | 🔥 | `src/components/game/CharacterSheet.tsx` |
| Dice & Moves Engine | ✅ Implemented | 🔥 | `src/services/DiceRollingService.ts`, `src/components/game/DiceRoller.tsx`, `src/services/MoveCompendiumService.ts` |
| XP & Advancement | 🟡 Partial | 🔥 | Auto XP on 6− present; level-up UI flow not fully wired. `src/services/AdvancementService.ts`, `src/services/XPIntegrationService.ts`, `src/stores/characterStore.ts` |
| Debilities, Alignment, Bonds | ✅ Implemented | 📌 | `src/components/game/DebilityTracker/*`, `BondTracker/*`, `AlignmentXPTracker/*` |
| Equipment, Load, Tags | 🟡 Partial | 🔥 | Sets, load tracked; enforce tags/encumbrance broadly. `src/components/game/EquipmentPanel.tsx`, `src/services/EquipmentManagementService.ts` |
| Spells & Class Systems | 🟡 Partial | 🔥 | Casting/prep logic exists; spell compendium missing. `src/services/SpellCastingService.ts` |
| Special / Peripheral Moves | 🟡 Partial | 📌 | Make Camp, Journey, etc. modeled lightly. Compendium can host. |
| Hold & Status Trackers | ✅ Implemented | 📌 | Holds and forward/ongoing supported. `src/services/GameLogicService.ts` |
| Session Tools & Unified Log | ✅ Implemented | 📌 | Notes, timers, trackers, flow manager. Event unification can improve. `src/components/game/SessionTools/*`, `SessionFlowManager.tsx` |
| Compendium & Search | 🟡 Partial | 📌 | Moves strong; spells/gear/monsters incomplete. `src/services/MoveCompendiumService.ts` |
| GM Tools (Fronts, Monsters, etc.) | ⏳ Planned | 🧊 | New UIs needed. |
| Campaign Management | 🟡 Partial | 📌 | Panels exist; continue integration. `src/components/game/Campaign*` |
| Multiplayer Foundation | ⏳ Planned | 🔥 | Add real-time (socket.io/yjs) basics. `src/services/MultiplayerService.ts` |
| Offline/PWA | ⏳ Planned | 🔥 | Add service worker, caches, IndexedDB. |
| Accessibility & Performance | 🟡 Partial | 📌 | Reduced motion audit; virtualization for heavy lists. |
| 3D/Audio Delight | ✅ Implemented | 📌 | 3D dice, particles, howler cues. `src/components/3d/*` |
| Import/Export & Utilities | ✅ Implemented | 📌 | Panels and JSON flows exist. |
| Navigation: Play/Prep/Build | ⏳ Planned | 🔥 | Replace tab-only with mode-aware UX. `src/components/ui/NavigationRouter.tsx` |
| Hide Dev/Admin from Main UI | ⏳ Planned | 🔥 | Move File Management & Button Debug out of primary nav. `src/App.Complete.tsx` |
| AI Assist (Smart Suggestions) | ⏳ Planned | 📌 | Add one scoped assistant (moves or rules). |


## Detailed Work Items

Each workstream includes an expanded Goal with scope, outcomes, boundaries, dependencies, and success metrics, followed by acceptance criteria and notes.


### 1) Character Builder (Playbooks)
Status: 🟡 Partial | Priority: 🔥

Goal:
- Build a first-time, guided flow to create a valid Dungeon World character using playbooks. The builder should feel like opening a magical tome: approachable for new players, efficient for veterans, and strict about rules compliance without being punitive.
- Scope: multi-step UX (Class/Look/Alignment/Bonds/Stats/Derived/Starting Gear/Review), resume-from-draft, validations at each step, derived values (HP, Load, damage die) preview and justification, and instant accessibility (keyboard-first, screen readers).
- Outcomes: a persisted, ready-to-play character with starting moves, gear, and correct derived stats; no invalid states; time-to-create under minutes.
- Boundaries (out-of-scope for v1 builder): multiclassing, custom playbooks, advanced move trees beyond level 1; defer to future iterations.
- Dependencies: `useCharacterStore`, playbook data (moves, gear), stat-to-mod mapping, derived calculators.
- Success Metrics: (a) average creation time < 3 minutes, (b) 0 validation errors in persisted characters, (c) WCAG-AA checks passed on all steps.

Acceptance Criteria:
- [ ] Multi-step builder with progress (Back/Next, Save/Resume)
- [ ] Playbook drives starting moves, base HP, damage die, starting gear options
- [ ] Stat assignment uses DW modifiers (−3..+3 mapping)
- [ ] Auto-calc derived stats (HP, Load), validation & previews
- [ ] Bonds and alignment captured and persisted
- [ ] Finalization writes to `useCharacterStore`
- [ ] Tests for derived stat calculations and persistence

Implementation Notes:
- State/store: `src/stores/characterStore.ts`, `src/models/Character.ts`
- UI: add `src/components/game/creation/*`
- Seed: starting moves/gear tables in JSON


### 2) XP & Advancement Flow
Status: 🟡 Partial | Priority: 🔥

Goal:
- Unify XP gain across the app (misses, bonds, alignment, GM awards, end-of-session), surface timely notifications, and guide players through level-up decisions (stat bumps with cap, class/advanced/master moves) with clear impact previews.
- Scope: XP event registry, toasts/banners, end-of-session flow, level-up gate and dialog, advancement history, analytics by source/session.
- Outcomes: players never wonder “did I get XP?”, and can level up in < 10 seconds once eligible; history is auditable.
- Boundaries: deep class-specific move trees/data coverage may come incrementally; aim for core classes first.
- Dependencies: `XPIntegrationService`, `AdvancementService`, `GameLogicService`, `useCharacterStore`.
- Success Metrics: (a) XP threshold to dialog open < 1s, (b) end-of-session completion < 60s, (c) test coverage on XP/threshold logic.

Acceptance Criteria:
- [ ] On 6−, +1 XP and toast
- [ ] End-of-Session dialog (alignment, bonds, learned something new, etc.)
- [ ] Level-up notification when XP ≥ (level + 7)
- [ ] Level-up UI: pick advancement options, recalc HP/Load
- [ ] XP history view per character

Implementation Notes:
- Services: `AdvancementService`, `XPIntegrationService`, `GameLogicService`
- UI: `LevelUpDialog`, `EndOfSessionDialog`
- Wire `xpIntegrationService.checkLevelUp` to open dialog


### 3) Dice & Moves Engine (Enhancements)
Status: ✅ Implemented | Priority: 🔥

Goal:
- Provide fast, faithful DW rolls (2d6 + stat) and move resolution that push fiction forward. Ensure forward/ongoing modifiers, damage/armor/piercing, and consequence scaffolding integrate smoothly with session flow and logs.
- Scope: move->result mapping for all basic moves; consistent roll summaries; advantage/disadvantage optionality for V2 UX demos; consequences routing to `GameLogicService`.
- Outcomes: fewer manual lookups; consistent rolls and consequences; clear player feedback.
- Boundaries: not modeling every class move yet; realistic defaults for damage/armor.
- Dependencies: Move models, `GameLogicService`, `DiceRollingService`.
- Success Metrics: (a) roll-to-outcome latency < 100ms, (b) 0 ambiguous UI states after rolls, (c) verified XP-on-miss path.

Acceptance Criteria:
- [ ] Basic moves mapping (done)
- [ ] Damage rolls apply armor/piercing (via `calculateCombatDamage`)
- [ ] Miss marking XP verified by tests
- [ ] Probability helper available in UI (optional)

Implementation Notes:
- `src/services/DiceRollingService.ts`, `src/services/GameLogicService.ts`, `src/components/game/DiceRoller.tsx`


### 4) Spells & Class Systems
Status: 🟡 Partial | Priority: 🔥

Goal:
- Deliver a practical spellcasting experience for Wizard/Cleric: legal preparation budgets (Level + 1), simple prepare/commune flows, and a casting UX that narrates 10+ / 7–9 / 6− outcomes, including applying the chosen 7–9 consequences.
- Scope: spell compendium data, preparation budget checkers, prepare/commune UI, cast dialog with result narration and follow-up choices (forget, strain, attention), strain tracking.
- Outcomes: spellcasters can prepare/cast with confidence; less rulebook flipping; audit trail of prepared spells.
- Boundaries: full cross-class and 3rd-party playbooks deferred; start with core spells.
- Dependencies: `SpellCastingService`, spell data, `Character` model fields (prepared spells, conditions).
- Success Metrics: (a) prepare flow < 45s from empty, (b) no budget overflows, (c) visible record of 7–9 choice.

Acceptance Criteria:
- [ ] Spell compendium dataset loaded (Wizard/Cleric core)
- [ ] Prepare/Commune UI enforces Level+1 budget (cantrip/rote excluded)
- [ ] Cast dialog shows 10+ / 7–9 / 6− outcomes with DW text
- [ ] Apply chosen 7–9 consequence (forget, strain, attention)

Implementation Notes:
- Service: `SpellCastingService.ts` (logic present; compendium empty)
- Add data: `src/models/spells/*.json` and loaders
- UI: `CharacterSheet` prepared spells panel


### 5) Equipment, Load, Tags
Status: 🟡 Partial | Priority: 🔥

Goal:
- Make inventory management visual and rules-correct: item tags drive behavior (reach, messy, precise, reload), load auto-calculates encumbrance state, armor reduces damage appropriately, and drag/drop is frictionless.
- Scope: normalize item data (tags, weight, damage/armor), show tags/tooltip hints, compute load and encumbrance, integrate armor/piercing in combat, and polish DnD interactions.
- Outcomes: fewer math mistakes; clear encumbrance feedback; consistent combat effects.
- Boundaries: crafting/enchant systems later; start with consumption/equip flows.
- Dependencies: item data, `EquipmentManagementService`, `GameLogicService`.
- Success Metrics: (a) tag display coverage ≥ 95% of items, (b) encumbrance computed always, (c) armor reduction validated in tests.

Acceptance Criteria:
- [ ] Inventory shows tags with tooltips
- [ ] Load weight auto-calculated; encumbrance indicated
- [ ] Armor reduces damage; piercing applied in combat effects
- [ ] Drag/drop with validation

Implementation Notes:
- `src/components/game/EquipmentPanel.tsx`, `src/services/EquipmentManagementService.ts`
- Add tag semantics to models; integrate in `GameLogicService`


### 6) Debilities, Alignment, Bonds
Status: ✅ Implemented | Priority: 📌

Goal:
- Ensure core character identity mechanics are first-class: debilities apply correct −1 penalties, alignments/drive inform XP at session end, and bonds evolve with simple creation/resolution flows.
- Scope: toggles and displays; roll plumbing for penalties; end-of-session hooks.
- Outcomes: players see the impact of choices; XP flows naturally from play.
- Boundaries: advanced bond templates later.
- Dependencies: trackers/components, XP end-of-session.
- Success Metrics: (a) penalty applied for 100% of relevant rolls, (b) bond resolution creates XP entries.

Acceptance Criteria:
- [x] Debility toggles apply −1 to relevant stats
- [x] Alignment shown and used at end-of-session
- [x] Bonds creation and resolution supported

Notes: `src/components/game/DebilityTracker/*`, `BondTracker/*`, `AlignmentXPTracker/*`


### 7) Session Tools & Unified Log
Status: ✅ Implemented | Priority: 📌

Goal:
- Provide a dependable sidekick for table play: roll log, notes, timers, trackers, bookmarks—exportable/importable and filterable—so the session memory survives between weeks.
- Scope: unify event stream (rolls/timers/notes/bookmarks), export/import JSON, filters and search, compact mobile-friendly UX.
- Outcomes: trustworthy history and quick recall of what happened when.
- Boundaries: livestream overlays separate.
- Dependencies: session store/components; optional event bus wrapper.
- Success Metrics: (a) export/import round-trip lossless, (b) filter operations < 50ms, (c) >90% actions keyboardable.

Acceptance Criteria:
- [ ] Single source of events; export/import JSON
- [ ] Filters for rolls/timers/notes/bookmarks

Implementation Notes:
- `src/components/game/SessionTools/*`, `SessionFlowManager.tsx`
- Consider a small event bus wrapper to unify sources


### 8) Compendium & Search
Status: 🟡 Partial | Priority: 📌

Goal:
- Centralize reference: moves (basic/class/advanced/master), spells, monsters, gear—fast to search, easy to browse, and linkable from anywhere in the app.
- Scope: data ingestion/normalization, facets (category/type/stat/tags/class), fuzzy search, deep-linkable entries, copy-to-clipboard of move text.
- Outcomes: less flipping; more playing; consistent rule text.
- Boundaries: advanced fan materials gated behind a toggle.
- Dependencies: move/spell/item/monster datasets, search lib.
- Success Metrics: (a) search-to-result < 100ms for common queries, (b) coverage of core book ≥ 90%, (c) zero broken links.

Acceptance Criteria:
- [ ] Moves: include class/advanced/master with metadata
- [ ] Spells: Wizard/Cleric datasets loaded and searchable
- [ ] Gear: tags, weight, damage dice normalized
- [ ] Fuzzy search across moves/spells/gear

Implementation Notes:
- Extend `MoveCompendiumService`; add `SpellCompendiumService`, `ItemCompendiumService`


### 9) GM Tools (Fronts, Monsters, etc.)
Status: ⏳ Planned | Priority: 🧊

Goal:
- Support the GM’s story engine: build Fronts/Dangers with grim portents/impending doom; manage monster stats/moves and treasure; capture prep efficiently.
- Scope: Front editor, monster catalog + custom builder, treasure tables integration, printable exports.
- Outcomes: faster prep; better continuity across sessions.
- Boundaries: deep map tooling later.
- Dependencies: compendium, campaign data.
- Success Metrics: (a) create a Front in < 5 minutes, (b) monster creation < 60s from template.

Acceptance Criteria:
- [ ] Fronts/Dangers builder with grim portents/impending doom
- [ ] Monster compendium & creator (tags, moves, HP, armor, damage)


### 10) Campaign Management
Status: 🟡 Partial | Priority: 📌

Goal:
- Provide a light campaign spine: sessions, NPCs, locations, threads/clocks, attachments—everything needed to remember the fiction and plan the next beat.
- Scope: overview dashboard, CRUD for NPCs/locations/threads, session summaries, quick links to compendium.
- Outcomes: context at a glance; onboarding new players mid-campaign.
- Boundaries: world map and image annotations later.
- Dependencies: stores for campaign/session.
- Success Metrics: (a) create NPC < 20s, (b) add session summary < 30s.

Acceptance Criteria:
- [ ] Campaign overview: sessions, NPCs, locations, threads/clocks
- [ ] Attachments/links; quick creation flows

Implementation Notes:
- `src/components/game/Campaign*`, `src/stores/campaignStore.ts`


### 11) Multiplayer Foundation
Status: ⏳ Planned | Priority: 🔥

Goal:
- Establish a minimal shared reality: presence, synchronized roll log, and a small chat/reaction bar so remote tables can play comfortably.
- Scope: realtime client, presence indicators, shared log/document, basic permissions.
- Outcomes: see who’s here, see rolls together, react quickly.
- Boundaries: full-blown VTT features out-of-scope; keep it light.
- Dependencies: `socket.io-client`/`yjs`, server stub (future).
- Success Metrics: (a) end-to-end latency < 300ms on LAN, (b) resilient reconnects, (c) offline fallback without crashes.

Acceptance Criteria:
- [ ] Real-time client (e.g., `socket.io-client` or `yjs`)
- [ ] Shared roll log + presence indicators
- [ ] Simple chat or reactions

Implementation Notes:
- Opt-in switch in Settings; offline-first baseline


### 12) Offline / PWA
Status: ⏳ Planned | Priority: 🔥

Goal:
- Make ZimboMate installable and trustworthy offline: cache core UI and compendium; persist characters/campaigns locally; handle reconnects gracefully.
- Scope: PWA manifest and service worker, asset/data caching strategies, IndexedDB via `idb`, offline badges and error states.
- Outcomes: playable on the go; no data loss; smooth updates.
- Boundaries: push notifications later.
- Dependencies: `vite-plugin-pwa`, `workbox-window`, `idb`.
- Success Metrics: (a) first offline launch success, (b) no failed reads under airplane mode tests, (c) SW update < 3s perceived.

Acceptance Criteria:
- [ ] `vite-plugin-pwa` configured; service worker caches core assets
- [ ] IndexedDB (via `idb`) for characters/campaign data
- [ ] Install prompt and offline confirmation UI


### 13) Accessibility & Performance
Status: 🟡 Partial | Priority: 📌

Goal:
- Bake in inclusive, fast UX: respect reduced motion; keep dialogs focus-trapped; virtualize heavy lists; monitor regressions.
- Scope: global motion guard, a11y audits for Radix dialogs/popovers, virtualization for compendiums, perf budgets and CI checks.
- Outcomes: smoother sessions, less fatigue, stable 60fps targets for animated areas.
- Boundaries: screen-reader tutorials later.
- Dependencies: Radix, Framer Motion, `@tanstack/react-virtual`.
- Success Metrics: (a) lighthouse a11y ≥ 90, (b) long-list scroll jank < 16ms frame budget, (c) reduced-motion disables 3D/complex effects.

Acceptance Criteria:
- [ ] Respect `prefers-reduced-motion`; disable heavy animations accordingly
- [ ] Focus management on dialogs/popovers (Radix helps)
- [ ] Virtualize heavy lists (moves/spells compendium)
- [ ] Perf budgets: <2s load, smooth 60fps targets where applicable

Implementation Notes:
- Add motion guards around Framer Motion/Three scenes
- Introduce virtualization (e.g., `@tanstack/react-virtual`)


### 14) 3D / Audio Delight
Status: ✅ Implemented | Priority: 📌

Goal:
- Celebrate moments: physics dice, particles, and audio stingers that heighten play without slowing it down.
- Scope: ensure effect triggers for key events (roll settle, level up, equip rare item), volume/motion preferences respected, lazy-load heavy assets.
- Outcomes: “this feels magical” within 5 seconds; zero nausea for reduced-motion users.
- Boundaries: full 3D avatars later.
- Dependencies: Three.js, Howler.
- Success Metrics: (a) 60fps dice, (b) effect load < 200ms after trigger, (c) settings adhered to 100% of time.

Acceptance Criteria:
- [x] Character import/export JSON
- [x] Session/campaign backups


### 15) Import/Export & Utilities
Status: ✅ Implemented | Priority: 📌

Goal:
- Make backups and migrations straightforward: export/import characters, sessions, and campaign docs in JSON with validation and versioning guards.
- Scope: robust serialization, schema version tags, conflict messaging on import, selective merges.
- Outcomes: confidence to experiment; safe restores.
- Boundaries: cloud sync later.
- Dependencies: stores/services.
- Success Metrics: (a) zero data loss in round-trip tests, (b) import error messages specific and actionable.

Acceptance Criteria:
- [x] Character import/export JSON
- [x] Session/campaign backups


### 16) Navigation: Play / Prep / Build Modes
Status: ⏳ Planned | Priority: 🔥

Goal:
- Recenter the experience on three contexts: Play (live session tools), Prep (reference, compendiums, campaign), Build (content creation, imports). Each mode curates tabs, quick actions, and theme to minimize cognitive switching.
- Scope: top-level mode switcher, curated tab visibility, mode-specific quick actions and theme presets, persisted last mode.
- Outcomes: new users onboard faster; power users jump between modes without losing state.
- Boundaries: per-project custom modes later.
- Dependencies: `NavigationRouter`, `useThemeStore`.
- Success Metrics: (a) mode switch < 200ms, (b) fewer clicks to common actions (Play: roll; Prep: search move; Build: import content).

Acceptance Criteria:
- [ ] Mode switch (Play / Prep / Build) in the header
- [ ] Context-specific default theme and quick actions
- [ ] Tabs filtered per mode (e.g., Play: Character/Dice/Moves/Session; Prep: Compendium/Campaign; Build: Content editors)

Implementation Notes:
- Extend `src/components/ui/NavigationRouter.tsx` to track modes
- Apply `data-theme` via `useThemeStore` on mode switch


### 17) Hide Dev/Admin from Main UI
Status: ⏳ Planned | Priority: 🔥

Goal:
- Keep the spellbook magical for players by hiding internal tooling (File Management, Button Debug, perf/a11y labs) behind a Developer switch or environment flag.
- Scope: remove dev tabs from main nav, add Developer menu in Settings, show dev-only badges clearly.
- Outcomes: cleaner first impression; fewer distractions.
- Boundaries: none; pure UX curation.
- Dependencies: `App.Complete.tsx` tab registry, settings store.
- Success Metrics: (a) zero dev tabs in production, (b) toggle discoverable to devs only.

Acceptance Criteria:
- [ ] Remove `File Management` and `Button Debug` from primary nav
- [ ] Gate via dev flag or separate Developer menu

Implementation Notes:
- `src/App.Complete.tsx` — filter tabs when `NODE_ENV !== 'development'` or behind a Settings toggle


### 18) AI Assist (Scoped)
Status: ⏳ Planned | Priority: 📌

Goal:
- Ship one high-value assistant inline: either move suggestions (with rule citations) or rules explainer that answers “what does this move do?” using local compendium with optional model help.
- Scope: provider client, context pack (active character/move/recent log), safe prompts, clear affordances to accept/ignore suggestions, offline fallback.
- Outcomes: faster decisions with less rulebook hunting; no hallucinated rules.
- Boundaries: no auto-actions; user always confirms.
- Dependencies: chosen provider SDK, compendium.
- Success Metrics: (a) suggestion response < 2s, (b) > 90% accuracy against compendium text, (c) easy opt-out.

Acceptance Criteria:
- [ ] Add provider client (OpenAI/OpenRouter/local LLM)
- [ ] Context pack: current move, character stats, recent log
- [ ] Guardrails and clear UX for AI suggestions


## File & Service References (non-exhaustive)

- **Stores**: `src/stores/*` (characters, session, game state, theme)
- **Services**:
  - Dice: `src/services/DiceRollingService.ts`
  - Spells: `src/services/SpellCastingService.ts`
  - XP/Advancement: `src/services/XPIntegrationService.ts`, `src/services/AdvancementService.ts`
  - Game Logic: `src/services/GameLogicService.ts`
  - Equipment: `src/services/EquipmentManagementService.ts`
  - Moves: `src/services/MoveCompendiumService.ts`
- **Components (selected)**:
  - Core: `src/components/game/CharacterSheet.tsx`, `src/components/game/DiceRoller.tsx`, `src/components/game/MovesPanel.tsx`
  - Trackers: `src/components/game/BondTracker/*`, `src/components/game/AlignmentXPTracker/*`, `src/components/game/DebilityTracker/*`
  - Session: `src/components/game/SessionTools/*`, `src/components/game/SessionFlowManager.tsx`
  - 3D: `src/components/3d/*`
  - UI: `src/components/ui/*`, `src/components/ui/ThemeProvider`, `src/components/ui/ThemeToggle`


## Milestones & Progress

- **Milestone A: Mode Navigation**
  - [ ] Implement Play/Prep/Build modes
  - [ ] Theme per mode
  - [ ] Tab curation per mode

- **Milestone B: XP/Advancement UX**
  - [ ] End-of-Session dialog
  - [ ] Level-up flow UI and store integration
  - [ ] Advancement option application + tests

- **Milestone C: Spell Compendium**
  - [ ] Load Wizard/Cleric spells
  - [ ] Prepare/Commune UI with budget enforcement
  - [ ] Cast flow with 7–9 consequence UI

- **Milestone D: PWA & Offline**
  - [ ] Service worker + caching
  - [ ] IndexedDB for persistence
  - [ ] Install prompt and offline state UI

- **Milestone E: Multiplayer Seed**
  - [ ] Real-time client
  - [ ] Shared roll log + presence
  - [ ] Simple chat/reactions


## How to Use This Document

- Treat each section as a living checklist. When you land an item, change `- [ ]` to `- [x]` and add a brief note/date.
- When you add new features, append subsections with acceptance criteria and references.
- Keep PRs small: one subsection per PR when possible.
- Consider creating a Storybook story or a small test per acceptance criterion where it’s sensible.


## Notes & Risks

- Scope discipline: avoid re-introducing V1 overlay complexity; prefer simple React state with Zustand.
- Performance budget: 3D and Lottie are delightful—guard with reduced-motion and lazy loading.
- Multiplayer & AI add dependencies; isolate and make optional to maintain the great offline-first baseline.

---

Last Updated: 2025-09-17
