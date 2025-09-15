import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
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

function WorkspaceShellFixApp() {
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
    <BrowserRouter>
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
              {/* Demo content showing context switching works */}
              <div className="col-span-12 mt-8">
                <div className="glass rounded-lg p-6 text-center space-y-4">
                  <h2 className="text-xl font-semibold text-text-primary mb-2">
                    🎯 Context Switching Fixed!
                  </h2>
                  <p className="text-text-secondary text-sm">
                    The context switching issue has been resolved. The ContextSwitcher now uses the unified WorkspaceContext enum.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="glass-subtle rounded-lg p-4">
                      <h3 className="font-semibold text-text-primary mb-2">🎮 Play Context</h3>
                      <p className="text-sm text-text-secondary">Runtime actions and quick data access</p>
                      <kbd className="mt-2 inline-block px-2 py-1 bg-surface rounded text-xs">Alt+1</kbd>
                    </div>
                    
                    <div className="glass-subtle rounded-lg p-4">
                      <h3 className="font-semibold text-text-primary mb-2">📚 Prep Context</h3>
                      <p className="text-sm text-text-secondary">Character development and planning</p>
                      <kbd className="mt-2 inline-block px-2 py-1 bg-surface rounded text-xs">Alt+2</kbd>
                    </div>
                    
                    <div className="glass-subtle rounded-lg p-4">
                      <h3 className="font-semibold text-text-primary mb-2">🔨 Build Context</h3>
                      <p className="text-sm text-text-secondary">Character creation and editing</p>
                      <kbd className="mt-2 inline-block px-2 py-1 bg-surface rounded text-xs">Alt+3</kbd>
                    </div>
                    
                    <div className="glass-subtle rounded-lg p-4">
                      <h3 className="font-semibold text-text-primary mb-2">🔍 Reference Context</h3>
                      <p className="text-sm text-text-secondary">Rules, moves, and compendiums</p>
                      <kbd className="mt-2 inline-block px-2 py-1 bg-surface rounded text-xs">Alt+4</kbd>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <h3 className="font-semibold text-text-primary mb-3">Additional Features</h3>
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-text-tertiary">
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-surface rounded">Cmd+K</kbd>
                        <span>Command Palette</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-surface rounded">Cmd+B</kbd>
                        <span>Toggle Sidebar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-surface rounded">Cmd+I</kbd>
                        <span>Toggle Inspector</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-success font-medium">
                      ✅ Context switching now works properly with unified WorkspaceContext enum
                    </p>
                  </div>
                </div>
              </div>
            </AppShell>
          </GameStoreProvider>
        </ErrorBoundary>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default WorkspaceShellFixApp