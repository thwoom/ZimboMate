# Integration Requirements

- **Keyboard shortcuts**
  - Central registry with scopes
  - Suspend when a dialog is present (role="dialog" or aria-modal="true")
  - Ignore typing in inputs/contenteditable
  - Conflict detection logs and suggestions
  - Searchable Shortcuts Overlay (toggle with `?` / `Ctrl+/`)

- **Context menu**
  - ARIA: role="menu", items role="menuitem"
  - Keyboard: ArrowUp/Down, Enter/Space, ESC to close, focus restore
  - No inline styles; use `ContextMenu.css`
  - Viewport clamping, type-ahead, optional disabled reasons

- **Tooltip**
  - Works on hover and focus; uses `aria-describedby`
  - No inline styles; uses `Tooltip.css`
  - Delay and placement control; collision avoidance; reduced-motion

- **Panel state**
  - `usePanelState(panelId, initial)` persists per-panel UI flags in `ui.panelState`
  - LocalStorage manager helpers in `framework/PanelState`

- **Config (implicit)**
  - Keyboard: global scope `global`, dialog suspension enabled
  - Context menu enabled by default

## Settings

- Integration Settings panel exposes:
  - Toggle custom context menu
  - Toggle shortcuts overlay
  - Tooltip delay (ms)
  - High contrast menu
  - Suspend shortcuts when dialog is open

## Telemetry (dev)

- Lightweight counters in `utils/DevTelemetry.ts` collect:
  - Shortcut triggers
  - Context menu opens and selects
  - Tooltip shows
