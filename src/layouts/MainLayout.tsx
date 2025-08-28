import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import AuxiliaryDrawer from './AuxiliaryDrawer';
import './MainLayout.css';

interface MainLayoutProps {
  rightDrawerOpen: boolean;
  onRightDrawerToggle: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  rightDrawerOpen,
  onRightDrawerToggle,
}) => {
  const [activePanelId, setActivePanelId] = useState<string>('character-stats');

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
          onRightDrawerToggle={onRightDrawerToggle} 
        />
      </main>

      <aside
        className={`main-layout__drawer ${rightDrawerOpen ? 'main-layout__drawer--open' : ''}`}
      >
        <AuxiliaryDrawer onClose={onRightDrawerToggle} />
      </aside>
    </div>
  );
};

export default MainLayout;
