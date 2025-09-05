export type ShortcutHandler = (event: KeyboardEvent) => void

export interface ShortcutSpec {
  combo: string // e.g., "g m", "ctrl+/"
  handler: ShortcutHandler
  scope?: string // optional scope id (e.g., panel id or 'global')
  preventDefault?: boolean
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
  // Simple polling-based suspension for dialogs
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

export function registerShortcut(spec: ShortcutSpec): () => void {
  const normalized = normalizeCombo(spec.combo)
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

function matchEventToCombo(event: KeyboardEvent, combo: string): boolean {
  // Simple combos: single key with optional modifiers
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
  if (suspended)
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
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Shortcut handler error:', e)
      }
      break
    }
  }
}

// Attach once and add basic modal suspension if a dialog is present
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKeydown)
  // suspend when any role="dialog" or [aria-modal="true"] is present
  suspendDuring(() => !!document.querySelector('[role="dialog"], [aria-modal="true"]'))
}
