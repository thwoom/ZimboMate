/**
 * Keyboard Shortcuts Service for ZimboMate V2
 * Manages global keyboard shortcuts with conflict detection and context awareness
 */

export interface KeyboardShortcut {
  id: string
  key: string
  modifiers: ('ctrl' | 'shift' | 'alt' | 'meta')[]
  description: string
  category: 'navigation' | 'dice' | 'character' | 'session' | 'global'
  context?: string[] // Optional context where shortcut is active
  action: () => void
  enabled: boolean
}

export interface ShortcutCategory {
  id: string
  name: string
  shortcuts: KeyboardShortcut[]
}

class KeyboardShortcutsService {
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private keyMap: Map<string, string> = new Map() // key combination -> shortcut id
  private listeners: Set<(event: KeyboardEvent) => void> = new Set()
  private isEnabled = true
  private currentContext: string[] = ['global']

  constructor() {
    this.initializeDefaultShortcuts()
    this.bindGlobalListener()
  }

  /**
   * Initialize default shortcuts for ZimboMate V2
   */
  private initializeDefaultShortcuts() {
    const defaultShortcuts: Omit<KeyboardShortcut, 'action'>[] = [
      // Global Navigation
      {
        id: 'open-command-palette',
        key: 'k',
        modifiers: ['ctrl'],
        description: 'Open Command Palette',
        category: 'global',
        enabled: true
      },
      {
        id: 'toggle-theme',
        key: 't',
        modifiers: ['ctrl', 'shift'],
        description: 'Toggle Theme',
        category: 'global',
        enabled: true
      },
      {
        id: 'save-character',
        key: 's',
        modifiers: ['ctrl'],
        description: 'Save Character',
        category: 'character',
        enabled: true
      },
      
      // Tab Navigation
      {
        id: 'tab-character',
        key: '1',
        modifiers: ['ctrl'],
        description: 'Go to Character Tab',
        category: 'navigation',
        enabled: true
      },
      {
        id: 'tab-dice',
        key: '2',
        modifiers: ['ctrl'],
        description: 'Go to Dice Tab',
        category: 'navigation',
        enabled: true
      },
      {
        id: 'tab-moves',
        key: '3',
        modifiers: ['ctrl'],
        description: 'Go to Moves Tab',
        category: 'navigation',
        enabled: true
      },
      {
        id: 'tab-equipment',
        key: '4',
        modifiers: ['ctrl'],
        description: 'Go to Equipment Tab',
        category: 'navigation',
        enabled: true
      },
      {
        id: 'tab-session-tools',
        key: '5',
        modifiers: ['ctrl'],
        description: 'Go to Session Tools Tab',
        category: 'navigation',
        enabled: true
      },
      {
        id: 'tab-campaign',
        key: '6',
        modifiers: ['ctrl'],
        description: 'Go to Campaign Tab',
        category: 'navigation',
        enabled: true
      },

      // Quick Dice Rolling
      {
        id: 'quick-roll',
        key: ' ',
        modifiers: [],
        description: 'Quick 2d6 Roll',
        category: 'dice',
        context: ['dice', 'character'],
        enabled: true
      },
      {
        id: 'roll-strength',
        key: '1',
        modifiers: [],
        description: 'Roll + Strength',
        category: 'dice',
        context: ['dice'],
        enabled: true
      },
      {
        id: 'roll-dexterity',
        key: '2',
        modifiers: [],
        description: 'Roll + Dexterity',
        category: 'dice',
        context: ['dice'],
        enabled: true
      },
      {
        id: 'roll-constitution',
        key: '3',
        modifiers: [],
        description: 'Roll + Constitution',
        category: 'dice',
        context: ['dice'],
        enabled: true
      },
      {
        id: 'roll-intelligence',
        key: '4',
        modifiers: [],
        description: 'Roll + Intelligence',
        category: 'dice',
        context: ['dice'],
        enabled: true
      },
      {
        id: 'roll-wisdom',
        key: '5',
        modifiers: [],
        description: 'Roll + Wisdom',
        category: 'dice',
        context: ['dice'],
        enabled: true
      },
      {
        id: 'roll-charisma',
        key: '6',
        modifiers: [],
        description: 'Roll + Charisma',
        category: 'dice',
        context: ['dice'],
        enabled: true
      },

      // Session Management
      {
        id: 'new-note',
        key: 'n',
        modifiers: ['ctrl'],
        description: 'New Note',
        category: 'session',
        context: ['session-tools'],
        enabled: true
      },
      {
        id: 'search-notes',
        key: 'f',
        modifiers: ['ctrl'],
        description: 'Search Notes',
        category: 'session',
        context: ['session-tools'],
        enabled: true
      },
      {
        id: 'start-timer',
        key: 't',
        modifiers: ['ctrl'],
        description: 'Start Timer',
        category: 'session',
        context: ['session-tools'],
        enabled: true
      }
    ]

    // Register shortcuts with placeholder actions
    defaultShortcuts.forEach(shortcut => {
      this.registerShortcut({
        ...shortcut,
        action: () => console.log(`Shortcut triggered: ${shortcut.id}`)
      })
    })
  }

  /**
   * Register a new keyboard shortcut
   */
  registerShortcut(shortcut: KeyboardShortcut): boolean {
    const keyCombo = this.createKeyCombo(shortcut.key, shortcut.modifiers)
    
    // Check for conflicts
    if (this.keyMap.has(keyCombo)) {
      console.warn(`Keyboard shortcut conflict: ${keyCombo} already registered`)
      return false
    }

    this.shortcuts.set(shortcut.id, shortcut)
    this.keyMap.set(keyCombo, shortcut.id)
    return true
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregisterShortcut(shortcutId: string): boolean {
    const shortcut = this.shortcuts.get(shortcutId)
    if (!shortcut) return false

    const keyCombo = this.createKeyCombo(shortcut.key, shortcut.modifiers)
    this.shortcuts.delete(shortcutId)
    this.keyMap.delete(keyCombo)
    return true
  }

  /**
   * Update shortcut action
   */
  updateShortcutAction(shortcutId: string, action: () => void): boolean {
    const shortcut = this.shortcuts.get(shortcutId)
    if (!shortcut) return false

    shortcut.action = action
    return true
  }

  /**
   * Set current context for context-aware shortcuts
   */
  setContext(context: string[]) {
    this.currentContext = ['global', ...context]
  }

  /**
   * Get all shortcuts grouped by category
   */
  getShortcutsByCategory(): ShortcutCategory[] {
    const categories = new Map<string, KeyboardShortcut[]>()
    
    this.shortcuts.forEach(shortcut => {
      if (!categories.has(shortcut.category)) {
        categories.set(shortcut.category, [])
      }
      categories.get(shortcut.category)!.push(shortcut)
    })

    return Array.from(categories.entries()).map(([id, shortcuts]) => ({
      id,
      name: this.getCategoryName(id),
      shortcuts: shortcuts.sort((a, b) => a.description.localeCompare(b.description))
    }))
  }

  /**
   * Get shortcuts for command palette
   */
  getSearchableShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
      .filter(shortcut => shortcut.enabled)
      .sort((a, b) => a.description.localeCompare(b.description))
  }

  /**
   * Enable/disable shortcuts globally
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  /**
   * Create key combination string
   */
  private createKeyCombo(key: string, modifiers: string[]): string {
    const sortedModifiers = [...modifiers].sort()
    return [...sortedModifiers, key.toLowerCase()].join('+')
  }

  /**
   * Parse keyboard event to key combination
   */
  private parseKeyEvent(event: KeyboardEvent): string {
    const modifiers: string[] = []
    if (event.ctrlKey) modifiers.push('ctrl')
    if (event.shiftKey) modifiers.push('shift')
    if (event.altKey) modifiers.push('alt')
    if (event.metaKey) modifiers.push('meta')

    return this.createKeyCombo(event.key, modifiers)
  }

  /**
   * Check if shortcut is active in current context
   */
  private isShortcutActive(shortcut: KeyboardShortcut): boolean {
    if (!shortcut.enabled) return false
    if (!shortcut.context) return true
    
    return shortcut.context.some(context => 
      this.currentContext.includes(context)
    )
  }

  /**
   * Bind global keyboard event listener
   */
  private bindGlobalListener() {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!this.isEnabled) return

      // Skip if user is typing in input fields
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return
      }

      const keyCombo = this.parseKeyEvent(event)
      const shortcutId = this.keyMap.get(keyCombo)
      
      if (shortcutId) {
        const shortcut = this.shortcuts.get(shortcutId)
        if (shortcut && this.isShortcutActive(shortcut)) {
          event.preventDefault()
          event.stopPropagation()
          shortcut.action()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
  }

  /**
   * Get category display name
   */
  private getCategoryName(categoryId: string): string {
    const names: Record<string, string> = {
      global: 'Global',
      navigation: 'Navigation',
      dice: 'Dice Rolling',
      character: 'Character',
      session: 'Session Tools'
    }
    return names[categoryId] || categoryId
  }

  /**
   * Format shortcut for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const modifierMap: Record<string, string> = {
      ctrl: navigator.platform.includes('Mac') ? '⌘' : 'Ctrl',
      shift: '⇧',
      alt: navigator.platform.includes('Mac') ? '⌥' : 'Alt',
      meta: '⌘'
    }

    const parts = [
      ...shortcut.modifiers.map(mod => modifierMap[mod] || mod),
      shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase()
    ]

    return parts.join(navigator.platform.includes('Mac') ? '' : '+')
  }
}

// Singleton instance
export const keyboardShortcutsService = new KeyboardShortcutsService()
export { KeyboardShortcutsService }