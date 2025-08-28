import React, { useState, useEffect } from 'react';
import { panelRegistry } from '../framework/PanelRegistry';
import { PanelMetadata } from '../framework/Panel';
import './Sidebar.css';

interface SidebarProps {
  activePanelId?: string;
  onPanelSelect?: (panelId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanelId, onPanelSelect }) => {
  const [panels, setPanels] = useState<PanelMetadata[]>([]);

  useEffect(() => {
    // Get initial panels sorted by priority
    const sortedPanels = panelRegistry.getPanelsByPriority().map(p => p.metadata);
    setPanels(sortedPanels);

    // Listen for registry changes
    const unsubscribe = panelRegistry.addListener(() => {
      const sortedPanels = panelRegistry.getPanelsByPriority().map(p => p.metadata);
      setPanels(sortedPanels);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">Dungeon World</h1>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__nav-list">
          {panels.map((panel) => (
            <li key={panel.id} className="sidebar__nav-item">
              <button
                className={`sidebar__nav-button ${
                  activePanelId === panel.id ? 'sidebar__nav-button--active' : ''
                }`}
                onClick={() => onPanelSelect?.(panel.id)}
              >
                <span className="sidebar__nav-icon">{panel.icon}</span>
                <span className="sidebar__nav-text">{panel.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__settings-button">
          <span className="sidebar__nav-icon">⚙️</span>
          <span className="sidebar__nav-text">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
