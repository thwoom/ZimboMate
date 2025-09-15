import React, { useEffect } from 'react'
import { AppShell } from './components/workspace/AppShell'
import { WorkspaceContext } from './types/workspace'
import { GameStoreProvider } from './store/GameStore'
import { initializeTheme } from './lib/utils'
import { commandBus } from './lib/commands/CommandBus'
import { coreCommands } from './lib/commands/coreCommands'
import { panelRegistry } from './framework/PanelRegistry'
import ErrorBoundary from './components/ErrorBoundary'

// Import all existing panels
import CharacterStatsPanel from './panels/CharacterStatsPanel/CharacterStatsPanel'
import MovesPanel from './panels/MovesPanel/MovesPanel'
import EquipmentPanel from './panels/EquipmentPanel/EquipmentPanel'
import { InventoryPanel } from './panels/InventoryPanel'
import { SpellPanel } from './panels/SpellPanel'
import CampaignPanel from './panels/CampaignPanel'
import SessionToolsPanel from './panels/SessionToolsPanel'
import BondTrackerPanel from './panels/BondTrackerPanel/BondTrackerPanel'
import AlignmentXPTrackerPanel from './panels/AlignmentXPTrackerPanel/AlignmentXPTrackerPanel'
import ConditionTrackerPanel from './panels/ConditionTrackerPanel/ConditionTrackerPanel'
import MoveLibraryPanel from './panels/MoveLibraryPanel'
import EquipmentCompendiumPanel from './panels/EquipmentCompendiumPanel/EquipmentCompendiumPanel'
import { ContentStudioPanelInstance } from './panels/ContentStudioPanel/ContentStudioPanel'
import CharacterCreationPanel from './panels/CharacterCreationPanel'
import { SpecialMovesPanel } from './panels/SpecialMovesPanel'
import ConditionalContentSettings from './panels/SettingsPanel/ConditionalContentSettings'
import IntegrationSettings from './panels/SettingsPanel/IntegrationSettings'
import TestPlaygroundPanel from './panels/TestPlayground'
import { createPlaceholderPanel } from './panels/PlaceholderPanel'

import './index.css'

function WorkspaceShellApp() {
  useEffect(() => {
    // Initialize theme system
    initializeTheme()
    
    // Register core commands
    console.log('Registering commands:', coreCommands.length)
    for (const command of coreCommands) {
      console.log('Registering command:', command.id, command.label)
      commandBus.register(command)
    }
    
    // Clear existing panels to prevent duplicates
    panelRegistry.clear()

    // Register all panels
    const panelsToRegister = [
      CharacterStatsPanel,
      MovesPanel,
      EquipmentPanel,
      InventoryPanel,
      SpellPanel,
      CampaignPanel,
      SessionToolsPanel,
      BondTrackerPanel,
      AlignmentXPTrackerPanel,
      ConditionTrackerPanel,
      MoveLibraryPanel,
      EquipmentCompendiumPanel,
      ContentStudioPanelInstance,
      CharacterCreationPanel,
      SpecialMovesPanel,
      ConditionalContentSettings,
      IntegrationSettings,
      TestPlaygroundPanel,
      createPlaceholderPanel('lore-journal', 'Lore & Journal', '📖'),
    ]

    for (const panel of panelsToRegister) {
      try {
        panelRegistry.register(panel)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Panel registration failed:', error)
        }
      }
    }

    // Log registry health
    const healthInfo = panelRegistry.getHealthInfo()
    console.log('Panel Registry Health:', healthInfo)

    return () => {
      panelRegistry.clear()
    }
  }, [])

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error occurred in workspace shell:', error, errorInfo)
        }
      }}
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-text-primary">Application Error</h1>
            <p className="text-text-secondary">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-text-inverse rounded hover:bg-primary-hover transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.warn('GameStore error:', error, errorInfo)
        }}
      >
        <GameStoreProvider>
          <AppShell
            initialContext={WorkspaceContext.PLAY}
            enableKeyboardShortcuts={true}
            enableContextSwitching={true}
            enableInspector={true}
            enableSidebar={true}
            enableCommandPalette={true}
          >
            {/* Additional demo content */}
            <div className="col-span-12 mt-8">
              <div className="glass rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Adaptive Workspace Shell
                </h2>
                <p className="text-text-secondary text-sm">
                  This workspace adapts based on context. Try switching between Play, Prep, Build, and Reference modes.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-text-tertiary">
                  <kbd className="px-2 py-1 bg-surface rounded">Alt+1</kbd>
                  <kbd className="px-2 py-1 bg-surface rounded">Alt+2</kbd>
                  <kbd className="px-2 py-1 bg-surface rounded">Alt+3</kbd>
                  <kbd className="px-2 py-1 bg-surface rounded">Alt+4</kbd>
                  <span className="mx-2">|</span>
                  <kbd className="px-2 py-1 bg-surface rounded">Cmd+K</kbd>
                  <span>Command Palette</span>
                  <span className="mx-2">|</span>
                  <kbd className="px-2 py-1 bg-surface rounded">Cmd+B</kbd>
                  <span>Toggle Sidebar</span>
                  <span className="mx-2">|</span>
                  <kbd className="px-2 py-1 bg-surface rounded">Cmd+I</kbd>
                  <span>Toggle Inspector</span>
                </div>
              </div>
            </div>
          </AppShell>
        </GameStoreProvider>
      </ErrorBoundary>
    </ErrorBoundary>
  )
}

export default WorkspaceShellApp