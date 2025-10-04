# Campaign Modal Rewrite Plan (Phase 1 Spec)

## Goals

- Replace legacy campaign modals with a consistent, reducer-driven architecture that satisfies the new lint suite.
- Preserve existing UX while improving maintainability, validation clarity, and shared behaviors.
- Provide reusable primitives so future modals can adopt the same pattern quickly.

## Shared Requirements Across Modals

- **State management:**
  - Reducer-owned form state with replace/apply actions.
  - Separate error state reducer (field-keyed messages, reset + set).
  - `isSubmitting` flag and derived helpers (`canSubmit`, `isDirty` if feasible).
- **Lifecycle:**
  - Deterministic `reset` when `isOpen` toggles on or source entity changes.
  - External close (`onClose`) triggers state cleanup (no stale selections).
- **Validation:**
  - Pure validator per modal returning error map.
  - Submission short-circuits on validation failure.
- **Async submission contract:**
  - Wrap store calls in try/catch, set `isSubmitting`, surface TODO for real error handling (toast/log).
  - Return created/updated id to optional `onSaved` callback before closing.
- **Accessibility + UX:**
  - Maintain keyboard affordances (Enter to add chips, Esc via dialog).
  - Use existing theme tokens (`bg-card`, badges, etc.).
  - Keep destructive markers (important badge, dangers badge, etc.).
- **Utilities to implement:**
  - `useModalForm` (or equivalent) returning `{ state, dispatch, errors, setErrors, reset, submit }`.
  - `useStringListField` for repeated add/remove lists with optional max length.
  - `createInitialState` factories per modal.
  - Shared components: tag chips, section headers, stat badges.

## Modal Snapshots

### JournalEntryModal

- **Fields:** title, content, tags (max 10), important flag, related session/NPC/location IDs (not exposed in UI yet), auto timestamp.
- **Actions:** create new entry via `addJournalEntry`, update via `updateJournalEntry`, optional `onSaved` callback.
- **Validation:**
  - Title required, min length 3.
  - Content required, min length 10.
- **Behaviors:**
  - Tag input handles Enter key and prevents duplicates.
  - Important toggle badge.
  - Displays tag count + instructions.
- **Issues to address:**
  - Direct `setState` reset in `useEffect` (lint violation).
  - Inline string concatenation for instructions to be kept or improved.

### LocationModal

- **Fields:** name, description, type (city/town/village/dungeon/wilderness/other), notes, dangers (max 5), resources (max 5), connections (currently unused UI), optional `onSaved`.
- **Actions:** `addLocation`, `updateLocation`.
- **Validation:**
  - Name required, min length 2.
  - Description required, min length 10.
- **Behaviors:**
  - Danger/resource chips clickable to remove, Enter adds.
  - Type selection grid with icon.
  - Danger/resource counters in helper text.
- **Issues:**
  - Unused `campaign` selector; should either use or drop.
  - Direct `setState` within effect; same lint issue.

### NPCModal

- **Fields:** name, description, role, location, notes, importance (low/medium/high), disposition (friendly/neutral/hostile/unknown), secrets (max 5), optional `onSaved`.
- **Actions:** `addNPC`, `updateNPC`.
- **Validation:**
  - Name required, min length 2.
  - Description required, min length 10.
  - Role required.
- **Behaviors:**
  - Role suggestions dropdown (Radix Select).
  - Importance/disposition toggle buttons with icons.
  - Secrets list with remove buttons, Enter to add.
- **Issues:**
  - Same reset pattern.
  - Some inline color classes (ensure tokens after rewrite).

### SessionModal

- **Fields:** title, date, duration (minutes), summary, notes, xpGained, highlights (max 5), challenges (max 5), nextSession text.
- **Actions:** `addSession`, `updateSession` (builds new `CampaignSession` with Date conversion), optional `onSaved`.
- **Validation:**
  - Title required, min length 3.
  - Summary required, min length 10.
  - Duration between 30 and 960.
  - XP between 0 and 10.
- **Behaviors:**
  - Highlights/challenges chips similar to tags.
  - Duration slider? (No, currently numeric input + helper text.)
  - Date defaults to today on create.
- **Issues:**
  - Manual Date conversions; ensure new reducer preserves Date vs string clarity.
  - Same lint violation.

## Target Architecture Summary

1. **Shared hook** – `useModalForm<TState, TErrors>` (specific naming TBD):
   - Accepts `initialStateFactory`, `validate`, and `onSubmit` async handler.
   - Returns `{ state, dispatchState, errors, dispatchErrors, reset(initialData), submit, helpers }`.
   - Provides `resetEffect(deps)` utility to schedule resets without violating lint rule.
2. **String-list helper** – returns `[items, addItem, removeItem, canAdd]` enforcing uniqueness & limits.
3. **Per-modal modules** – export `initialState`, `validate`, `submit` (the latter calling store actions + `onSaved`).
4. **UI components** – small presentational helpers for chip lists, header cards, etc.

## Next Steps (Phase 2 onward preview)

- Implement shared utilities with unit tests (reducer actions, validation flows, reset effect).
- Migrate each modal to the new hook, ensuring parity with documented behavior.
- Update parent components to use stable keys and align with new modal props if signatures change.
- Expand tests/E2E to cover add/edit/cancel flows and chip interactions.

This document captures the current landscape and target direction so we can resume after any context reset without losing the plan.
