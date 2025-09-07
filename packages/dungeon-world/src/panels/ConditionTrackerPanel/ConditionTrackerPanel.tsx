import type { PanelProps } from '../../framework/Panel'

import React from 'react'
import { ConditionTracker } from '../../components/ConditionTracker'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI } from '../../framework/PanelAPI'
import { useCharacter } from '../../store/GameStore'
import './ConditionTrackerPanel.css'
import { HUDFrame } from '../../components/ui/HUDFrame'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { motion, useReducedMotion } from 'framer-motion'
import { getVariant } from '../../utils/motion'

const _id = 'condition-tracker'

const _api = createPanelAPI(_id)

const ConditionTrackerPanelComponent: React.FC <PanelProps> = ({ isActive, onStateChange }) => {
  const currentCharacter = useCharacter()

  const handleConditionResolved = (conditionId: string) => {
    // Notify the game system that a condition was resolved
    // You could integrate this with your game system here
    // For example: gameService.onConditionResolved(currentCharacter.id, conditionId);

    // Update panel state if needed
    if (onStateChange) {
      onStateChange({ lastConditionResolved: conditionId, resolvedAt: new Date() })
    }
  }

  return (
    <motion.div initial={useReducedMotion() ? false : 'hidden'} animate={useReducedMotion() ? undefined : 'visible'} variants={getVariant('fade')}>
      <HUDFrame className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>🎭 Condition Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[--color-muted-foreground] mb-3">
              Track debilities, ongoing effects, and temporary conditions
            </p>
            <ConditionTracker
              characterId={currentCharacter?.id}
              onConditionResolved={handleConditionResolved}
            />
          </CardContent>
        </Card>
      </HUDFrame>
    </motion.div>
  )
}

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
)

export default conditionTrackerPanelConfig
