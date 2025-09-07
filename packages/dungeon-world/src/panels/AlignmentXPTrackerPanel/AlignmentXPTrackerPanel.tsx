import type { PanelProps } from '../../framework/Panel'

import type { AlignmentAction } from '../../types/XP'
import React from 'react'
import { AlignmentXPTracker } from '../../components/AlignmentXPTracker'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI } from '../../framework/PanelAPI'
import { useCharacter } from '../../store/GameStore'
import './AlignmentXPTrackerPanel.css'
import { HUDFrame } from '../../components/ui/HUDFrame'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { motion, useReducedMotion } from 'framer-motion'
import { getVariant } from '../../utils/motion'

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
    <motion.div initial={useReducedMotion() ? false : 'hidden'} animate={useReducedMotion() ? undefined : 'visible'} variants={getVariant('fade')}>
      <HUDFrame className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>⚖️ Alignment XP Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[--color-muted-foreground] mb-3">
              Log alignment-based actions and earn XP through roleplay
            </p>
            <AlignmentXPTracker
              characterId={currentCharacter?.id}
              onAlignmentAction={handleAlignmentAction}
            />
          </CardContent>
        </Card>
      </HUDFrame>
    </motion.div>
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
