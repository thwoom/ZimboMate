import './PlaceholderPanel.css';

import React from 'react';

import { createPanel, PanelProps } from '../framework/Panel';

const PlaceholderPanel: React.FC < PanelProps> = ({ id }) => {
  return (
    <div className="placeholder-panel">
      <h2>{id.charAt(0).toUpperCase() + id.slice(1)} Panel</h2>
      <p > This panel is under construction.</p>
      <p > Panel ID: {id}</p>
    </div>
  );
};

export const createPlaceholderPanel = (id: string, name: string, icon: string) =>
  createPanel(
    {
      id,
      name,
      icon,
      description: `${name} panel placeholder`,
      priority: 10,
    },
    PlaceholderPanel,
  );



