import React, { useEffect, useMemo, useState } from 'react'
import { loadPanelState, savePanelState } from '../../framework/PanelAPI'

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
      <div className="st-trackers-form">
        <label htmlFor="tracker-label">Label:</label>
        <input id="tracker-label" type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g., Hold" aria-label="Tracker label" />
        <label htmlFor="tracker-initial">Start:</label>
        <input id="tracker-initial" type="number" value={initialValue} onChange={e => setInitialValue(Number.parseInt(e.target.value || '0'))} aria-label="Initial value" />
        <button type="button" className="btn btn-primary" onClick={() => addTracker()}>Add</button>
        <div className="st-quick-add">
          <button type="button" className="btn btn-outline" onClick={() => addTracker('Hold', 0)}>+ Hold</button>
          <button type="button" className="btn btn-outline" onClick={() => addTracker('Charge', 0)}>+ Charge</button>
          <button type="button" className="btn btn-outline" onClick={() => addTracker('Counter', 0)}>+ Counter</button>
        </div>
      </div>

      <div className="st-trackers-list" aria-live="polite">
        {hasNone && <div className="st-empty">No trackers yet.</div>}
        {trackers.map(t => (
          <div key={t.id} className="st-tracker-row">
            <div className="st-tracker-meta">
              <span className="st-tracker-label">{t.label}</span>
              <span className="st-tracker-value" aria-label={`${t.label} value`}>{t.value}</span>
            </div>
            <div className="st-tracker-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateValue(t.id, -1)} aria-label={`Decrement ${t.label}`}>-</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => updateValue(t.id, +1)} aria-label={`Increment ${t.label}`}>+</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => resetValue(t.id)} aria-label={`Reset ${t.label}`}>Reset</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTracker(t.id)} aria-label={`Delete ${t.label}`}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrackersWidget
