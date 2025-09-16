import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, Command, Zap, User, Dice6, Scroll, Package, NotebookPen, MapPin, Settings } from 'lucide-react'
import { keyboardShortcutsService, type KeyboardShortcut } from '../../services/KeyboardShortcutsService'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (tabId: string) => void
  onAction?: (actionId: string) => void
}

interface CommandAction {
  id: string
  title: string
  description: string
  category: 'navigation' | 'dice' | 'character' | 'session' | 'global'
  icon: React.ComponentType<{ size?: number; className?: string }>
  shortcut?: string
  action: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onAction
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Define available commands
  const commands: CommandAction[] = useMemo(() => [
    // Navigation Commands
    {
      id: 'nav-character',
      title: 'Character Sheet',
      description: 'View and manage character stats, HP, and abilities',
      category: 'navigation',
      icon: User,
      shortcut: 'Ctrl+1',
      action: () => onNavigate?.('character')
    },
    {
      id: 'nav-dice',
      title: 'Dice Roller',
      description: 'Roll dice with 3D physics and effects',
      category: 'navigation',
      icon: Dice6,
      shortcut: 'Ctrl+2',
      action: () => onNavigate?.('dice')
    },
    {
      id: 'nav-moves',
      title: 'Moves & Actions',
      description: 'Browse and execute Dungeon World moves',
      category: 'navigation',
      icon: Scroll,
      shortcut: 'Ctrl+3',
      action: () => onNavigate?.('moves')
    },
    {
      id: 'nav-equipment',
      title: 'Equipment & Inventory',
      description: 'Manage gear, weapons, and magical items',
      category: 'navigation',
      icon: Package,
      shortcut: 'Ctrl+4',
      action: () => onNavigate?.('equipment')
    },
    {
      id: 'nav-session-tools',
      title: 'Session Tools',
      description: 'Notes, timers, trackers, and roll history',
      category: 'navigation',
      icon: NotebookPen,
      shortcut: 'Ctrl+5',
      action: () => onNavigate?.('session-tools')
    },
    {
      id: 'nav-campaign',
      title: 'Campaign Management',
      description: 'Manage campaigns, NPCs, and world building',
      category: 'navigation',
      icon: MapPin,
      shortcut: 'Ctrl+6',
      action: () => onNavigate?.('campaign')
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      description: 'Customize themes, preferences, and shortcuts',
      category: 'navigation',
      icon: Settings,
      action: () => onNavigate?.('settings')
    },

    // Quick Actions
    {
      id: 'quick-roll-2d6',
      title: 'Quick 2d6 Roll',
      description: 'Roll 2d6 with no modifier',
      category: 'dice',
      icon: Dice6,
      shortcut: 'Space',
      action: () => {
        onAction?.('quick-roll-2d6')
        onNavigate?.('dice')
      }
    },
    {
      id: 'roll-strength',
      title: 'Roll + Strength',
      description: 'Roll 2d6 + Strength modifier',
      category: 'dice',
      icon: Zap,
      shortcut: '1 (in dice tab)',
      action: () => {
        onAction?.('roll-strength')
        onNavigate?.('dice')
      }
    },
    {
      id: 'roll-dexterity',
      title: 'Roll + Dexterity',
      description: 'Roll 2d6 + Dexterity modifier',
      category: 'dice',
      icon: Zap,
      shortcut: '2 (in dice tab)',
      action: () => {
        onAction?.('roll-dexterity')
        onNavigate?.('dice')
      }
    },
    {
      id: 'roll-constitution',
      title: 'Roll + Constitution',
      description: 'Roll 2d6 + Constitution modifier',
      category: 'dice',
      icon: Zap,
      shortcut: '3 (in dice tab)',
      action: () => {
        onAction?.('roll-constitution')
        onNavigate?.('dice')
      }
    },

    // Character Actions
    {
      id: 'heal-character',
      title: 'Heal Character',
      description: 'Restore HP to maximum',
      category: 'character',
      icon: User,
      action: () => onAction?.('heal-character')
    },
    {
      id: 'rest-character',
      title: 'Take Rest',
      description: 'Character takes a rest to recover',
      category: 'character',
      icon: User,
      action: () => onAction?.('rest-character')
    },
    {
      id: 'level-up',
      title: 'Level Up',
      description: 'Advance character to next level',
      category: 'character',
      icon: Zap,
      action: () => onAction?.('level-up')
    },

    // Session Tools
    {
      id: 'new-note',
      title: 'New Note',
      description: 'Create a new session note',
      category: 'session',
      icon: NotebookPen,
      shortcut: 'Ctrl+N',
      action: () => {
        onAction?.('new-note')
        onNavigate?.('session-tools')
      }
    },
    {
      id: 'start-timer',
      title: 'Start Timer',
      description: 'Start a new session timer',
      category: 'session',
      icon: NotebookPen,
      shortcut: 'Ctrl+T',
      action: () => {
        onAction?.('start-timer')
        onNavigate?.('session-tools')
      }
    }
  ], [onNavigate, onAction])

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const searchQuery = query.toLowerCase()
    return commands.filter(command => 
      command.title.toLowerCase().includes(searchQuery) ||
      command.description.toLowerCase().includes(searchQuery) ||
      command.category.toLowerCase().includes(searchQuery)
    )
  }, [commands, query])

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          )
          break
        case 'Enter':
          event.preventDefault()
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action()
            onClose()
          }
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onClose])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation': return Command
      case 'dice': return Dice6
      case 'character': return User
      case 'session': return NotebookPen
      default: return Zap
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'var(--color-primary)'
      case 'dice': return 'var(--color-accent)'
      case 'character': return 'var(--color-success)'
      case 'session': return 'var(--color-info)'
      default: return 'var(--color-text-secondary)'
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-50 glass-surface"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            className="fixed top-[20%] left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 glass-surface rounded-xl border shadow-2xl"
            style={{ 
              borderColor: 'var(--color-primary)',
              borderOpacity: 0.3,
              backgroundColor: 'var(--color-surface)'
            }}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.2 }}>
              <Search size={20} style={{ color: 'var(--color-text-secondary)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-lg outline-none placeholder-opacity-60"
                style={{ 
                  color: 'var(--color-text-primary)',
                  '::placeholder': { color: 'var(--color-text-secondary)' }
                }}
              />
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <kbd className="px-2 py-1 rounded border" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.3 }}>
                  ↑↓
                </kbd>
                <span>navigate</span>
                <kbd className="px-2 py-1 rounded border" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.3 }}>
                  ↵
                </kbd>
                <span>select</span>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                  <Search size={32} className="mx-auto mb-3 opacity-50" />
                  <p>No commands found for "{query}"</p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredCommands.map((command, index) => {
                    const Icon = command.icon
                    const CategoryIcon = getCategoryIcon(command.category)
                    const isSelected = index === selectedIndex

                    return (
                      <motion.div
                        key={command.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'glass-surface' : ''
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                          backgroundOpacity: isSelected ? 0.1 : 0
                        }}
                        onClick={() => {
                          command.action()
                          onClose()
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ 
                            backgroundColor: getCategoryColor(command.category),
                            backgroundOpacity: 0.2
                          }}
                        >
                          <Icon 
                            size={18} 
                            style={{ color: getCategoryColor(command.category) }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 
                              className="font-medium truncate"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {command.title}
                            </h3>
                            <CategoryIcon 
                              size={12} 
                              style={{ color: 'var(--color-text-muted)' }}
                            />
                          </div>
                          <p 
                            className="text-sm truncate"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {command.description}
                          </p>
                        </div>

                        {command.shortcut && (
                          <div 
                            className="text-xs px-2 py-1 rounded border"
                            style={{ 
                              color: 'var(--color-text-muted)',
                              borderColor: 'var(--color-primary)',
                              borderOpacity: 0.3
                            }}
                          >
                            {command.shortcut}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div 
              className="flex items-center justify-between p-3 border-t text-xs"
              style={{ 
                borderColor: 'var(--color-primary)',
                borderOpacity: 0.2,
                color: 'var(--color-text-muted)'
              }}
            >
              <div className="flex items-center gap-4">
                <span>Tip: Use Ctrl+K to open this palette anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded border" style={{ borderColor: 'var(--color-primary)', borderOpacity: 0.3 }}>
                  Esc
                </kbd>
                <span>to close</span>
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}