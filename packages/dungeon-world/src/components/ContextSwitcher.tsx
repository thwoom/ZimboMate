import React, { useState, useEffect } from 'react'
import { cn } from '../lib/utils'
import { WorkspaceContext, formatContextLabel, formatContextDescription, formatKeyboardShortcut } from '../types/workspace'
import { 
  PlayIcon,
  BriefcaseIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export interface ContextConfig {
  id: WorkspaceContext
  label: string
  description: string
  icon: React.ReactNode
  shortcut: string
}

const contexts: ContextConfig[] = [
  {
    id: WorkspaceContext.PLAY,
    label: formatContextLabel(WorkspaceContext.PLAY),
    description: formatContextDescription(WorkspaceContext.PLAY),
    icon: <PlayIcon className="w-4 h-4" />,
    shortcut: '1',
  },
  {
    id: WorkspaceContext.PREP,
    label: formatContextLabel(WorkspaceContext.PREP),
    description: formatContextDescription(WorkspaceContext.PREP),
    icon: <BriefcaseIcon className="w-4 h-4" />,
    shortcut: '2',
  },
  {
    id: WorkspaceContext.BUILD,
    label: formatContextLabel(WorkspaceContext.BUILD),
    description: formatContextDescription(WorkspaceContext.BUILD),
    icon: <WrenchScrewdriverIcon className="w-4 h-4" />,
    shortcut: '3',
  },
  {
    id: WorkspaceContext.REFERENCE,
    label: formatContextLabel(WorkspaceContext.REFERENCE),
    description: formatContextDescription(WorkspaceContext.REFERENCE),
    icon: <MagnifyingGlassIcon className="w-4 h-4" />,
    shortcut: '4',
  },
]

interface ContextSwitcherProps {
  activeContext: WorkspaceContext
  onContextChange: (context: WorkspaceContext) => void
  className?: string
}

export function ContextSwitcher({ activeContext, onContextChange, className }: ContextSwitcherProps) {
  const [hoveredContext, setHoveredContext] = useState<WorkspaceContext | null>(null)

  // Keyboard shortcuts for context switching
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return
      }

      // Handle Alt + number shortcuts
      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        const context = contexts.find(c => c.shortcut === event.key)
        if (context) {
          event.preventDefault()
          onContextChange(context.id)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onContextChange])

  return (
    <div className={cn('flex items-center gap-1 p-1 glass rounded-lg', className)}>
      {contexts.map((context) => {
        const isActive = activeContext === context.id
        const isHovered = hoveredContext === context.id
        
        return (
          <button
            key={context.id}
            onClick={() => onContextChange(context.id)}
            onMouseEnter={() => setHoveredContext(context.id)}
            onMouseLeave={() => setHoveredContext(null)}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-base',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isActive
                ? 'bg-primary text-text-inverse shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            )}
            title={`${context.description} (Alt+${context.shortcut})`}
          >
            <span className={cn(
              'transition-colors duration-base',
              isActive ? 'text-text-inverse' : 'text-text-tertiary'
            )}>
              {context.icon}
            </span>
            <span className="hidden sm:inline">{context.label}</span>
            
            {/* Keyboard shortcut indicator */}
            <kbd className={cn(
              'hidden md:inline-flex h-5 w-5 items-center justify-center rounded border text-xs font-mono transition-colors duration-base',
              isActive
                ? 'border-text-inverse/20 text-text-inverse/70'
                : 'border-border text-text-tertiary'
            )}>
              {context.shortcut}
            </kbd>

            {/* Active indicator */}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-text-inverse" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// Hook to manage context state - updated to use WorkspaceContext enum
export function useContext() {
  const [activeContext, setActiveContext] = useState<WorkspaceContext>(() => {
    const stored = localStorage.getItem('dw-active-context')
    return (stored as WorkspaceContext) || WorkspaceContext.PLAY
  })

  const setContext = (context: WorkspaceContext) => {
    setActiveContext(context)
    localStorage.setItem('dw-active-context', context)
  }

  return { activeContext, setContext }
}

// Context configuration for tile visibility and sizing - updated to use WorkspaceContext enum
export const contextConfigs = {
  [WorkspaceContext.PLAY]: {
    visibleTiles: ['hp', 'combat', 'xp', 'attributes', 'status', 'quick-actions'],
    tileSizes: {
      hp: { rows: 2, cols: 2 },
      combat: { rows: 1, cols: 2 },
      xp: { rows: 1, cols: 2 },
      attributes: { rows: 3, cols: 2 },
      status: { rows: 2, cols: 2 },
      'quick-actions': { rows: 1, cols: 4 },
    },
    inspectorVisible: true,
  },
  [WorkspaceContext.PREP]: {
    visibleTiles: ['character-info', 'attributes', 'spells', 'advancement', 'notes'],
    tileSizes: {
      'character-info': { rows: 2, cols: 3 },
      attributes: { rows: 3, cols: 3 },
      spells: { rows: 4, cols: 3 },
      advancement: { rows: 2, cols: 3 },
      notes: { rows: 3, cols: 6 },
    },
    inspectorVisible: true,
  },
  [WorkspaceContext.BUILD]: {
    visibleTiles: ['character-creation', 'class-selection', 'attribute-assignment', 'equipment-setup'],
    tileSizes: {
      'character-creation': { rows: 3, cols: 4 },
      'class-selection': { rows: 2, cols: 2 },
      'attribute-assignment': { rows: 4, cols: 2 },
      'equipment-setup': { rows: 3, cols: 4 },
    },
    inspectorVisible: false,
  },
  [WorkspaceContext.REFERENCE]: {
    visibleTiles: ['moves-library', 'equipment-compendium', 'spells-library', 'rules-reference'],
    tileSizes: {
      'moves-library': { rows: 6, cols: 3 },
      'equipment-compendium': { rows: 6, cols: 3 },
      'spells-library': { rows: 6, cols: 3 },
      'rules-reference': { rows: 6, cols: 3 },
    },
    inspectorVisible: true,
  },
} as const