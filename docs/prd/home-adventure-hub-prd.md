# PRD: Home View “Adventure Hub” (Sheet‑Only Fallback)

- Doc ID: HV-PRD-001
- Version: 1.0
- Status: Draft for implementation
- Owner: Product/Eng (you)
- Date: 2025-11-02

## 1) Overview
When Chronicle is disabled (Sheet‑Only mode), the home Play view must feel complete and inviting—not like a missing feature. Replace the current dashed “Chronicle is off” upsell with a purposeful right‑rail called Adventure Hub that provides quick actions, smart suggestions, and core session tools. When Chronicle is enabled, the experience remains unchanged (Chronicle Dock + related UI).

## 2) Problem Statement
- Today: If `hasChronicleUI === false`, PlayTab shows a bordered/upsell card implying something is missing.
- Desired: A self‑sufficient right rail that supports immediate play and complements the character sheet, without any Chronicle copy or LLM dependencies.

## 3) Goals
- G1. Make Sheet‑Only feel first‑class: complete, useful, and inviting.
- G2. Preserve the split layout: character sheet left, helpful panel right.
- G3. Zero Chronicle/LLM dependency in Sheet‑Only; entirely local/offline.
- G4. Clear, ergonomic entry points: start/end session, quick roll, notes, timers.
- G5. Smooth path to Chronicle+ without upsell language (switch remains in Settings, but no marketing in Play).

## 4) Non‑Goals
- N1. Changing Chronicle Dock behavior when Chronicle is ON.
- N2. Adding new external services or authentication.
- N3. Modifying store schemas or persistence formats.

## 5) Personas & Primary Use Cases
- P1. Player/GM (offline speed): land in Sheet‑Only, start playing immediately.
  - UC1: Start session, take notes, track time, and roll dice quickly.
  - UC2: See light stats (duration, rolls, XP) at a glance during a session.
- P2. Storyteller (later enables Chronicle+): continues to have a complete experience before opting in.
- P3. QA/Dev: verify gating with a single capability flag and predictable surfaces.

## 6) Experience Summary
- Layout remains a SplitPane: Folio on the left, RightRail on the right.
- Chronicle ON: render Chronicle Dock (no change).
- Chronicle OFF: render the Adventure Hub (new `NonChronicleRightRail`).

## 7) UX Specification (Sheet‑Only)
- RightRail header
  - Shows RollHUD (unchanged) and, if present elsewhere, any existing status chips that do not require Chronicle.
- Adventure Hub sections (order top→bottom):
  1) Quick Actions (Card)
     - Actions: Start/End Session, Quick 2d6 Roll, “Notes” jump, “Timers” jump.
     - State hints: disable Start/Quick Roll if no active character; show a tip row (e.g., “Press Ctrl+K to open the command palette”).
     - Live stats row (when session active): duration (m), total rolls, successes, XP.
  2) Smart Suggestions (Card)
     - Compact `ContextAwareSystem` targeting active character; informative and non‑intrusive.
  3) Notes (Widget)
     - Embed current `NotesWidget` directly.
  4) Timers (Widget)
     - Embed current `TimersWidget` directly.
  5) Roll History (Widget)
     - Embed `RollHistoryWidget` directly for immediate feedback.
- States & empty states
  - No character: Quick Actions buttons that need a character are disabled with helpful titles; suggestions section hidden.
  - No session: Stats row hidden; Start Session prominently available.
  - Accessibility: all buttons keyboard‑focusable with accessible labels; color contrast aligns with tokens.
  - Responsive: stack content vertically on narrow viewports; maintain comfortable spacing.

## 8) Functional Requirements
- HV‑FR‑01 Gating
  - In `PlayTab`, choose between Chronicle Dock and Adventure Hub with `useCapabilities().hasChronicleUI`.
- HV‑FR‑02 Quick Actions: Start/End Session
  - Start: `useSession().startSession(name, [activeCharacter.id])` where `name = "Session HH:MM"` local time.
  - End: `useSession().quickEndSession()`; if combat active, end combat then session.
- HV‑FR‑03 Quick Roll
  - Use `useDiceStore().rollCustom({ modifier: 0, context: { label: 'Quick Roll' }, characterId })`.
  - Button disabled if no active character.
- HV‑FR‑04 Section Anchors
  - Notes jump → element with id `notes-widget`.
  - Timers jump → element with id `timers-widget`.
  - Smooth scroll behavior.
- HV‑FR‑05 Session Stats
  - Display from `useSession().sessionStats`: duration (minutes), totalRolls, successfulRolls, xpAwarded.
- HV‑FR‑06 Suggestions
  - Render `ContextAwareSystem` with `compact` and `characterId={activeCharacter.id}` when character present.
- HV‑FR‑07 Zero Chronicle Dependencies
  - No Chronicle imports/initialization in the Sheet‑Only code path; Adventure Hub uses only local stores/hooks.
- HV‑FR‑08 Preserve Automation Log
  - Existing Automation Log (when flagged by `isLlmUnifiedEnabled`) remains below the Chronicle/Adventure Hub section as it does today.

## 9) Non‑Functional Requirements
- HV‑NF‑01 Offline‑first: all actions work without desktop bridge or network.
- HV‑NF‑02 Performance: no additional heavy imports for Sheet‑Only; Adventure Hub uses existing components.
- HV‑NF‑03 Accessibility: keyboard navigation, ARIA where needed, token‑driven contrast.
- HV‑NF‑04 Responsiveness: usable at common desktop widths and small windows.

## 10) Architecture & File Map
- New (added): `src/components/game/NonChronicleRightRail.tsx`
  - Contains Adventure Hub sections: Quick Actions, Suggestions, Notes, Timers, Roll History.
- Modify: `src/components/game/PlayTab.tsx`
  - Replace the dashed upsell card with `<NonChronicleRightRail />` when `hasChronicleUI === false`.
  - Import: `import { NonChronicleRightRail } from './NonChronicleRightRail'`.
- Reference surfaces (unchanged APIs):
  - Notes: `src/components/game/SessionTools/NotesWidget.tsx`
  - Timers: `src/components/game/SessionTools/TimersWidget.tsx`
  - Roll History: `src/components/game/SessionTools/RollHistoryWidget.tsx`
  - Suggestions: `src/components/game/ContextAwareSystem.tsx`
  - Capabilities: `src/hooks/useCapabilities.ts`
  - Session ops: `src/hooks/useSession.ts`
  - Dice ops: `src/stores/diceStore.ts`

## 11) Implementation Status (as of this PRD)
- Completed:
  - New file created: `src/components/game/NonChronicleRightRail.tsx` implementing Adventure Hub.
- Pending:
  - Wire into `src/components/game/PlayTab.tsx` by replacing the current upsell block with `<NonChronicleRightRail />` in the right‑rail content.
  - Ensure import is added at the top of PlayTab.
  - Light visual polish pass post‑integration.

## 12) Acceptance Criteria
- AC‑01: In Sheet‑Only mode, PlayTab shows the Adventure Hub instead of any Chronicle/upsell copy.
- AC‑02: Start/End Session works; stats update live while active.
- AC‑03: Quick Roll logs a roll for the active character and appears in Roll History.
- AC‑04: Notes/Timers anchors scroll correctly.
- AC‑05: With Chronicle ON, experience is unchanged (Chronicle Dock renders; Adventure Hub does not).
- AC‑06: No network/Chronicle calls occur in Sheet‑Only path.

## 13) Test Plan (Manual + Automated)
- Gating
  - T1: Toggle mode to Sheet‑Only → Adventure Hub visible; no Chronicle UI.
  - T2: Toggle mode to Chronicle → Chronicle Dock visible; Adventure Hub hidden.
- Quick Actions
  - T3: No character → Start/Quick Roll disabled; tooltip/title explains why.
  - T4: With character → Start Session creates a session; End Session ends cleanly.
  - T5: Quick Roll appends to Roll History and shows in HUD.
- Suggestions
  - T6: With character → Suggestions card renders; without character → hidden.
- Anchors
  - T7: Notes/Timers buttons scroll to their sections.
- Regression
  - T8: Automation Log still renders when `isLlmUnifiedEnabled()` is true.

## 14) Rollout & Observability
- Rollout: ship under existing `mode` gating; no additional flags required.
- Telemetry (optional): can increment a local counter in session store for Quick Action usage; no network needed.

## 15) Risks & Mitigations
- R1: Visual clutter on small windows → keep compact spacing; rely on token styles.
- R2: Coupling with session/dice store changes → use existing stable hooks/APIs.
- R3: Perceived duplication with Game Management tools → Adventure Hub focuses on in‑session essentials only.

## 16) Work Breakdown
- HV‑TASK‑01: Create `NonChronicleRightRail` with sections [Done].
- HV‑TASK‑02: Replace upsell card in `PlayTab` with `NonChronicleRightRail` when Chronicle is OFF.
- HV‑TASK‑03: Verify states: no character, no session, active session.
- HV‑TASK‑04: Accessibility and responsive checks.
- HV‑TASK‑05: Update smoke tests (optional) to assert presence/absence of upsell copy.

## 17) Handoff Notes for Next Bot
- Start by editing `src/components/game/PlayTab.tsx` to:
  1) Add `import { NonChronicleRightRail } from './NonChronicleRightRail'` near other imports.
  2) In the right‑rail content block where the conditional renders the Chronicle Dock vs. the dashed upsell card, replace the upsell branch with `<NonChronicleRightRail />`.
     - You can locate the current upsell via the text "Chronicle is off" in `PlayTab.tsx` (around the right‑rail content area).
  3) Run a quick local check for type errors and visual layout.
- The new component is already present at: `src/components/game/NonChronicleRightRail.tsx`.
- Do not modify Chronicle components; only swap the fallback.

---
