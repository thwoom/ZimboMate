import React, { useEffect, useMemo, useState } from 'react'
import { loadPanelState, savePanelState } from '../../framework/PanelAPI'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { motion, useReducedMotion } from 'framer-motion'
import { itemFadeIn } from '../../utils/motion'

interface Tracker {
  id: string
  label: string
  value: number
}

interface TrackersWidgetProps {
  panelId: string
}

const TrackersWidget: React.FC<TrackersWidgetProps> = ({ panelId }) => {
  const persisted = loadPanelState<{ trackers: Tracker[] }>(`${panelId}:trackers`, { trackers: [] })
  const [trackers, setTrackers] = useState<Tracker[]>(persisted.trackers)
  const [label, setLabel] = useState('')
  const [initialValue, setInitialValue] = useState<number>(0)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const handle = setTimeout(() => savePanelState(`${panelId}:trackers`, { trackers }), 200)
    return () => clearTimeout(handle)
  }, [panelId, trackers])

  const addTracker = (customLabel?: string, customValue?: number) => {
    const name = (customLabel ?? label).trim()
    if (!name) return
    const value = Number.isFinite(customValue as number) ? (customValue as number) : (Number.isFinite(initialValue) ? initialValue : 0)
    const next: Tracker = { id: `trk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, label: name, value }
    setTrackers(prev => [...prev, next])
    if (!customLabel) setLabel('')
  }

  const removeTracker = (id: string) => {
    setTrackers(prev => prev.filter(t => t.id !== id))
  }

  const updateValue = (id: string, delta: number) => {
    setTrackers(prev => prev.map(t => (t.id === id ? { ...t, value: t.value + delta } : t)))
  }

  const resetValue = (id: string) => {
    setTrackers(prev => prev.map(t => (t.id === id ? { ...t, value: 0 } : t)))
  }

  const hasNone = useMemo(() => trackers.length === 0, [trackers])

  return (
    <div className="st-trackers-widget">
      <div className="st-trackers-form flex flex-wrap items-end gap-2">
        <label htmlFor="tracker-label">Label:</label>
        <Input id="tracker-label" value={label} onChange={e => setLabel((e.target as HTMLInputElement).value)} placeholder="e.g., Hold" aria-label="Tracker label" className="w-40" />
        <label htmlFor="tracker-initial">Start:</label>
        <Input id="tracker-initial" type="number" value={initialValue as any} onChange={e => setInitialValue(Number.parseInt((e.target as HTMLInputElement).value || '0'))} aria-label="Initial value" className="w-24" />
        <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
          <Button type="button" onClick={() => addTracker()}>Add</Button>
        </motion.div>
        <div className="st-quick-add flex gap-2">
          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
            <Button type="button" variant="ghost" onClick={() => addTracker('Hold', 0)}>+ Hold</Button>
          </motion.div>
          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
            <Button type="button" variant="ghost" onClick={() => addTracker('Charge', 0)}>+ Charge</Button>
          </motion.div>
          <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
            <Button type="button" variant="ghost" onClick={() => addTracker('Counter', 0)}>+ Counter</Button>
          </motion.div>
        </div>
      </div>

      <div className="st-trackers-list" aria-live="polite">
        {hasNone && <div className="st-empty">No trackers yet.</div>}
        {trackers.map(t => (
          <motion.div key={t.id} className="st-tracker-row" variants={itemFadeIn} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
            <div className="st-tracker-meta">
              <span className="st-tracker-label">{t.label}</span>
              <span className="st-tracker-value" aria-label={`${t.label} value`}>{t.value}</span>
            </div>
            <div className="st-tracker-actions flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => updateValue(t.id, -1)} aria-label={`Decrement ${t.label}`}>-</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => updateValue(t.id, +1)} aria-label={`Increment ${t.label}`}>+</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => resetValue(t.id)} aria-label={`Reset ${t.label}`}>Reset</Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => removeTracker(t.id)} aria-label={`Delete ${t.label}`}>Delete</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default TrackersWidget
