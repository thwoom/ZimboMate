import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'
import {
  BicepsFlexed,
  Brain,
  Command,
  Dice6,
  Eye,
  MapPin,
  NotebookPen,
  Package,
  Scroll,
  Search,
  Settings,
  Shield,
  Sword,
  User,
  Users,
  Zap,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCharacterStore } from '../../stores/characterStore'
import { useDiceStore } from '../../stores/diceStore'

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
  onAction,
}) => {
  const [query, setQuery] = useState('')
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(
    null,
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const activeCharacterId = useCharacterStore((state) => {
    const active = state.getActiveCharacter ? state.getActiveCharacter() : null
    return active?.id ?? state.characters[0]?.id ?? ''
  })

  const notifyMissingCharacter = useCallback(() => {
    toast('Select a character before rolling dice.', {
      description: 'Open the Character tab to create or choose a hero.',
    })
    onNavigate?.('character')
  }, [onNavigate])

  // Access dice store for rolling
  const { rollStat, rollMove, rollCustom, clearAllHistory } = useDiceStore()

  // Define available commands
  const commands: CommandAction[] = useMemo(
    () => [
      // Navigation Commands
      {
        id: 'nav-character',
        title: 'Character Sheet',
        description: 'View and manage character stats, HP, and abilities',
        category: 'navigation',
        icon: User,
        shortcut: 'Ctrl+1',
        action: () => onNavigate?.('character'),
      },
      {
        id: 'nav-dice',
        title: 'Dice Roller',
        description: 'Roll dice with 3D physics and effects',
        category: 'navigation',
        icon: Dice6,
        shortcut: 'Ctrl+2',
        action: () => onNavigate?.('dice'),
      },
      {
        id: 'nav-moves',
        title: 'Moves & Actions',
        description: 'Browse and execute Dungeon World moves',
        category: 'navigation',
        icon: Scroll,
        shortcut: 'Ctrl+3',
        action: () => onNavigate?.('moves'),
      },
      {
        id: 'nav-equipment',
        title: 'Equipment & Inventory',
        description: 'Manage gear, weapons, and magical items',
        category: 'navigation',
        icon: Package,
        shortcut: 'Ctrl+4',
        action: () => onNavigate?.('equipment'),
      },
      {
        id: 'nav-session-tools',
        title: 'Session Tools',
        description: 'Notes, timers, trackers, and roll history',
        category: 'navigation',
        icon: NotebookPen,
        shortcut: 'Ctrl+5',
        action: () => onNavigate?.('session-tools'),
      },
      {
        id: 'nav-campaign',
        title: 'Campaign Management',
        description: 'Manage campaigns, NPCs, and world building',
        category: 'navigation',
        icon: MapPin,
        shortcut: 'Ctrl+6',
        action: () => onNavigate?.('campaign'),
      },
      {
        id: 'nav-settings',
        title: 'Settings',
        description: 'Customize themes, preferences, and shortcuts',
        category: 'navigation',
        icon: Settings,
        action: () => onNavigate?.('settings'),
      },

      // Quick Dice Actions
      {
        id: 'quick-roll-2d6',
        title: 'Quick 2d6 Roll',
        description: 'Roll 2d6 with no modifier',
        category: 'dice',
        icon: Dice6,
        shortcut: 'Space',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollCustom({
            modifier: 0,
            context: {
              label: 'Quick Roll',
              description: 'Command Palette Quick Roll',
            },
            characterId: activeCharacterId,
          })
          onClose()
        },
      },

      // Stat Roll Commands
      {
        id: 'roll-strength',
        title: 'Roll Strength',
        description: 'Roll 2d6 + STR modifier',
        category: 'dice',
        icon: BicepsFlexed,
        shortcut: 'S',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollStat('STR', activeCharacterId, 'Command Palette STR Roll')
          onClose()
        },
      },
      {
        id: 'roll-dexterity',
        title: 'Roll Dexterity',
        description: 'Roll 2d6 + DEX modifier',
        category: 'dice',
        icon: Eye,
        shortcut: 'D',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollStat('DEX', activeCharacterId, 'Command Palette DEX Roll')
          onClose()
        },
      },
      {
        id: 'roll-constitution',
        title: 'Roll Constitution',
        description: 'Roll 2d6 + CON modifier',
        category: 'dice',
        icon: Shield,
        shortcut: 'C',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollStat('CON', activeCharacterId, 'Command Palette CON Roll')
          onClose()
        },
      },
      {
        id: 'roll-intelligence',
        title: 'Roll Intelligence',
        description: 'Roll 2d6 + INT modifier',
        category: 'dice',
        icon: Brain,
        shortcut: 'I',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollStat('INT', activeCharacterId, 'Command Palette INT Roll')
          onClose()
        },
      },
      {
        id: 'roll-wisdom',
        title: 'Roll Wisdom',
        description: 'Roll 2d6 + WIS modifier',
        category: 'dice',
        icon: Eye,
        shortcut: 'W',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollStat('WIS', activeCharacterId, 'Command Palette WIS Roll')
          onClose()
        },
      },
      {
        id: 'roll-charisma',
        title: 'Roll Charisma',
        description: 'Roll 2d6 + CHA modifier',
        category: 'dice',
        icon: Users,
        shortcut: 'H',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollStat('CHA', activeCharacterId, 'Command Palette CHA Roll')
          onClose()
        },
      },

      // Move Roll Commands
      {
        id: 'roll-hack-and-slash',
        title: 'Hack and Slash',
        description: 'Roll STR for melee attack',
        category: 'dice',
        icon: Sword,
        shortcut: 'Shift+Q',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollMove({
            moveId: 'hack-and-slash',
            stat: 'STR',
            characterId: activeCharacterId,
          })
          onClose()
        },
      },
      {
        id: 'roll-defend',
        title: 'Defend',
        description: 'Roll CON to defend',
        category: 'dice',
        icon: Shield,
        shortcut: 'Shift+E',
        action: () => {
          if (!activeCharacterId) {
            notifyMissingCharacter()
            return
          }
          rollMove({
            moveId: 'defend',
            stat: 'CON',
            characterId: activeCharacterId,
          })
          onClose()
        },
      },

      // Utility Commands
      {
        id: 'clear-dice-history',
        title: 'Clear Dice History',
        description: 'Clear all dice roll history',
        category: 'dice',
        icon: Dice6,
        action: () => {
          clearAllHistory()
          onClose()
        },
      },

      // Legacy compatibility
      {
        id: 'roll-constitution-old',
        title: 'Roll + Constitution',
        description: 'Roll 2d6 + Constitution modifier',
        category: 'dice',
        icon: Zap,
        shortcut: '3 (in dice tab)',
        action: () => {
          onAction?.('roll-constitution')
          onNavigate?.('dice')
        },
      },

      // Character Actions
      {
        id: 'heal-character',
        title: 'Heal Character',
        description: 'Restore HP to maximum',
        category: 'character',
        icon: User,
        action: () => onAction?.('heal-character'),
      },
      {
        id: 'rest-character',
        title: 'Take Rest',
        description: 'Character takes a rest to recover',
        category: 'character',
        icon: User,
        action: () => onAction?.('rest-character'),
      },
      {
        id: 'level-up',
        title: 'Level Up',
        description: 'Advance character to next level',
        category: 'character',
        icon: Zap,
        action: () => onAction?.('level-up'),
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
        },
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
        },
      },
    ],
    [
      onNavigate,
      onAction,
      onClose,
      activeCharacterId,
      notifyMissingCharacter,
      rollStat,
      rollMove,
      rollCustom,
      clearAllHistory,
    ],
  )

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands

    const searchQuery = query.toLowerCase()
    return commands.filter(
      (command) =>
        command.title.toLowerCase().includes(searchQuery) ||
        command.description.toLowerCase().includes(searchQuery) ||
        command.category.toLowerCase().includes(searchQuery),
    )
  }, [commands, query])

  const highlightedCommandId = useMemo(() => {
    if (!filteredCommands.length) {
      return null
    }

    if (
      selectedCommandId &&
      filteredCommands.some((command) => command.id === selectedCommandId)
    ) {
      return selectedCommandId
    }

    return filteredCommands[0]?.id ?? null
  }, [filteredCommands, selectedCommandId])

  const activeIndex = useMemo(() => {
    if (!highlightedCommandId) {
      return -1
    }

    return filteredCommands.findIndex(
      (command) => command.id === highlightedCommandId,
    )
  }, [filteredCommands, highlightedCommandId])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault()
          if (!filteredCommands.length) {
            return
          }

          const nextIndex =
            activeIndex < filteredCommands.length - 1 ? activeIndex + 1 : 0
          setSelectedCommandId(filteredCommands[nextIndex]?.id ?? null)
          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          if (!filteredCommands.length) {
            return
          }

          const previousIndex =
            activeIndex > 0 ? activeIndex - 1 : filteredCommands.length - 1
          setSelectedCommandId(filteredCommands[previousIndex]?.id ?? null)
          break
        }
        case 'Enter': {
          event.preventDefault()
          if (!filteredCommands.length) {
            return
          }

          const fallbackIndex = activeIndex >= 0 ? activeIndex : 0
          const command = filteredCommands[fallbackIndex]
          if (command) {
            command.action()
            onClose()
          }
          break
        }
        case 'Escape': {
          event.preventDefault()
          onClose()
          break
        }
        default:
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, filteredCommands, isOpen, onClose])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setQuery('')
        setSelectedCommandId(null)
        onClose()
      }
    },
    [onClose],
  )

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return Command
      case 'dice':
        return Dice6
      case 'character':
        return User
      case 'session':
        return NotebookPen
      default:
        return Zap
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'var(--primary)'
      case 'dice':
        return 'var(--accent)'
      case 'character':
        return 'var(--chart-2)'
      case 'session':
        return 'var(--chart-3)'
      default:
        return 'var(--muted-foreground)'
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            className='fixed top-[20%] left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 rounded-xl border border-border/60 bg-card/95 backdrop-blur shadow-2xl'
            style={{
              borderColor: 'var(--primary)',
              borderOpacity: 0.3,
              backgroundColor: 'var(--card)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Dialog.Title className='sr-only'>Command Palette</Dialog.Title>
            <Dialog.Description className='sr-only'>
              Search commands, navigate Chronicle tabs, and trigger quick
              Dungeon World actions.
            </Dialog.Description>
            {/* Header */}
            <div className='flex items-center gap-3 p-4 border-b border-primary/20'>
              <Search className='text-muted-foreground' size={20} />
              <input
                ref={inputRef}
                type='text'
                placeholder='Search commands...'
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelectedCommandId(null)
                }}
                className='flex-1 bg-transparent text-lg outline-none placeholder-opacity-60'
                style={{
                  color: 'var(--foreground)',
                  '::placeholder': { color: 'var(--muted-foreground)' },
                }}
              />
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <kbd className='px-2 py-1 rounded border border-primary/30'>
                  ↑↓
                </kbd>
                <span>navigate</span>
                <kbd className='px-2 py-1 rounded border border-primary/30'>
                  ↵
                </kbd>
                <span>select</span>
              </div>
            </div>

            {/* Results */}
            <div className='max-h-96 overflow-y-auto'>
              {filteredCommands.length === 0 ? (
                <div className='p-8 text-center text-muted-foreground'>
                  <Search size={32} className='mx-auto mb-3 opacity-50' />
                  <p>No commands found for "{query}"</p>
                </div>
              ) : (
                <div className='p-2'>
                  {filteredCommands.map((command) => {
                    const Icon = command.icon
                    const CategoryIcon = getCategoryIcon(command.category)
                    const isSelected = command.id === highlightedCommandId

                    return (
                      <motion.div
                        key={command.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-transparent ${
                          isSelected
                            ? 'border-primary/40 bg-primary/10 shadow-sm supports-[backdrop-filter]:backdrop-blur-sm'
                            : 'hover:bg-card/80'
                        }`}
                        onClick={() => {
                          command.action()
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedCommandId(command.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          className='w-10 h-10 rounded-lg flex items-center justify-center'
                          style={{
                            backgroundColor: getCategoryColor(command.category),
                            backgroundOpacity: 0.2,
                          }}
                        >
                          <Icon
                            size={18}
                            style={{
                              color: getCategoryColor(command.category),
                            }}
                          />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-medium truncate text-foreground'>
                              {command.title}
                            </h3>
                            <CategoryIcon
                              className='text-muted-foreground'
                              size={12}
                            />
                          </div>
                          <p className='text-sm truncate text-muted-foreground'>
                            {command.description}
                          </p>
                        </div>

                        {command.shortcut && (
                          <div
                            className='text-xs px-2 py-1 rounded border'
                            style={{
                              color: 'var(--muted-foreground)',
                              borderColor: 'var(--primary)',
                              borderOpacity: 0.3,
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
              className='flex items-center justify-between p-3 border-t text-xs'
              style={{
                borderColor: 'var(--primary)',
                borderOpacity: 0.2,
                color: 'var(--muted-foreground)',
              }}
            >
              <div className='flex items-center gap-4'>
                <span>Tip: Use Ctrl+K to open this palette anytime</span>
              </div>
              <div className='flex items-center gap-2'>
                <kbd className='px-2 py-1 rounded border border-primary/30'>
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
