# Play Tab Dice Integration — Bot Guide

Authoritative plan to fold dice into Play. Desktop-only. Entire stat card is clickable. Auto-log to Chronicle is ON by default.

## Outcomes
- Click any stat card to roll its stat; toast shows result and outcome color.
- Click a basic/advanced move to roll; if multi-stat, prompt for stat.
- Right rail on Play shows roll history with reroll/copy.
- Command Palette rolls remain; Dice tab becomes an optional Quick Roller drawer, then removed after deprecation.

## Affected Files (edit minimal, keep styles token-backed)
- `src/components/game/CharacterSheet/FolioStatsPage.tsx`: Make each stat card a button and call `useDiceStore().rollStat(stat, ch.id, stat)`. Add `title` + `aria-label`. Optional small `…` icon opens a modifier popover.
- `src/components/game/CharacterSheet/widgets/MoveChips.tsx`: Implement `onSelect(moveId)` → resolve stat or open `StatPickerPopover`, then `rollMove({ moveId, stat, characterId })`.
- `src/components/dice/RollLog.tsx`: No logic change; ensure compact styles for right rail.
- `src/components/game/PlayTab.tsx`:
  - Mount `<RollLog>` inside `<RightRail>` using `useDiceStore().getHistoryForCharacter(activeId)` and `reroll/copy` handlers.
  - Add `autoLogToChronicle` (default true) gameplay toggle surfaced in the Settings panel; when a roll completes, if enabled, append a formatted summary via existing `addChronicleEntry` pipe (`_handleDiceRoll` / `_completeDiceContext`).
- `src/hooks/useDiceKeyboardShortcuts.ts`: No change; enable shortcuts on Play (see App change).
- `src/App.Complete.tsx`:
  - Change dice shortcuts enablement: `enabled: activeTab === 'play' && Boolean(activeCharacter)`.
  - Replace the legacy drawer with an inline Dice Tools panel on the Play tab (accessible via navigation and shortcuts).
- New: `src/components/ui/StatPickerPopover.tsx` — small popover with six stat buttons, emits chosen `Attributes` key.
- New: `src/hooks/useInlineRoll.ts` — helpers that wrap `useDiceStore` rolls, fire toasts, and (optionally) log to Chronicle.

## Implementation Steps
1) Inline roll hook ✅
- `useInlineRoll.ts` ships with stat/move/custom helpers, toast output, and character guardrails.

2) Stats → 1-click ✅
- `FolioStatsPage.tsx` now renders stat tiles as buttons that fire inline rolls with accessible labels.

3) Moves → roll ✅
- `MoveChips.tsx` routes moves through `useInlineRoll`, using `StatPickerPopover` when a stat choice is required.

4) Right-rail history ✅
- `PlayTab.tsx` mounts `RollLog` in the right rail, wired to dice history with reroll and copy handlers.

5) Auto-log default ON ✅
- `PlayTab.tsx` reads the `autoLogToChronicle` setting from the dice store and automatically pipes new rolls into the Chronicle when enabled.

6) Dice tab deprecation ✅
- Dice workflows live directly in the Play tab; navigation and shortcuts jump to the Dice tools panel instead of opening a drawer.

## Testing
- Vitest: unit tests for `useInlineRoll` (stat/move/custom), verify XP and hold side-effects when enabled.
- Playwright:
  - Click STR card → toast shown, entry appears in Play’s right-rail history.
  - Click “Hack & Slash” → move roll logged; verify reroll and copy work.
  - Keyboard: shortcuts work while on Play.
- Run: `npm run test:all` then `npm run screenshot:analyze`.

## Accessibility & Theme
- Buttons must be reachable via keyboard; add `aria-label` and visible focus.
- Use token-backed classes: `bg-primary`, `border-border`, `text-foreground`, `shadow-primary`. No inline colors.

## Acceptance Criteria
- No separate navigation to roll during play; stats and moves trigger rolls in-place.
- Roll history visible on Play, with reroll/copy.
- Auto-log to Chronicle is enabled by default and can be toggled.
- Dice tab replaced by drawer now; removable in the next cleanup pass without regressions.
