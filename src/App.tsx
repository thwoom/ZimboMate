import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import { panelRegistry } from './framework/PanelRegistry';
import { GameStoreProvider } from './store/GameStore';
import { lazyPanels } from './framework/lazyPanels';
import { createPlaceholderPanel } from './panels/PlaceholderPanel';
import DarkModeToggle from './components/DarkModeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {

  useEffect(() => {
    // Clear any existing panels first to prevent duplicates
    panelRegistry.clear();
    
    // Register lazy-loaded panels for code splitting
    panelRegistry.registerLazy(lazyPanels.characterCreation);
    panelRegistry.registerLazy(lazyPanels.characterStats);
    panelRegistry.registerLazy(lazyPanels.equipment);
    panelRegistry.registerLazy(lazyPanels.moves);
    panelRegistry.registerLazy(lazyPanels.testPlayground);
    
    // Register placeholder panels for testing (these are small, no need to lazy load)
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
