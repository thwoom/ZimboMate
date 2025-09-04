/**
 * Panel API: lightweight event bus and simple persistence helpers
 */

// -------------------- Persistence --------------------
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

// -------------------- Event Bus --------------------
type EventPayload = { type: string, data?: any }
type Listener = (event: EventPayload) => void

class SimpleEventBus {
  private listeners: Map<string, Set<Listener>> = new Map()

  on(type: string, handler: Listener): () => void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(handler)
    return () => {
      this.listeners.get(type)?.delete(handler)
    }
  }

  emit(type: string, data?: any): void {
    const event = { type, data } as EventPayload
    const set = this.listeners.get(type)
    if (!set) return
    for (const fn of Array.from(set)) {
      try { fn(event) } catch { /* noop */ }
    }
  }
}

export const panelEventBus = new SimpleEventBus()

export function createPanelAPI(panelId: string) {
  return {
    send: (type: string, data?: any) => panelEventBus.emit(type, { panelId, ...data }),
    listen: (type: string, handler: (data: any) => void) => panelEventBus.on(type, (evt) => handler(evt.data)),
  }
}
