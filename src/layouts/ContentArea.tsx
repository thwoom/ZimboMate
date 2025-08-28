import React from 'react';
import { PanelRouter } from '../framework/PanelRouter';
import { panelRegistry } from '../framework/PanelRegistry';
import './ContentArea.css';

interface ContentAreaProps {
  activePanelId: string;
  onRightDrawerToggle: () => void;
}

const ContentArea: React.FC<ContentAreaProps> = ({ activePanelId, onRightDrawerToggle }) => {
  const activePanel = panelRegistry.getPanel(activePanelId);
  const panelTitle = activePanel?.metadata.name || 'Unknown Panel';
  const panelCount = panelRegistry.getAllPanels().length;
  
  return (
    <div className="content-area">
      <header className="content-area__header">
        <h2 className="content-area__title">{panelTitle}</h2>
        <button
          className="content-area__aux-button"
          onClick={onRightDrawerToggle}
          title="Toggle auxiliary drawer"
        >
          <span>☰</span>
        </button>
      </header>

      <div className="content-area__body">
        {panelCount > 0 ? (
          <PanelRouter 
            activePanelId={activePanelId}
            enableTransitions={true}
          />
        ) : (
          <div className="content-area__placeholder">
            <p>No panels registered</p>
            <p>Panels will appear here once they are registered in the system</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentArea;
