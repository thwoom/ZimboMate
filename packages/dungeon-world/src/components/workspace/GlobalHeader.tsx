import React from 'react'
import { 
  Bars3Icon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Button } from '../ui/Button'
import { ContextSwitcher } from '../ContextSwitcher'
import { WorkspaceContext } from '../../types/workspace'
import { cn } from '../../lib/utils'

export interface GlobalHeaderProps {
  activeContext: WorkspaceContext
  onContextChange: (context: WorkspaceContext) => void
  inspectorOpen: boolean
  onInspectorToggle: () => void
  sidebarOpen: boolean
  onSidebarToggle: () => void
  commandPaletteOpen: boolean
  onCommandPaletteToggle: () => void
}

export function GlobalHeader({
  activeContext,
  onContextChange,
  inspectorOpen,
  onInspectorToggle,
  sidebarOpen,
  onSidebarToggle,
  commandPaletteOpen,
  onCommandPaletteToggle
}: GlobalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 glass-subtle">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="md:hidden"
            title="Toggle Sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-text-primary">
              Dungeon World
            </h1>
            <div className="hidden text-xs text-text-tertiary md:block">
              Game Master Tools
            </div>
          </div>
          
          <div className="hidden md:block">
            <ContextSwitcher
              activeContext={activeContext}
              onContextChange={onContextChange}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCommandPaletteToggle}
            className="hidden gap-2 md:flex"
            title="Open Command Palette (Cmd+K)"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span className="text-sm">Search</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-surface px-1.5 font-mono text-xs font-medium text-text-secondary opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onInspectorToggle}
            className={cn(
              "transition-colors",
              inspectorOpen && "bg-surface-hover text-text-primary"
            )}
            title="Toggle Inspector"
          >
            <InformationCircleIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile context switcher */}
      <div className="border-t border-border/50 px-6 py-3 md:hidden">
        <ContextSwitcher
          activeContext={activeContext}
          onContextChange={onContextChange}
          className="w-full"
        />
      </div>
    </header>
  )
}