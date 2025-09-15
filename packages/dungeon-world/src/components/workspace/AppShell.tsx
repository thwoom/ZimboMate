import React, { useEffect } from 'react'
import { GlobalHeader } from './GlobalHeader'
import { SidebarNavigation } from './SidebarNavigation'
import { InspectorPanel } from './InspectorPanel'
import { ResponsiveGrid } from './ResponsiveGrid'
import { PanelWrapper } from './PanelWrapper'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useCommandPalette } from '../../lib/hooks/useCommandPalette'
import { CommandPalette } from '../CommandPalette'
import { panelRegistry } from '../../framework/PanelRegistry'
import { WorkspaceContext, SidebarState, InspectorState } from '../../types/workspace'
import { cn } from '../../lib/utils'

export interface AppShellProps {
  children?: React.ReactNode
  initialContext?: WorkspaceContext
  enableKeyboardShortcuts?: boolean
  enableContextSwitching?: boolean
  enableInspector?: boolean
  enableSidebar?: boolean
  enableCommandPalette?: boolean
}

export function AppShell({
  children,
  initialContext = WorkspaceContext.PLAY,
  enableKeyboardShortcuts = true,
  enableContextSwitching = true,
  enableInspector = true,
  enableSidebar = true,
  enableCommandPalette = true
}: AppShellProps) {
  const workspace = useWorkspace()
  const { isOpen: commandPaletteOpen, setIsOpen: setCommandPaletteOpen } = useCommandPalette()

  // Initialize context if provided
  useEffect(() => {
    if (initialContext && workspace.activeContext !== initialContext) {
      workspace.setActiveContext(initialContext)
    }
  }, [initialContext, workspace])

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

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

      // Command palette
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        if (enableCommandPalette) {
          setCommandPaletteOpen(!commandPaletteOpen)
        }
        return
      }

      // Context switching with Alt + number
      if (enableContextSwitching && event.altKey && !event.ctrlKey && !event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            workspace.setActiveContext(WorkspaceContext.PLAY)
            break
          case '2':
            event.preventDefault()
            workspace.setActiveContext(WorkspaceContext.PREP)
            break
          case '3':
            event.preventDefault()
            workspace.setActiveContext(WorkspaceContext.BUILD)
            break
          case '4':
            event.preventDefault()
            workspace.setActiveContext(WorkspaceContext.REFERENCE)
            break
        }
      }

      // Inspector toggle
      if (enableInspector && event.key === 'i' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        workspace.toggleInspector()
      }

      // Sidebar toggle
      if (enableSidebar && event.key === 'b' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        workspace.toggleSidebar()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    enableKeyboardShortcuts,
    enableContextSwitching,
    enableInspector,
    enableSidebar,
    enableCommandPalette,
    commandPaletteOpen,
    setCommandPaletteOpen,
    workspace
  ])

  // Get available panels from registry
  const availablePanels = panelRegistry.getAllPanelMetadata()

  // Get current panel component
  const currentPanel = panelRegistry.getPanel(workspace.activePanelId)

  const sidebarOpen = workspace.sidebarState !== SidebarState.HIDDEN
  const inspectorOpen = workspace.inspectorState === InspectorState.OPEN && enableInspector

  return (
    <div className="min-h-screen bg-background workspace-shell" data-context={workspace.activeContext}>
      {/* Global Header */}
      <GlobalHeader
        activeContext={workspace.activeContext}
        onContextChange={enableContextSwitching ? workspace.setActiveContext : () => {}}
        inspectorOpen={inspectorOpen}
        onInspectorToggle={enableInspector ? workspace.toggleInspector : () => {}}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={enableSidebar ? workspace.toggleSidebar : () => {}}
        commandPaletteOpen={commandPaletteOpen}
        onCommandPaletteToggle={enableCommandPalette ? () => setCommandPaletteOpen(!commandPaletteOpen) : () => {}}
      />

      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        {enableSidebar && (
          <SidebarNavigation
            isOpen={sidebarOpen}
            sidebarState={workspace.sidebarState}
            activePanelId={workspace.activePanelId}
            favoritesPanelIds={workspace.favoritesPanelIds}
            recentPanelIds={workspace.recentPanelIds}
            availablePanels={availablePanels}
            onPanelSelect={workspace.setActivePanelId}
            onToggleFavorite={workspace.toggleFavorite}
            activeContext={workspace.activeContext}
            onToggleSidebar={workspace.toggleSidebar}
          />
        )}

        {/* Main Content Area */}
        <ResponsiveGrid
          context={workspace.activeContext}
          activePanelId={workspace.activePanelId}
          inspectorOpen={inspectorOpen}
        >
          {currentPanel ? (
            <PanelWrapper
              panelId={workspace.activePanelId}
              isActive={true}
              className="h-full"
            >
              <currentPanel.component
                id={workspace.activePanelId}
                isActive={true}
                onStateChange={() => {}}
              />
            </PanelWrapper>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="text-text-secondary text-lg">
                  Panel not found
                </div>
                <div className="text-text-tertiary text-sm">
                  The panel "{workspace.activePanelId}" is not available.
                </div>
              </div>
            </div>
          )}
          
          {/* Additional children content */}
          {children}
        </ResponsiveGrid>

        {/* Inspector Panel */}
        {enableInspector && (
          <InspectorPanel
            isOpen={inspectorOpen}
            inspectorState={workspace.inspectorState}
            context={workspace.activeContext}
            activePanelId={workspace.activePanelId}
            onClose={workspace.toggleInspector}
          />
        )}
      </div>

      {/* Command Palette */}
      {enableCommandPalette && (
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
        />
      )}
    </div>
  )
}