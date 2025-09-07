import React from 'react'
import EquipmentCompendium from '../../components/EquipmentCompendium'
import { createPanel } from '../../framework/Panel'
import { HUDFrame } from '../../components/ui/HUDFrame'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { motion, useReducedMotion } from 'framer-motion'
import { getVariant } from '../../utils/motion'

const equipmentCompendiumPanel = createPanel(
  {
    id: 'equipment-compendium',
    name: 'Equipment Compendium',
    icon: '📚',
    priority: 55,
    description: 'Browse and compare equipment from the Dungeon World compendium',
  },
  () => {
    const prefersReduced = useReducedMotion()
    return (
      <motion.div initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={getVariant('fade')}>
        <HUDFrame className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Compendium</CardTitle>
            </CardHeader>
            <CardContent>
              <EquipmentCompendium />
            </CardContent>
          </Card>
        </HUDFrame>
      </motion.div>
    )
  },
)

export default equipmentCompendiumPanel
