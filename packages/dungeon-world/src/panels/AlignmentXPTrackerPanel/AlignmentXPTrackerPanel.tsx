import type { PanelProps } from '../../framework/Panel'

import type { AlignmentAction } from '../../types/XP'
import React from 'react'
import { AlignmentXPTracker } from '../../components/AlignmentXPTracker'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI } from '../../framework/PanelAPI'
import { useCharacter } from '../../store/GameStore'
import './AlignmentXPTrackerPanel.css'

const id = 'alignment-xp-tracker'

const api = createPanelAPI(id)

const AlignmentXPTrackerPanelComponent: React.FC <PanelProps> = ({ isActive, onStateChange }) => {
  const currentCharacter = useCharacter()

  const handleAlignmentAction = (action: AlignmentAction) => {
    // Notify the game system that XP was gained from alignment action
    // You could integrate this with your XP system here
    // For example: xpService.addXP(currentCharacter.id, action.xpAmount, 'alignment_action');

    // Update panel state if needed
    if (onStateChange) {
      onStateChange({ lastAlignmentAction: action.id, xpGained: action.xpAmount })
    }
  }

  return (
    <div className="alignment-xp-tracker-panel">
      <div className="alignment-xp-tracker-panel__header">
        <h2>⚖️ Alignment XP Tracker</h2>
        <p className="alignment-xp-tracker-panel__subtitle">
          Log alignment-based actions and earn XP through roleplay
        </p>
      </div>

      <div className="alignment-xp-tracker-panel__content">
        <AlignmentXPTracker
          characterId={currentCharacter?.id}
          onAlignmentAction={handleAlignmentAction}
        />
      </div>
    </div>
  )
}

const alignmentXPTrackerPanelConfig = createPanel(
  {
    id,
    name: 'Alignment XP Tracker',
    description: 'Track alignment actions and earn XP through roleplay',
    icon: '⚖️',
    priority: 35,
    preload: true,
  },
  AlignmentXPTrackerPanelComponent,
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
)

export default alignmentXPTrackerPanelConfig
