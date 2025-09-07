import type { PanelProps } from '../framework/Panel'

import React from 'react'
import { createPanel } from '../framework/Panel'
import { HUDFrame } from '../components/ui/HUDFrame'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { motion, useReducedMotion } from 'framer-motion'
import { fadeInUp } from '../utils/motion'

import './PlaceholderPanel.css'

const PlaceholderPanel: React.FC <PanelProps> = ({ id }) => {
  const prefersReduced = useReducedMotion()
  return (
    <HUDFrame className="p-4">
      <motion.div initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>{id.charAt(0).toUpperCase() + id.slice(1)} Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <p> This panel is under construction.</p>
            <p>
              {' '}
              Panel ID:
              {id}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </HUDFrame>
  )
}

export function createPlaceholderPanel(id: string, name: string, icon: string) {
  return createPanel(
    {
      id,
      name,
      icon,
      description: `${name} panel placeholder`,
      priority: 10,
    },
    PlaceholderPanel,
  )
}
