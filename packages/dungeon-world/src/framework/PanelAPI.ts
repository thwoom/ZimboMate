/**
 * Event-based API for panel communication
 */

const STORAGE_PREFIX = 'dw_panel_state_v1:'

export function loadPanelState<T>(panelId: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + panelId)
    if (!raw)
      return fallback
    return { ...fallback, ...JSON.parse(raw) }
  }
  catch {
    return fallback
  }
}

export function savePanelState<T extends Record<string, unknown>>(panelId: string, state: Partial<T>): void {
  try {
    const key = STORAGE_PREFIX + panelId
    const raw = localStorage.getItem(key)
    const prev = raw ? JSON.parse(raw) : {}
    const next = { ...prev, ...state }
    localStorage.setItem(key, JSON.stringify(next))
  }
  catch {
    // ignore
  }
}
