export type ShortcutHandler = (event: KeyboardEvent) => void

export interface ShortcutSpec {
  combo: string // e.g., "g m", "ctrl+/"
  handler: ShortcutHandler
  scope?: string // optional scope id (e.g., panel id or 'global')
  preventDefault?: boolean
  description?: string
}

interface RegisteredShortcut extends ShortcutSpec {
  normalized: string
}

function normalizeCombo(combo: string): string {
  return combo.trim().toLowerCase().replace(/\s+/g, ' ')
}

const shortcuts: RegisteredShortcut[] = []
let activeScope: string | null = null
let suspended = false
let paused = false
let lastKeydownAt = 0
let dialogSuspendEnabled = true

export function setDialogSuspensionEnabled(enabled: boolean): void {
  dialogSuspendEnabled = enabled
}

export function setActiveScope(scopeId: string | null): void {
  activeScope = scopeId
}

export function withScope<T>(scopeId: string, fn: () => T): T {
  const prev = activeScope
  activeScope = scopeId
  try {
    return fn()
  }
  finally {
    activeScope = prev
  }
}

export function suspendShortcuts(suspend: boolean): void {
  suspended = suspend
}

export function suspendDuring(predicate: () => boolean): void {
  const update = () => {
    try {
      suspended = predicate()
    }
    catch {
      suspended = false
    }
  }
  update()
  const id = window.setInterval(update, 150)
  window.addEventListener('beforeunload', () => clearInterval(id), { once: true })
}

export function getRegisteredShortcuts(): Array<Pick<RegisteredShortcut, 'combo' | 'normalized' | 'scope' | 'description'>> {
  return shortcuts.map(({ combo, normalized, scope, description }) => ({ combo, normalized, scope, description }))
}

function suggestAlternative(normalized: string): string {
  const base = normalized.replace(/^ctrl\+|^alt\+|^meta\+|^shift\+/g, '')
  const candidates = [
    `ctrl+alt+${base}`,
    `alt+${base}`,
    `ctrl+shift+${base}`,
  ]
  for (const c of candidates) {
    const exists = shortcuts.some(s => s.normalized === c)
    if (!exists)
      return c
  }
  return `${base}-conflict`
}

export function registerShortcut(spec: ShortcutSpec): () => void {
  const normalized = normalizeCombo(spec.combo)
  const conflict = shortcuts.find(s => s.normalized === normalized && (s.scope ?? 'global') === (spec.scope ?? 'global'))
  if (conflict) {
    // eslint-disable-next-line no-console
    console.warn(`Shortcut conflict for "${normalized}" in scope "${spec.scope ?? 'global'}"`)
    const alt = suggestAlternative(normalized)
    // eslint-disable-next-line no-console
    console.warn(`Suggested alternative: ${alt}`)
  }
  const entry: RegisteredShortcut = { ...spec, normalized }
  shortcuts.push(entry)
  return () => unregisterShortcut(entry)
}

export function unregisterShortcut(spec: RegisteredShortcut | ShortcutSpec): void {
  const normalized = 'normalized' in spec ? spec.normalized : normalizeCombo(spec.combo)
  const idx = shortcuts.findIndex(s => s.normalized === normalized && s.scope === ('scope' in spec ? spec.scope : spec.scope))
  if (idx >= 0)
    shortcuts.splice(idx, 1)
}

export function remapShortcut(oldNormalized: string, newCombo: string): boolean {
  const idx = shortcuts.findIndex(s => s.normalized === oldNormalized)
  if (idx < 0) return false
  const newNorm = normalizeCombo(newCombo)
  const conflict = shortcuts.find((s, i) => i !== idx && s.normalized === newNorm && (s.scope ?? 'global') === (shortcuts[idx].scope ?? 'global'))
  if (conflict) {
    // eslint-disable-next-line no-console
    console.warn(`Remap conflict for "${newNorm}"; keeping old mapping.`)
    return false
  }
  shortcuts[idx].combo = newCombo
  shortcuts[idx].normalized = newNorm
  try {
    const raw = localStorage.getItem('keymapOverrides')
    const overrides = raw ? JSON.parse(raw) : {}
    overrides[oldNormalized] = newCombo
    localStorage.setItem('keymapOverrides', JSON.stringify(overrides))
  } catch {}
  return true
}

export function exportKeymap(): Record<string, string> {
  const raw = (typeof localStorage !== 'undefined') ? localStorage.getItem('keymapOverrides') : null
  try { return raw ? JSON.parse(raw) : {} } catch { return {} }
}

export function importKeymap(map: Record<string, string>): void {
  try { localStorage.setItem('keymapOverrides', JSON.stringify(map)) } catch {}
  for (const [old, nw] of Object.entries(map))
    remapShortcut(old, nw)
}

function matchEventToCombo(event: KeyboardEvent, combo: string): boolean {
  const wanted = combo.split(' ')
  if (wanted.length > 1)
    return false
  const part = wanted[0]
  const needCtrl = part.includes('ctrl+')
  const needMeta = part.includes('meta+')
  const needAlt = part.includes('alt+')
  const needShift = part.includes('shift+')
  const key = part.replace(/(ctrl\+|meta\+|alt\+|shift\+)/g, '')
  const eventKey = event.key.toLowerCase()
  return (
    (!needCtrl || event.ctrlKey)
    && (!needMeta || event.metaKey)
    && (!needAlt || event.altKey)
    && (!needShift || event.shiftKey)
    && eventKey === key
  )
}

function isTypingTarget(target: HTMLElement | null): boolean {
  return !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
}

function onKeydown(event: KeyboardEvent): void {
  const now = Date.now()
  if (now - lastKeydownAt < 24)
    return
  lastKeydownAt = now
  if (paused || suspended)
    return
  const target = event.target as HTMLElement | null
  if (isTypingTarget(target))
    return

  for (const s of shortcuts) {
    if (s.scope && activeScope && s.scope !== activeScope)
      continue
    if (matchEventToCombo(event, s.normalized)) {
      if (s.preventDefault)
        event.preventDefault()
      try {
        s.handler(event)
        try {
          const t: any = (window as any).__devTelemetry
          if (t && typeof t.recordShortcutTrigger === 'function')
            t.recordShortcutTrigger(s.normalized)
        } catch {}
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Shortcut handler error:', e)
      }
      break
    }
  }
}

function initOverlayHotkeys(): void {
  const toggle = () => window.dispatchEvent(new CustomEvent('shortcuts:toggle-overlay'))
  registerShortcut({ combo: '?', handler: toggle, description: 'Open shortcuts overlay', scope: 'global', preventDefault: true })
  registerShortcut({ combo: 'ctrl+/', handler: toggle, description: 'Open shortcuts overlay', scope: 'global', preventDefault: true })
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKeydown)
  suspendDuring(() => dialogSuspendEnabled && !!document.querySelector('[role="dialog"], [aria-modal="true"]'))
  window.addEventListener('blur', () => { paused = true })
  window.addEventListener('focus', () => { paused = false })
  initOverlayHotkeys()
}
