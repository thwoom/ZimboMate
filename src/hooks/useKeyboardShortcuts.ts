import { useCallback, useEffect, useRef } from 'react'
import { keyboardShortcutsService } from '../services/KeyboardShortcutsService'

interface UseKeyboardShortcutsOptions {
  context?: string[]
  enabled?: boolean
}

/**
 * Hook to integrate keyboard shortcuts with React components
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>, options: UseKeyboardShortcutsOptions = {}) {
  const { context = [], enabled = true } = options
  const shortcutIdsRef = useRef<string[]>([])

  // Register shortcuts
  useEffect(() => {
    if (!enabled)
      return

    const shortcutIds: string[] = []

    Object.entries(shortcuts).forEach(([shortcutId, action]) => {
      const success = keyboardShortcutsService.updateShortcutAction(shortcutId, action)
      if (success) {
        shortcutIds.push(shortcutId)
      }
    })

    shortcutIdsRef.current = shortcutIds

    return () => {
      // Reset actions to prevent memory leaks
      shortcutIds.forEach((id) => {
        keyboardShortcutsService.updateShortcutAction(id, () => {})
      })
    }
  }, [shortcuts, enabled])

  // Update context
  useEffect(() => {
    if (enabled && context.length > 0) {
      keyboardShortcutsService.setContext(context)
    }
  }, [context, enabled])

  return {
    registeredShortcuts: shortcutIdsRef.current,
  }
}

/**
 * Hook for command palette integration
 */
export function useCommandPalette() {
  const isOpenRef = useRef(false)
  const onOpenRef = useRef<(() => void) | null>(null)
  const onCloseRef = useRef<(() => void) | null>(null)

  const registerCommandPalette = useCallback((
    onOpen: () => void,
    onClose: () => void,
  ) => {
    onOpenRef.current = onOpen
    onCloseRef.current = onClose

    // Register the command palette shortcut
    keyboardShortcutsService.updateShortcutAction('open-command-palette', () => {
      if (!isOpenRef.current && onOpenRef.current) {
        isOpenRef.current = true
        onOpenRef.current()
      }
    })
  }, [])

  const setIsOpen = useCallback((open: boolean) => {
    isOpenRef.current = open
    if (!open && onCloseRef.current) {
      onCloseRef.current()
    }
  }, [])

  return {
    registerCommandPalette,
    setIsOpen,
  }
}

/**
 * Hook for quick dice rolling shortcuts
 */
export function useDiceShortcuts(onRoll: (stat?: string) => void, enabled: boolean = true) {
  const shortcuts = {
    'quick-roll': () => onRoll(),
    'roll-strength': () => onRoll('strength'),
    'roll-dexterity': () => onRoll('dexterity'),
    'roll-constitution': () => onRoll('constitution'),
    'roll-intelligence': () => onRoll('intelligence'),
    'roll-wisdom': () => onRoll('wisdom'),
    'roll-charisma': () => onRoll('charisma'),
  }

  useKeyboardShortcuts(shortcuts, {
    context: ['dice', 'character'],
    enabled,
  })
}

/**
 * Hook for navigation shortcuts
 */
export function useNavigationShortcuts(onNavigate: (tabId: string) => void, enabled: boolean = true) {
  const shortcuts = {
    'tab-character': () => onNavigate('character'),
    'tab-dice': () => onNavigate('dice'),
    'tab-moves': () => onNavigate('moves'),
    'tab-equipment': () => onNavigate('equipment'),
    'tab-session-tools': () => onNavigate('session-tools'),
    'tab-campaign': () => onNavigate('campaign'),
  }

  useKeyboardShortcuts(shortcuts, { enabled })
}

/**
 * Hook for session tools shortcuts
 */
export function useSessionToolsShortcuts(actions: {
  onNewNote?: () => void
  onSearchNotes?: () => void
  onStartTimer?: () => void
}, enabled: boolean = true) {
  const shortcuts: Record<string, () => void> = {}

  if (actions.onNewNote) {
    shortcuts['new-note'] = actions.onNewNote
  }
  if (actions.onSearchNotes) {
    shortcuts['search-notes'] = actions.onSearchNotes
  }
  if (actions.onStartTimer) {
    shortcuts['start-timer'] = actions.onStartTimer
  }

  useKeyboardShortcuts(shortcuts, {
    context: ['session-tools'],
    enabled,
  })
}

/**
 * Hook for character management shortcuts
 */
export function useCharacterShortcuts(actions: {
  onSave?: () => void
  onHeal?: () => void
  onRest?: () => void
  onLevelUp?: () => void
}, enabled: boolean = true) {
  const shortcuts: Record<string, () => void> = {}

  if (actions.onSave) {
    shortcuts['save-character'] = actions.onSave
  }

  // These would need to be registered as new shortcuts
  // For now, we'll handle them through the command palette

  useKeyboardShortcuts(shortcuts, {
    context: ['character'],
    enabled,
  })
}

/**
 * Hook for global shortcuts
 */
export function useGlobalShortcuts(actions: {
  onToggleTheme?: () => void
}, enabled: boolean = true) {
  const shortcuts: Record<string, () => void> = {}

  if (actions.onToggleTheme) {
    shortcuts['toggle-theme'] = actions.onToggleTheme
  }

  useKeyboardShortcuts(shortcuts, { enabled })
}
