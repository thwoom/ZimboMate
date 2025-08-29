import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import UnifiedQuickTools from '../components/UnifiedQuickTools';
import { panelEventBus } from '../framework/PanelAPI';
import './MainLayout.css';

interface MainLayoutProps {
  // No longer need drawer props since we're removing the auxiliary drawer
}

const MainLayout: React.FC<MainLayoutProps> = () => {
  const [activePanelId, setActivePanelId] = useState<string>('character-stats');

  // Listen for navigation events from panels
  useEffect(() => {
    const unsubscribe = panelEventBus.on('navigate', (event) => {
      if (event.data.panelId) {
        setActivePanelId(event.data.panelId);
      }
    });

    return unsubscribe;
  }, []);

  // Emit panel activation events for context-aware tools
  useEffect(() => {
    panelEventBus.emit('main-layout', 'panel-activated', {
      panelId: activePanelId
    });
  }, [activePanelId]);

  return (
    <div className="main-layout">
      <aside className="main-layout__sidebar">
        <Sidebar 
          activePanelId={activePanelId}
          onPanelSelect={setActivePanelId}
        />
      </aside>

      <main className="main-layout__content">
        <ContentArea 
          activePanelId={activePanelId}
        />
      </main>

      {/* Unified Quick Tools */}
      <UnifiedQuickTools position="bottom-right" />
    </div>
  );
};

export default MainLayout;
