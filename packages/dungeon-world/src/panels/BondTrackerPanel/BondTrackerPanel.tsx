import type { PanelProps } from '../../framework/Panel'

import React from 'react'
import { BondTracker } from '../../components/BondTracker'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI } from '../../framework/PanelAPI'
import { useCharacter } from '../../store/GameStore'
import './BondTrackerPanel.css'
import { HUDFrame } from '../../components/ui/HUDFrame'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { motion, useReducedMotion } from 'framer-motion'
import { getVariant } from '../../utils/motion'

const id = 'bond-tracker'

const api = createPanelAPI(id)

const BondTrackerPanelComponent: React.FC <PanelProps> = ({ isActive, onStateChange }) => {
  const currentCharacter = useCharacter()

  const handleBondResolved = (bondId: string, xpGained: number) => {
    // Notify the game system that XP was gained
    // You could integrate this with your XP system here
    // For example: xpService.addXP(currentCharacter.id, xpGained, 'bond_resolution');

    // Update panel state if needed
    if (onStateChange) {
      onStateChange({ lastBondResolved: bondId, xpGained })
    }
  }

  return (
    <motion.div initial={useReducedMotion() ? false : 'hidden'} animate={useReducedMotion() ? undefined : 'visible'} variants={getVariant('fade')}>
      <HUDFrame className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>🔗 Bond Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[--color-muted-foreground] mb-3">
              Manage character relationships and earn XP through bonds
            </p>
            <BondTracker
              characterId={currentCharacter?.id}
              onBondResolved={handleBondResolved}
            />
          </CardContent>
        </Card>
      </HUDFrame>
    </motion.div>
  )
}

const bondTrackerPanelConfig = createPanel(
  {
    id,
    name: 'Bond Tracker',
    description: 'Manage character bonds and relationships for XP',
    icon: '🔗',
    priority: 30,
    preload: true,
  },
  BondTrackerPanelComponent,
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

export default bondTrackerPanelConfig
