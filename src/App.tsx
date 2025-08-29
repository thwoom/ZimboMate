import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import { panelRegistry } from './framework/PanelRegistry';
import { GameStoreProvider } from './store/GameStore';
import CharacterStatsPanel from './panels/CharacterStatsPanel';
import EquipmentPanel from './panels/EquipmentPanel';
import MovesPanel from './panels/MovesPanel';
import TestPlaygroundPanel from './panels/TestPlayground';
import CharacterCreationPanel from './panels/CharacterCreationPanel';
import { createPlaceholderPanel } from './panels/PlaceholderPanel';
import DarkModeToggle from './components/DarkModeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {

  useEffect(() => {
    // Clear any existing panels first to prevent duplicates
    panelRegistry.clear();
    
    // Register panels
    panelRegistry.register(CharacterCreationPanel);
    panelRegistry.register(CharacterStatsPanel);
    panelRegistry.register(EquipmentPanel);
    panelRegistry.register(MovesPanel);
    panelRegistry.register(TestPlaygroundPanel);
    
    // Register placeholder panels for testing
    panelRegistry.register(createPlaceholderPanel('inventory', 'Inventory', '🎒'));
    panelRegistry.register(createPlaceholderPanel('session-tools', 'Session Tools', '🎲'));
    panelRegistry.register(createPlaceholderPanel('lore-journal', 'Lore / Journal', '📖'));
    
    return () => {
      // Clean up on unmount
      panelRegistry.clear();
    };
  }, []); // Empty dependency array ensures this only runs once

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling - could send to analytics service
        console.error('App Error Boundary caught error:', error, errorInfo);
      }}
    >
      <GameStoreProvider>
        <div className="app">
          <DarkModeToggle />
          <MainLayout />
        </div>
      </GameStoreProvider>
    </ErrorBoundary>
  );
}

export default App;
