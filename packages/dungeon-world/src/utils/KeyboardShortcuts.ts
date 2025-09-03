export type ShortcutHandler = (event: KeyboardEvent) => void

export interface ShortcutSpec {
  combo: string // e.g., "g m", "ctrl+/"
  handler: ShortcutHandler
  scope?: string // optional scope id (e.g., panel id)
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

export function setActiveScope(scopeId: string | null): void {
  activeScope = scopeId
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
  // Simple combos: single key or space-separated sequence; we support single key + modifiers here
  // For now handle ctrl/meta/shift/alt + key
  const wanted = combo.split(' ')
  if (wanted.length > 1) {
    // sequences not supported in this minimal version
    return false
  }
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

function onKeydown(event: KeyboardEvent): void {
  // Ignore typing in inputs/textareas/contenteditable
  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable))
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
        console.warn('Shortcut handler error:', e)
      }
      break
    }
  }
}

// Attach once
if (typeof window !== 'undefined')
  window.addEventListener('keydown', onKeydown)
