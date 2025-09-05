# Integration Requirements

- **Keyboard shortcuts**
  - Central registry with scopes
  - Suspend when a dialog is present (role="dialog" or aria-modal="true")
  - Ignore typing in inputs/contenteditable

- **Context menu**
  - ARIA: role="menu", items role="menuitem"
  - Keyboard: ArrowUp/Down, Enter/Space, ESC to close, focus restore
  - No inline styles; use `ContextMenu.css`

- **Tooltip**
  - Works on hover and focus; uses `aria-describedby`
  - No inline styles; uses `Tooltip.css`

- **Panel state**
  - `usePanelState(panelId, initial)` persists per-panel UI flags in `ui.panelState`

- **Config (implicit)**
  - Keyboard: global scope `global`, dialog suspension enabled
  - Context menu enabled by default
