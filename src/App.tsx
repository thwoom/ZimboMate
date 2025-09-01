import React, { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import { panelRegistry } from './framework/PanelRegistry';
import { GameStoreProvider } from './store/GameStore';
import CharacterStatsPanel from './panels/CharacterStatsPanel';
import EquipmentPanel from './panels/EquipmentPanel';
import MovesPanel from './panels/MovesPanel';
import { SpellPanel } from './panels/SpellPanel';
import { SpecialMovesPanel } from './panels/SpecialMovesPanel';
import CampaignPanel from './panels/CampaignPanel';
import TestPlaygroundPanel from './panels/TestPlayground';
import CharacterCreationPanel from './panels/CharacterCreationPanel';
import MoveLibraryPanel from './panels/MoveLibraryPanel';
import { ContentStudioPanelInstance } from './panels/ContentStudioPanel/ContentStudioPanel';
import { createPlaceholderPanel } from './panels/PlaceholderPanel';
import BondTrackerPanel from './panels/BondTrackerPanel/BondTrackerPanel';
import AlignmentXPTrackerPanel from './panels/AlignmentXPTrackerPanel/AlignmentXPTrackerPanel';
import ConditionTrackerPanel from './panels/ConditionTrackerPanel/ConditionTrackerPanel';
import { InventoryPanel } from './panels/InventoryPanel';
import DarkModeToggle from './components/DarkModeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import { panelRecoveryManager } from './utils/panelRecovery';
import { panelDiagnostics } from './utils/panelDiagnostics';
// import { PanelDebugger, testPanel } from './debug/PanelDebugger';
import './App.css';

function App() {

  useEffect(() => {
    // Initialize recovery and diagnostic tools in development
    if (process.env.NODE_ENV === 'development') {
      panelRecoveryManager.injectRecoveryTools();
      panelDiagnostics.injectDiagnosticTools();
    }

    // Clear unknown existing panels first to prevent duplicates
    panelRegistry.clear();

    // Register panels with error handling
    const panelsToRegister = [
      CharacterCreationPanel,
      CharacterStatsPanel,
      EquipmentPanel,
      MovesPanel,
      SpellPanel,
      SpecialMovesPanel,
      CampaignPanel,
      TestPlaygroundPanel,
      MoveLibraryPanel,
      ContentStudioPanelInstance,
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
    ];

    panelsToRegister.forEach((panel, index) => {
      try {
        panelRegistry.register(panel);
      } catch (error) {
        // In development, provide recovery option
        if (process.env.NODE_ENV === 'development') {
          console.warn('Panel registration failed:', error);
        }
      }
    });

    // Log registry health after registration
    const healthInfo = panelRegistry.getHealthInfo();
    // Check for registration errors
    const registrationErrors = panelRegistry.getRegistrationErrors();
    if (registrationErrors.length > 0) {
      console.warn('Registration errors found:', registrationErrors);
    }

    // Run diagnostics after registration
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        const diagnostics = panelDiagnostics.runDiagnostics();
        if (diagnostics.issues.length > 0) {
          console.warn('Diagnostics found issues, attempting automatic repair...');
        }
      }, 1000);
    }

    return () => {
      // Clean up on unmount
      panelRegistry.clear();
    };
  }, []); // Empty dependency array ensures this only runs once

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling-could send to analytics service
        // In development, provide recovery options
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error occurred, attempting recovery...');
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
  );
}

export default App;
