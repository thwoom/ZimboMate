import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import { panelRegistry } from './framework/PanelRegistry';
import { GameStoreProvider } from './store/GameStore';
import CharacterStatsPanel from './panels/CharacterStatsPanel';
import EquipmentPanel from './panels/EquipmentPanel';
import TestPlaygroundPanel from './panels/TestPlayground';
import CharacterCreationPanel from './panels/CharacterCreationPanel';
import { createPlaceholderPanel } from './panels/PlaceholderPanel';
import './App.css';

function App() {
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true); // Open by default

  useEffect(() => {
    // Register panels
    panelRegistry.register(CharacterCreationPanel);
    panelRegistry.register(CharacterStatsPanel);
    panelRegistry.register(EquipmentPanel);
    panelRegistry.register(TestPlaygroundPanel);
    
    // Register placeholder panels for testing
    panelRegistry.register(createPlaceholderPanel('inventory', 'Inventory', '🎒'));
    panelRegistry.register(createPlaceholderPanel('moves', 'Moves', '📜'));
    panelRegistry.register(createPlaceholderPanel('session-tools', 'Session Tools', '🎲'));
    panelRegistry.register(createPlaceholderPanel('lore-journal', 'Lore / Journal', '📖'));
    
    return () => {
      // Clean up on unmount
      panelRegistry.clear();
    };
  }, []);

  return (
    <GameStoreProvider>
      <div className="app">
        <MainLayout
          rightDrawerOpen={rightDrawerOpen}
          onRightDrawerToggle={() => setRightDrawerOpen(!rightDrawerOpen)}
        />
      </div>
    </GameStoreProvider>
  );
}

export default App;
