import React from 'react'
import { WorkspaceContext } from '../../types/workspace'
import { cn } from '../../lib/utils'

export interface ResponsiveGridProps {
  context: WorkspaceContext
  activePanelId: string
  children: React.ReactNode
  inspectorOpen: boolean
}

export function ResponsiveGrid({
  context,
  activePanelId,
  children,
  inspectorOpen
}: ResponsiveGridProps) {
  const getGridClasses = () => {
    const baseClasses = "flex-1 transition-all duration-300"
    
    switch (context) {
      case WorkspaceContext.PLAY:
        return cn(
          baseClasses,
          "p-6",
          inspectorOpen ? "mr-80" : ""
        )
        
      case WorkspaceContext.PREP:
        return cn(
          baseClasses,
          "p-6",
          inspectorOpen ? "mr-80" : ""
        )
        
      case WorkspaceContext.BUILD:
        return cn(
          baseClasses,
          "p-8"
          // No inspector in build mode
        )
        
      case WorkspaceContext.REFERENCE:
        return cn(
          baseClasses,
          "p-6",
          inspectorOpen ? "mr-80" : ""
        )
        
      default:
        return cn(
          baseClasses,
          "p-6"
        )
    }
  }

  const getContentClasses = () => {
    switch (context) {
      case WorkspaceContext.PLAY:
        return "grid grid-cols-12 gap-4 auto-rows-[4rem] max-w-7xl mx-auto"
        
      case WorkspaceContext.PREP:
        return "grid grid-cols-12 gap-6 auto-rows-[4rem] max-w-7xl mx-auto"
        
      case WorkspaceContext.BUILD:
        return "max-w-4xl mx-auto space-y-8"
        
      case WorkspaceContext.REFERENCE:
        return "grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto"
        
      default:
        return "max-w-7xl mx-auto"
    }
  }

  return (
    <main className={getGridClasses()} data-context={context} data-panel={activePanelId}>
      <div className={getContentClasses()}>
        {children}
      </div>
    </main>
  )
}