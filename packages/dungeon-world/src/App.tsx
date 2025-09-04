import React, { useEffect } from 'react'

import DarkModeToggle from './components/DarkModeToggle'

import ErrorBoundary from './components/ErrorBoundary'
import { panelRegistry } from './framework/PanelRegistry'
import MainLayout from './layouts/MainLayout'
import AlignmentXPTrackerPanel from './panels/AlignmentXPTrackerPanel/AlignmentXPTrackerPanel'
import BondTrackerPanel from './panels/BondTrackerPanel/BondTrackerPanel'
import CampaignPanel from './panels/CampaignPanel'
import CharacterCreationPanel from './panels/CharacterCreationPanel'
import CharacterStatsPanel from './panels/CharacterStatsPanel'
import ConditionTrackerPanel from './panels/ConditionTrackerPanel/ConditionTrackerPanel'
import { ContentStudioPanelInstance } from './panels/ContentStudioPanel/ContentStudioPanel'
import EquipmentCompendiumPanel from './panels/EquipmentCompendiumPanel/EquipmentCompendiumPanel'
import EquipmentPanel from './panels/EquipmentPanel'
import { InventoryPanel } from './panels/InventoryPanel'
import MoveLibraryPanel from './panels/MoveLibraryPanel'
import MovesPanel from './panels/MovesPanel'
import ConditionalContentSettings from './panels/SettingsPanel/ConditionalContentSettings'
import { createPlaceholderPanel } from './panels/PlaceholderPanel'
import { SpecialMovesPanel } from './panels/SpecialMovesPanel'
import { SpellPanel } from './panels/SpellPanel'
import TestPlaygroundPanel from './panels/TestPlayground'
import { GameStoreProvider } from './store/GameStore'
import { panelDiagnostics } from './utils/panelDiagnostics'
import { panelRecoveryManager } from './utils/panelRecovery'
// import { PanelDebugger, testPanel } from './debug/PanelDebugger';
import './App.css'

function App() {
  useEffect(() => {
    // Initialize recovery and diagnostic tools (only when debug mode is enabled)
    // To enable: localStorage.setItem('zimbomate-debug-mode', 'true')
    panelRecoveryManager.injectRecoveryTools()
    panelDiagnostics.injectDiagnosticTools()

    // Clear unknown existing panels first to prevent duplicates
    panelRegistry.clear()

    // Register panels with error handling
    const panelsToRegister = [
      CharacterCreationPanel,
      CharacterStatsPanel,
      EquipmentPanel,
      MovesPanel,
      ConditionalContentSettings,
      SpellPanel,
      SpecialMovesPanel,
      CampaignPanel,
      TestPlaygroundPanel,
      MoveLibraryPanel,
      ContentStudioPanelInstance,
      EquipmentCompendiumPanel,
      // Bond & Alignment XP Tracker panels
      BondTrackerPanel,
      AlignmentXPTrackerPanel,
      // Condition Tracker panel
      ConditionTrackerPanel,
      // Register actual panels
      InventoryPanel,
      // Register placeholder panels for testing
      createPlaceholderPanel('session-tools', 'Session Tools', '🎲'),
      createPlaceholderPanel('lore-journal', 'Lore & Journal', '📖'),
    ]

    for (const [index, panel] of panelsToRegister.entries()) {
      try {
        panelRegistry.register(panel)
      }
      catch (error) {
        // In development, provide recovery option
        if (process.env.NODE_ENV === 'development') {
          console.warn('Panel registration failed:', error)
        }
      }
    }

    // Log registry health after registration
    const _healthInfo = panelRegistry.getHealthInfo()
    // Check for registration errors
    const registrationErrors = panelRegistry.getRegistrationErrors()
    if (registrationErrors.length > 0) {
      console.warn('Registration errors found:', registrationErrors)
    }

    // Run diagnostics after registration
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        const diagnostics = panelDiagnostics.runDiagnostics()
        if (diagnostics.issues.length > 0) {
          console.warn('Diagnostics found issues, attempting automatic repair...')
        }
      }, 1000)
    }

    return () => {
      // Clean up on unmount
      panelRegistry.clear()
    }
  }, []) // Empty dependency array ensures this only runs once

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling-could send to analytics service
        // In development, provide recovery options
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error occurred, attempting recovery...')
        }
      }}
    >
      <GameStoreProvider>
        <div className="app">
          <DarkModeToggle />
          <MainLayout />
          {/* <PanelDebugger /> */}
        </div>
      </GameStoreProvider>
    </ErrorBoundary>
  )
}

export default App
