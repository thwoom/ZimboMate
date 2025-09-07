import type { PanelProps } from '../../framework/Panel'

import React from 'react'
import { createPanel } from '../../framework/Panel'
import './SessionToolsPanel.css'
import DiceWidget from './DiceWidget'
import NotesWidget from './NotesWidget'
import TrackersWidget from './TrackersWidget'
import TimersWidget from './TimersWidget'
import LogWidget from './LogWidget'
import { HUDFrame } from '../../components/ui/HUDFrame'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '../../utils/motion'

const SessionToolsPanel: React.FC<PanelProps & { panelState?: any }> = ({ id, panelState, onStateChange }) => {
  const prefersReduced = useReducedMotion()
  return (
    <HUDFrame className="p-4" role="region" aria-label="Session Tools">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Session Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[--color-muted-foreground]">Dice, notes, trackers, timers, and event log</p>
        </CardContent>
      </Card>

      <motion.div className="st-grid" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
        <motion.div variants={itemFadeIn}>
        <Card asChild className="st-card">
          <section aria-labelledby="st-dice">
            <CardHeader>
              <CardTitle id="st-dice" className="st-card__title">Dice Roller</CardTitle>
            </CardHeader>
            <CardContent>
              <DiceWidget scopeId={id} />
            </CardContent>
          </section>
        </Card>
        </motion.div>

        <motion.div variants={itemFadeIn}>
        <Card asChild className="st-card">
          <section aria-labelledby="st-notes">
            <CardHeader>
              <CardTitle id="st-notes" className="st-card__title">Note Keeper</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesWidget panelId={id} />
            </CardContent>
          </section>
        </Card>
        </motion.div>

        <motion.div variants={itemFadeIn}>
        <Card asChild className="st-card">
          <section aria-labelledby="st-trackers">
            <CardHeader>
              <CardTitle id="st-trackers" className="st-card__title">Trackers</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackersWidget panelId={id} />
            </CardContent>
          </section>
        </Card>
        </motion.div>

        <motion.div variants={itemFadeIn}>
        <Card asChild className="st-card">
          <section aria-labelledby="st-timers">
            <CardHeader>
              <CardTitle id="st-timers" className="st-card__title">Timers & Bookmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <TimersWidget panelId={id} />
            </CardContent>
          </section>
        </Card>
        </motion.div>

        <motion.div variants={itemFadeIn}>
        <Card asChild className="st-card st-card--wide">
          <section aria-labelledby="st-log">
            <CardHeader>
              <CardTitle id="st-log" className="st-card__title">Roll & Event Log</CardTitle>
            </CardHeader>
            <CardContent>
              <LogWidget panelId={id} />
            </CardContent>
          </section>
        </Card>
        </motion.div>
      </motion.div>
    </HUDFrame>
  )
}

export default createPanel(
  {
    id: 'session-tools',
    name: 'Session Tools',
    icon: '🎲',
    description: 'Dice roller, notes, trackers, timers, and event log',
    priority: 4,
  },
  SessionToolsPanel,
  {
    getInitialState: () => ({
      notes: '',
      trackers: [],
      timers: [],
      bookmarks: [],
      log: [],
    }),
  },
)
