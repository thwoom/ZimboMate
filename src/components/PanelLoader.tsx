import React from 'react';
import './PanelLoader.css';

interface PanelLoaderProps {
  panelName?: string;
}

export const PanelLoader: React.FC<PanelLoaderProps> = ({ panelName }) => {
  return (
    <div className="panel-loader">
      <div className="panel-loader__spinner"></div>
      <p className="panel-loader__text">
        {panelName ? `Loading ${panelName}...` : 'Loading panel...'}
      </p>
    </div>
  );
};