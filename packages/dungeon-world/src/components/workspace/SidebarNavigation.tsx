import React, { useState } from 'react'
import { 
  StarIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { Button } from '../ui/Button'
import { WorkspaceContext, SidebarState, formatPanelName } from '../../types/workspace'
import { cn } from '../../lib/utils'

export interface PanelMetadata {
  id: string
  name: string
  icon: string
  description?: string
  priority?: number
  preload?: boolean
}

export interface SidebarNavigationProps {
  isOpen: boolean
  sidebarState: SidebarState
  activePanelId: string
  favoritesPanelIds: string[]
  recentPanelIds: string[]
  availablePanels: PanelMetadata[]
  onPanelSelect: (panelId: string) => void
  onToggleFavorite: (panelId: string) => void
  activeContext: WorkspaceContext
  onToggleSidebar: () => void
}

export function SidebarNavigation({
  isOpen,
  sidebarState,
  activePanelId,
  favoritesPanelIds,
  recentPanelIds,
  availablePanels,
  onPanelSelect,
  onToggleFavorite,
  activeContext,
  onToggleSidebar
}: SidebarNavigationProps) {
  const [activeSection, setActiveSection] = useState<'favorites' | 'recent' | 'all'>('favorites')
  
  const isCollapsed = sidebarState === SidebarState.COLLAPSED
  
  const favoritesPanels = availablePanels.filter(panel => favoritesPanelIds.includes(panel.id))
  const recentPanels = availablePanels.filter(panel => recentPanelIds.includes(panel.id))
  
  const contextPanels = getContextPanels(activeContext, availablePanels)
  
  const renderPanelItem = (panel: PanelMetadata) => {
    const isActive = activePanelId === panel.id
    const isFavorite = favoritesPanelIds.includes(panel.id)
    
    return (
      <div
        key={panel.id}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors cursor-pointer",
          isActive 
            ? "bg-primary text-text-inverse" 
            : "hover:bg-surface-hover text-text-secondary hover:text-text-primary"
        )}
        onClick={() => onPanelSelect(panel.id)}
        title={isCollapsed ? panel.name : panel.description}
      >
        <span className="text-lg flex-shrink-0" role="img" aria-label={panel.name}>
          {panel.icon}
        </span>
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{formatPanelName(panel.id)}</span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                isFavorite && "opacity-100 text-warning"
              )}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(panel.id)
              }}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <StarIcon className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onToggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full border-r border-border/50 glass-subtle transition-all duration-300 md:relative md:z-auto",
        isCollapsed ? "w-16" : "w-72",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
            {!isCollapsed && (
              <h2 className="text-sm font-medium text-text-primary">
                Panel Switcher
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-8 w-8"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="h-4 w-4" />
              ) : (
                <ChevronLeftIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {!isCollapsed && (
              <div className="mb-4">
                <div className="flex gap-1 rounded-lg bg-surface p-1">
                  {[
                    { key: 'favorites' as const, label: 'Favorites', icon: StarIcon },
                    { key: 'recent' as const, label: 'Recent', icon: CalendarDaysIcon },
                    { key: 'all' as const, label: 'All', icon: null }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                        activeSection === key
                          ? "bg-primary text-text-inverse"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                      )}
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              {activeSection === 'favorites' && favoritesPanels.map(renderPanelItem)}
              {activeSection === 'recent' && recentPanels.map(renderPanelItem)}
              {activeSection === 'all' && contextPanels.map(renderPanelItem)}
              {isCollapsed && favoritesPanels.slice(0, 8).map(renderPanelItem)}
            </div>
            
            {!isCollapsed && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="text-xs text-text-tertiary mb-2">
                  Context: {activeContext.charAt(0).toUpperCase() + activeContext.slice(1)}
                </div>
                <div className="text-xs text-text-tertiary">
                  {contextPanels.length} panels available
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

function getContextPanels(context: WorkspaceContext, allPanels: PanelMetadata[]): PanelMetadata[] {
  const contextConfigs = {
    [WorkspaceContext.PLAY]: ['character-stats', 'moves', 'equipment', 'session-tools'],
    [WorkspaceContext.PREP]: ['character-stats', 'spells', 'inventory', 'bond-tracker', 'alignment-xp-tracker'],
    [WorkspaceContext.BUILD]: ['character-creation', 'move-library', 'equipment-compendium'],
    [WorkspaceContext.REFERENCE]: ['move-library', 'equipment-compendium', 'content-studio', 'special-moves']
  }
  
  const contextPanelIds = contextConfigs[context] || []
  const contextPanels = allPanels.filter(panel => contextPanelIds.includes(panel.id))
  const otherPanels = allPanels.filter(panel => !contextPanelIds.includes(panel.id))
  
  return [...contextPanels, ...otherPanels]
}