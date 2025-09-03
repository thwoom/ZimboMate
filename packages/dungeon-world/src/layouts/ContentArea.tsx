import './ContentArea.css';

import React from 'react';

import { panelRegistry } from '../framework/PanelRegistry';
import { PanelRouter } from '../framework/PanelRouter';

interface ContentAreaProps {
  activePanelId: string;
}

const ContentArea: React.FC < ContentAreaProps> = ({ activePanelId }) => {
  const activePanel = panelRegistry.getPanel(activePanelId);
  const panelTitle = activePanel?.metadata.name || 'Unknown Panel';
  const panelCount = panelRegistry.getAllPanels().length;

  // Debug logging (commented out)
  // // Debug: Log when character creation is active
  if (process.env.NODE_ENV === 'development' && activePanelId === 'character-creation') {
    }

  // Debug function to toggle layout visualization
  const toggleLayoutDebug = () => {
    document.body.classList.toggle('debug-layout');
  };

  return (
    <div className="content-area">
      <header className="content-area__header">
        <h2 className="content-area__title">{panelTitle}</h2>
        {process.env.NODE_ENV === 'development' && activePanelId === 'character-creation' && (
          <button
            onClick={toggleLayoutDebug}
            title="Toggle layout debug visualization"
            className="content-area__debug-button"
          >
            🔍 Debug Layout
          </button>
        )}
      </header>

      <div className={`content-area__body ${activePanelId === 'character-creation' ? 'content-area__body--full-width' : ''}`}>
        {panelCount > 0 ? (
          <PanelRouter
            activePanelId={activePanelId}
            enableTransitions={true}
          />
        ) : (
          <div className="content-area__placeholder">
            <p > No panels registered</p>
            <p > Panels will appear here once they are registered in the system</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentArea;



