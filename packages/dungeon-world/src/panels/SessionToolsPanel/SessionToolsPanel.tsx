import type { PanelProps } from '../../framework/Panel'

import React from 'react'
import { createPanel } from '../../framework/Panel'
import './SessionToolsPanel.css'
import DiceWidget from './DiceWidget'
import NotesWidget from './NotesWidget'
import TrackersWidget from './TrackersWidget'
import TimersWidget from './TimersWidget'
import LogWidget from './LogWidget'

const SessionToolsPanel: React.FC<PanelProps & { panelState?: any }> = ({ id, panelState, onStateChange }) => {
  return (
    <div className="session-tools-panel" role="region" aria-label="Session Tools">
      <header className="st-header">
        <h1 className="st-title">Session Tools</h1>
        <p className="st-subtitle">Dice, notes, trackers, timers, and event log</p>
      </header>

      <div className="st-grid">
        <section className="st-card" aria-labelledby="st-dice">
          <h2 id="st-dice" className="st-card__title">Dice Roller</h2>
          <DiceWidget scopeId={id} />
        </section>

        <section className="st-card" aria-labelledby="st-notes">
          <h2 id="st-notes" className="st-card__title">Note Keeper</h2>
          <NotesWidget panelId={id} />
        </section>

        <section className="st-card" aria-labelledby="st-trackers">
          <h2 id="st-trackers" className="st-card__title">Trackers</h2>
          <TrackersWidget panelId={id} />
        </section>

        <section className="st-card" aria-labelledby="st-timers">
          <h2 id="st-timers" className="st-card__title">Timers & Bookmarks</h2>
          <TimersWidget panelId={id} />
        </section>

        <section className="st-card st-card--wide" aria-labelledby="st-log">
          <h2 id="st-log" className="st-card__title">Roll & Event Log</h2>
          <LogWidget panelId={id} />
        </section>
      </div>
    </div>
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
