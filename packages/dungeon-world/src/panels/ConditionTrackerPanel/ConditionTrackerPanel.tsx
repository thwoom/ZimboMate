import './ConditionTrackerPanel.css';

import React from 'react';
import { ConditionTracker } from '../../components/ConditionTracker';
import { createPanel, PanelProps } from '../../framework/Panel';
import { createPanelAPI } from '../../framework/PanelAPI';
import { useCharacter } from '../../store/GameStore';

const _id = 'condition-tracker';

const _api = createPanelAPI(_id);

const ConditionTrackerPanelComponent: React.FC < PanelProps> = ({ isActive, onStateChange }) => {
  const currentCharacter = useCharacter();

  const handleConditionResolved = (conditionId: string) => {
    // Notify the game system that a condition was resolved
    // You could integrate this with your game system here
    // For example: gameService.onConditionResolved(currentCharacter.id, conditionId);

    // Update panel state if needed
    if (onStateChange) {
      onStateChange({ lastConditionResolved: conditionId, resolvedAt: new Date() });
    }
  };

  return (
    <div className="condition-tracker-panel">
      <div className="condition-tracker-panel__header">
        <h2>🎭 Condition Tracker</h2>
        <p className="condition-tracker-panel__subtitle">
          Track debilities, ongoing effects, and temporary conditions
        </p>
      </div>

      <div className="condition-tracker-panel__content">
        <ConditionTracker
          characterId={currentCharacter?.id}
          onConditionResolved={handleConditionResolved}
        />
      </div>
    </div>
  );
};

const conditionTrackerPanelConfig = createPanel(
  {
    id: _id,
    name: 'Condition Tracker',
    description: 'Track debilities, ongoing effects, and temporary conditions',
    icon: '🎭',
    priority: 25,
    preload: true,
  },
  ConditionTrackerPanelComponent,
  {
    onMount: () => {
      },
    onUnmount: () => {
      },
    onActivate: () => {
      },
    onDeactivate: () => {
      },
  },
);

export default conditionTrackerPanelConfig;




