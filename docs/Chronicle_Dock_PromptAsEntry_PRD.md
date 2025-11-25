# PRD: Unifying Chronicle Prompts and Log — “Prompt‑as‑Entry” + “Chronicle Dock”

Owner: Product/Engineering
Status: In QA — Dock integrated (Oct 18, 2025)
Last Updated: 2025-10-18

## 0) Summary

Unify the Chronicle experience into one story‑first surface by:
- Foundation (Idea 2): Prompt‑as‑Entry — Treat every prompt as a real Chronicle entry that is immediately visible in the log and progresses through entry statuses.
- UI layer (Idea 1): Chronicle Dock — A right‑rail surface that shows active prompts + a shared composer above the scrollable Chronicle log. The floating overlay becomes optional and can be disabled without loss of function.

Non-goal: Scene/grouping system (Idea 3) or broader knowledge-graph features.

### Implementation Snapshot — October 18, 2025
- Chronicle Dock is mounted in the Play tab right rail with store-backed prompt entries and manual composer.
- Chronicle overlay export mocks cleaned up; overlay can be disabled via `chronicle.settings.uiMode` without losing functionality.
- PlayTab automation tests re-enabled (undo/dismiss) and Chronicle Dock integration tests stabilised; `npx vitest --run` passes.

## 1) Success Metrics

- 100% of dice/action prompts create or reuse a ChronicleEntry visible in the log immediately.
- 0 “saved but not visible” issues in Play/Home.
- Floating overlay can be disabled while retaining full prompt + automation flows.
- ≥95% of prompts are submitted or dismissed within the Dock (not in a separate overlay).

## 2) Primary Users

- GM/Player running a live session on the Play tab.
- Single‑screen workflows (no reliance on pop‑ups).

## 3) Scope

In‑scope:
- Extend ChronicleEntry to encode prompt lifecycle and origin.
- Store helpers to create/update/find prompt entries.
- Provider/listener changes to emit “prompt‑as‑entry”.
- Chronicle Dock component (prompt feed + shared composer + scrollable history) mounted in Play tab right rail.
- Feature flag to prefer Dock over floating overlay.

Out‑of‑scope:
- Scene grouping, per‑scene recaps, cross‑session analytics.

## 4) User Stories

- As a player, when I roll, I see a “What happened?” prompt at the top of Chronicle and a draft appears in the log immediately.
- As a GM, submitting the prompt updates that same log line; I see Draft → Proposing → Ready/Applied status and can Apply/Undo automation inline.
- As a player, if I ignore a prompt, it quietly scrolls off; my story log remains continuous.

## 5) Current State (Repo pointers)

- Chronicle store and automation logs: `src/stores/chronicleStore.ts`.
- Prompt overlay (floating): `src/components/chronicle/ChronicleOverlay.tsx` via `src/services/ChronicleActionListenerService.ts`.
- Play tab holds a local “entry” list and bundle apply UI: `src/components/game/PlayTab.tsx`.
- Dice rolls and Chronicle provider: `src/stores/diceStore.ts`, `src/components/chronicle/ChronicleProvider.tsx`, HUD `src/components/dice/RollHUD.tsx`.

## 6) Functional Requirements

### 6.1 Prompt‑as‑Entry (canonical model)

1) Every prompt (dice roll, move, equipment/combat actions) must immediately create (or reuse) a ChronicleEntry visible in the log.
2) Entry lifecycle/status:
   - `status`: `draft` → `proposing` → `ready` | `applied` | `error`
   - `origin`: `prompt` | `manual` | `automation`
   - `actionContext`: roll/action metadata (stat, dice, result, rollId)
3) Submitting “What happened?”:
   - Updates `entry.rawText` and sets `status = proposing`.
   - Calls LLM propose/apply pipeline bound to this `entryId`.
   - On result: attach bundle via existing delta history linkage; set `status = ready` or `applied`, or `error` with message.
4) Dismissal: `status = error`, `errorReason = 'dismissed'` (do not delete by default).
5) De‑dupe: If a second prompt arrives for the same roll, reuse the same entry by `rollId`.

### 6.2 Chronicle Dock (integrated UI)

1) Location: Play tab right rail; replaces the separate prompt overlay surface when enabled.
2) Sections:
   - PromptFeed (new): shows active entries (`status in {draft, proposing, ready}`), newest first.
   - Shared Composer (new): a compact input to author/update the selected entry or add a manual note.
   - Scrollable Chronicle History: existing timeline/cards, session‑scoped.
3) Inline automation: The same entry row displays DeltaChecklist and Apply/Undo when `getDeltaLog(entryId)` has data.
4) Floating overlay: gated by a setting. When disabled, no functionality is lost.

## 7) Non‑Functional Requirements

- Accessibility: Composer and prompt actions are keyboard‑navigable; status changes announced via `aria-live="polite"` on the entry row.
- Performance: PromptFeed capped (e.g., 3–5 rows). History paginates to ~100 entries (no virtualization initially).
- Persistence: Reuse existing Zustand `persist` behavior for Chronicle store.
- Telemetry: Emit prompt/create/submit/dismiss/apply/undo events.

## 8) Data Model Changes

File: `src/types/chronicle.ts`

```ts
export interface ChronicleEntry {
  id: string
  sessionId: string
  campaignId?: string
  timestamp: Date
  rawText: string
  parsedEntities: EntityMention[]
  narrativeContext?: NarrativeContext
  emotionalTone?: EmotionalTone
  tags: string[]
  previousEntry?: string
  nextEntry?: string
  isSceneBreak: boolean
  userNotes?: string

  // NEW
  status?: 'draft' | 'proposing' | 'ready' | 'applied' | 'error'
  origin?: 'prompt' | 'manual' | 'automation'
  actionContext?: {
    type: 'dice_roll' | 'stat_roll' | 'move_roll' | 'combat_action' | 'equipment_use'
    rollId?: string
    stat?: string
    moveName?: string
    result?: 'success' | 'partial' | 'failure'
    total?: number
    modifier?: number
    dice?: number[]
  }
  errorReason?: string // e.g., 'dismissed', 'llm_error'
}
```

Notes:
- Keep automation bundles out of the entry object; use existing `deltaHistory` keyed by `entryId`. The UI can fetch applied/skipped ops with `getDeltaLog(entryId)`.

## 9) Store API Changes

File: `src/stores/chronicleStore.ts`

Add these helpers (wrap existing `addEntry`/`updateEntry`):

```ts
createPromptEntry(input: {
  sessionId?: string
  actionContext: ChronicleEntry['actionContext']
  rawText?: string
  tags?: string[]
}): string // returns entryId

updateEntryText(entryId: string, rawText: string): void

setEntryStatus(
  entryId: string,
  status: ChronicleEntry['status'],
  opts?: { errorReason?: string }
): void

findEntryByRollId(rollId: string): ChronicleEntry | undefined
```

Behavioral notes:
- `createPromptEntry` fills: `origin='prompt'`, `status='draft'`, timestamp now, and minimal tags (e.g., `#2d6`, `#STR`, `#10plus`).
- `setEntryStatus` is the single source of truth for lifecycle transitions.

## 10) Provider and Listener Changes

File: `src/components/chronicle/ChronicleProvider.tsx`

- On `emitDiceRoll` / other action emits:
  - Compute `rollId` and call `findEntryByRollId(rollId)`; if not found, call `createPromptEntry(...)`.
  - Expose the created `entryId` for UI components as needed.
- On prompt submission (from Dock Composer/Feed):
  - `updateEntryText(entryId, text)`; `setEntryStatus(entryId, 'proposing')`.
  - Call `proposeEntryDeltas({ entryId, rawText: text, context, settings })`.
  - On result: `setEntryStatus(entryId, autoApplied ? 'applied' : 'ready')`.
  - Automation details remain in `deltaHistory`; UI reads via `getDeltaLog(entryId)`.

File: `src/services/ChronicleActionListenerService.ts`

- Stop maintaining a separate ephemeral prompt list. Funnel all prompt creation into the store via `createPromptEntry`.
- Optionally keep minimal functions for dismiss/accept that just update the corresponding entry.

## 11) UI Components

### 11.1 ChronicleDock (new)

File: `src/components/chronicle/ChronicleDock.tsx`

Sections:
- PromptFeed: entries where `status in {draft, proposing, ready}` (sorted newest→oldest).
  - Each row renders: status chip, inline composer (bound to that entry), Submit and Dismiss, and when available, inline DeltaChecklist + Apply/Undo.
- Shared Composer: `ChronicleComposer` (new) for quick manual notes (creates a manual entry on submit).
- Scrollable History: reuse existing timeline/cards; session‑scoped; show status badges and link to `getDeltaLog(entryId)`.

Props: none (reads store/provider hooks).

### 11.2 ChronicleComposer (new)

File: `src/components/chronicle/ChronicleComposer.tsx`

Props: `{ entryId?: string; placeholder?: string; onSubmit?: (text: string) => void }`

Behavior:
- If `entryId` present, edits that entry (for a prompt). Else, creates a manual entry on submit.
- Supports mentions and tags (reuse current parsing utils).

### 11.3 Play Tab integration

- File: `src/components/game/PlayTab.tsx`
  - Right rail: add `<ChronicleDock />` under `<RollHUD />`.
  - Remove local `chronicleEntries` state and any parallel propose/apply logic that duplicates the store.

### 11.4 Overlay setting

- File: `src/components/chronicle/ChronicleOverlay.tsx`
  - Add feature flag setting (see §12). If disabled, do not render prompt cards. Optionally show a toast “New prompt available in Chronicle”.

## 12) Settings / Feature Flags

- `chronicle.settings.uiMode: 'dock' | 'overlay' | 'both'` (default: `'dock'`).
- `chronicle.settings.maxActivePrompts: number` (default: 3).

Provider should read and apply UI mode; default Dock on.

## 13) Telemetry

Events (extend existing LLM telemetry):
- `prompt_created { entryId, actionType, stat, result, sessionId }`
- `prompt_submitted { entryId, chars, latencyToSubmitMs }`
- `prompt_dismissed { entryId, reason }`
- `dock_interaction { type: 'open'|'collapse'|'apply'|'undo'|'dismiss', entryId?, bundleId?, reason?, sessionId?, uiMode }`
  - Emitted via `publishChronicleDockInteraction` (`src/utils/chronicleDockTelemetry.ts`) and dispatched as a `chronicle-dock-interaction` custom event for downstream dashboards.

## 14) Accessibility

- Composer textarea labeled; Submit/Dismiss buttons have aria‑labels.
- Entry status changes send polite announcements.
- Keyboard shortcuts: Enter+Ctrl = submit; Esc = dismiss; Tab to navigate fields.

## 15) Edge Cases

- Duplicate prompts for the same roll: detected by `rollId` → reuse entry.
- Guardrail/cost cap: if LLM calls are blocked, entry remains `draft` or `ready` with a warning; user text remains in the log.
- No active session: allow entries with `sessionId = null`, but nudge user to start a session.

## 16) Acceptance Criteria

- Rolling a die creates a visible `draft` entry at the top; the same row accepts the user’s input and transitions through statuses.
- Applying automation updates the same row; Undo is available there.
- Disabling the overlay leaves all functionality intact in the Dock.
- Play Tab shows the Chronicle as a single scrollable story; no parallel local state.

## 17) Test Plan

Unit
- Store: createPromptEntry/updateEntryText/setEntryStatus/findEntryByRollId.
- Provider: emit→entry created or reused; submit→status transitions.

Integration
- Dock: roll → active prompt row shows; submit → status flows; apply/undo; dismiss.
- Overlay off: flows still work entirely in Dock.

Manual QA
- Rapid successive rolls create distinct entries.
- Guardrail on: narrative saved without ops; warning visible.

## 18) Risks & Mitigations

- Two sources of truth (overlay vs Dock). Mitigation: overlay becomes render‑optional; entries live solely in the store.
- Store bloat from many drafts. Mitigation: later add auto‑prune for `errorReason='dismissed'` older than N days.
- Performance with long logs. Mitigation: cap PromptFeed length; paginate history to ~100.

## 19) Implementation Tasks (Checklist)

Data/Store
- [ ] Extend `ChronicleEntry` (see §8) — `src/types/chronicle.ts`.
- [ ] Add helpers — `src/stores/chronicleStore.ts`.

Provider/Listener
- [ ] In `ChronicleProvider`, create/reuse prompt entries on emits; drive submit lifecycle on the same entry.
- [ ] Refactor `ChronicleActionListenerService` to write to the store instead of keeping separate prompt objects.

UI
- [ ] New `ChronicleComposer` and `ChronicleDock` components.
- [ ] Mount `<ChronicleDock />` in `PlayTab` right rail under `<RollHUD />`.
- [ ] Remove local `chronicleEntries` list in `PlayTab` and any duplicate propose/apply logic.
- [ ] Add overlay flag and make overlay optional.

Telemetry & A11y
- [ ] Emit prompt create/submit/dismiss/apply/undo events; verify labels and live regions.

Tests
- [ ] Unit tests for store + provider; integration tests for Dock flows.

Docs
- [ ] Update README/Help to explain the Chronicle Dock and overlay mode.

## 20) Rollout Plan

- v1: Prompt‑as‑Entry + Dock ON; overlay also ON (default: Dock mode).
- v2: Default overlay OFF; Dock only.
- v3 (optional): Remove overlay entirely after adoption.

---

## 21) Appendix — Scaffolding (Files, Stubs, and Call Sites)

This section includes ready‑to‑paste skeletons so implementation can start immediately. The next bot should fill in TODOs and wire to existing utilities.

### 21.1 Types and Store Helpers (stubs)

File to modify: `src/types/chronicle.ts`

```ts
// Add to ChronicleEntry
export interface ChronicleEntry {
  // ...existing fields
  status?: 'draft' | 'proposing' | 'ready' | 'applied' | 'error'
  origin?: 'prompt' | 'manual' | 'automation'
  actionContext?: {
    type: 'dice_roll' | 'stat_roll' | 'move_roll' | 'combat_action' | 'equipment_use'
    rollId?: string
    stat?: string
    moveName?: string
    result?: 'success' | 'partial' | 'failure'
    total?: number
    modifier?: number
    dice?: number[]
  }
  errorReason?: string
}
```

File to modify: `src/stores/chronicleStore.ts`

Add these helper signatures and minimal implementations:

```ts
// At top: import type { ChronicleEntry } from '@/types/chronicle'

interface ChronicleState {
  // ...existing
  createPromptEntry: (input: {
    sessionId?: string
    actionContext: ChronicleEntry['actionContext']
    rawText?: string
    tags?: string[]
  }) => string

  updateEntryText: (entryId: string, rawText: string) => void

  setEntryStatus: (
    entryId: string,
    status: NonNullable<ChronicleEntry['status']>,
    opts?: { errorReason?: string }
  ) => void

  findEntryByRollId: (rollId: string) => ChronicleEntry | undefined
}

// Inside create() implementation
createPromptEntry: ({ sessionId, actionContext, rawText, tags }) => {
  const id = generateId('entry-')
  const entry: ChronicleEntry = {
    id,
    sessionId: sessionId ?? get().currentSessionId ?? 'unknown',
    timestamp: new Date(),
    rawText: rawText ?? '',
    parsedEntities: [],
    tags: tags ?? [],
    isSceneBreak: false,
    origin: 'prompt',
    status: 'draft',
    actionContext,
  }
  set((state) => ({ entries: [...state.entries, entry] }))
  return id
},

updateEntryText: (entryId, rawText) => {
  set((state) => ({
    entries: state.entries.map((e) => (e.id === entryId ? { ...e, rawText } : e)),
  }))
},

setEntryStatus: (entryId, status, opts) => {
  set((state) => ({
    entries: state.entries.map((e) =>
      e.id === entryId ? { ...e, status, errorReason: opts?.errorReason } : e,
    ),
  }))
},

findEntryByRollId: (rollId) => {
  return get().entries.find((e) => e.actionContext?.rollId === rollId)
},
```

### 21.2 Provider wiring (stubs)

File to modify: `src/components/chronicle/ChronicleProvider.tsx`

Inside `emitDiceRoll` (or equivalent action emit), create/reuse entry:

```ts
const rollId = `roll:${params.dice.join('-')}:${params.total}:${Date.now()}` // or reuse existing result id
const existing = useChronicleStore.getState().findEntryByRollId(rollId)
if (!existing) {
  useChronicleStore.getState().createPromptEntry({
    sessionId: useChronicleStore.getState().currentSessionId ?? undefined,
    actionContext: {
      type: params.moveName ? 'move_roll' : params.stat ? 'stat_roll' : 'dice_roll',
      rollId,
      stat: params.stat,
      moveName: params.moveName,
      result: params.result,
      total: params.total,
      modifier: params.modifier,
      dice: params.dice,
    },
    tags: [],
  })
}
```

On submit (called from Dock):

```ts
useChronicleStore.getState().updateEntryText(entryId, text)
useChronicleStore.getState().setEntryStatus(entryId, 'proposing')
// then kick propose/apply flow and set to 'ready' or 'applied' when done
```

### 21.3 New components (skeletons)

File: `src/components/chronicle/ChronicleComposer.tsx`

```tsx
import React, { useState } from 'react'
import { Button, Textarea } from '@/components/ui'

interface ChronicleComposerProps {
  entryId?: string
  placeholder?: string
  onSubmit?: (text: string) => void
}

export const ChronicleComposer: React.FC<ChronicleComposerProps> = ({
  entryId,
  placeholder = "What happened?",
  onSubmit,
}) => {
  const [value, setValue] = useState('')

  return (
    <div className='space-y-2'>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
      <div className='flex items-center gap-2'>
        <Button
          size='sm'
          onClick={() => {
            const text = value.trim()
            if (!text) return
            onSubmit?.(text)
            setValue('')
          }}
        >
          {entryId ? 'Chronicle It' : 'Add to Chronicle'}
        </Button>
      </div>
    </div>
  )
}
```

File: `src/components/chronicle/ChronicleDock.tsx`

```tsx
import React, { useMemo } from 'react'
import { useChronicleStore } from '@/stores/chronicleStore'
import { Badge, Card, CardContent } from '@/components/ui'
import { ChronicleComposer } from './ChronicleComposer'

export const ChronicleDock: React.FC = () => {
  const entries = useChronicleStore((s) => s.entries)
  const setEntryStatus = useChronicleStore((s) => s.setEntryStatus)
  const updateEntryText = useChronicleStore((s) => s.updateEntryText)

  const active = useMemo(
    () => entries.filter((e) => ['draft', 'proposing', 'ready'].includes(e.status ?? '')),
    [entries],
  )

  const history = useMemo(
    () => entries.slice().sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    [entries],
  )

  return (
    <Card variant='surface'>
      <CardContent className='space-y-4 p-4'>
        {/* Prompt Feed */}
        {active.slice(0, 3).map((entry) => (
          <div key={entry.id} className='rounded-md border p-3'>
            <div className='mb-2 flex items-center gap-2'>
              <Badge variant='secondary'>{entry.status}</Badge>
              {!!entry.actionContext?.stat && <span className='text-xs'>#{entry.actionContext.stat}</span>}
            </div>
            <ChronicleComposer
              entryId={entry.id}
              placeholder='What happened?'
              onSubmit={(text) => {
                updateEntryText(entry.id, text)
                setEntryStatus(entry.id, 'proposing')
                // TODO: call propose/apply via provider with this entryId
              }}
            />
            <div className='mt-2 text-right'>
              <button
                type='button'
                className='text-xs text-muted-foreground underline'
                onClick={() => setEntryStatus(entry.id, 'error', { errorReason: 'dismissed' })}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}

        {/* Quick Composer for manual notes */}
        <ChronicleComposer onSubmit={(text) => {
          // TODO: create a manual entry and optionally propose
        }} />

        {/* History (simple list; replace with existing timeline component) */}
        <div className='max-h-80 overflow-y-auto space-y-2'>
          {history.map((e) => (
            <div key={e.id} className='rounded border p-2 text-sm'>
              <div className='mb-1 flex items-center gap-2'>
                <Badge variant='outline'>{e.status ?? '—'}</Badge>
                <span className='text-xs text-muted-foreground'>{new Date(e.timestamp).toLocaleString()}</span>
              </div>
              <div>{e.rawText || <span className='text-muted-foreground'>No text yet</span>}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 21.4 Play Tab integration (stub)

File to modify: `src/components/game/PlayTab.tsx`

```tsx
// import { ChronicleDock } from '@/components/chronicle/ChronicleDock'
// In right rail, under RollHUD:
// <ChronicleDock />
```

### 21.5 Overlay Feature Flag (stub)

File to modify: `src/components/chronicle/ChronicleOverlay.tsx`

```tsx
// Read from chronicle settings (uiMode)
// if (uiMode === 'dock') return null
```

### 21.6 Tests — file layout

```
src/stores/__tests__/chronicle.promptEntry.test.ts
  - creates prompt entry on emit
  - updates text and status transitions
  - dedupes by rollId

src/components/chronicle/__tests__/ChronicleDock.integration.test.tsx
  - shows prompt rows, submits, status updates, dismiss
  - renders history with entries
```
## Validation
- npx vitest --run (October 18, 2025) - Green suite.
