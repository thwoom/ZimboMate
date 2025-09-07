### Session Tools Panel

The Session Tools panel provides quick utilities for table play.

- Dice Roller
  - 2d6 + modifier with Advantage/Disadvantage
  - Shortcut: Ctrl+Shift+R (panel-scoped)
  - Emits log entries of type `roll`

- Note Keeper
  - Text notes with autosave and search highlight
  - Persisted per panel via localStorage

- Trackers
  - Add Hold/Charge/Counter (or custom) trackers
  - Increment/Decrement/Reset/Delete; persisted

- Timers & Bookmarks
  - Stopwatch and Countdown timers (min/sec)
  - Bookmarks with timestamps
  - Emits log entries of type `timer` and `bookmark`

- Roll & Event Log
  - Unified log with type filter and search
  - Export (clipboard) and Import (JSON)

Integration
- Uses `panelEventBus.emit('session:log:add', { type, text })` to populate log
- Badges can be updated by emitting `panelEventBus.emit('badge:update')`

Accessibility
- Regions labeled via aria attributes
- Live regions announce changes in dice/timers/log
- Full keyboard access for all controls



