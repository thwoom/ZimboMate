### Integration Requirements

This document outlines the UI/UX integration features and requirements implemented in the Dungeon World app. It serves as a reference for behavior, accessibility, and configuration.

- **Keyboard Shortcuts**
  - Scope-aware and globally suspendable during modals/overlays
  - Default combos: `?` or `Ctrl+/` opens the Shortcuts Overlay
  - Remapping supported via the Keymap Editor (conflict detection)
  - Respect `prefers-reduced-motion` where applicable
  - Accessibility: ensure focus remains visible and actionable

- **Context Menu**
  - Custom context menu with keyboard navigation (ArrowUp/Down, Enter/Space, ESC)
  - Type-ahead support and disabled item reasons
  - Viewport-aware positioning with clamping
  - Native browser context menu is suppressed where custom menu is enabled
  - Toggle via integration settings: `contextMenuEnabled`

- **Tooltips**
  - Configurable delay and placement; collision avoidance enabled
  - Accessible: `role="tooltip"`, `aria-describedby`
  - Reduced motion support; no content-only hover traps
  - Toggle via settings (`tooltipDelayMs`) and follow system preferences

- **Panel State Preservation**
  - Per-panel UI state persisted (e.g., collapsed sections, filters)
  - Backed by `LocalStoragePanelStateManager` and `usePanelState`
  - Safe defaults when no stored state exists

- **Accessibility**
  - Modals: `role="dialog"`, `aria-modal="true"`, labeled by title and description
  - Focus trap active while open; ESC closes with confirmation when required
  - Buttons include `type="button"` to prevent implicit submit
  - Lists, menus, and overlays provide ARIA roles and labels

- **Telemetry (Dev)**
  - Non-identifying counters for shortcuts, context menu, and tooltips
  - Exposed via `window.__devTelemetry` for development and tests

- **Configuration**
  - See `config/integration.json` for defaults controlling toggles and timing.

- **References (Code)**
  - `src/utils/KeyboardShortcuts.ts`
  - `src/components/ContextMenu.tsx`
  - `src/components/Tooltip.tsx`
  - `src/components/ShortcutsOverlay.tsx`
  - `src/framework/PanelState.ts`, `src/hooks/usePanelState.ts`
  - `src/panels/SettingsPanel/IntegrationSettings.tsx`
