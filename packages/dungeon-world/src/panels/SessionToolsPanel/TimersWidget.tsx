import React, { useEffect, useMemo, useRef, useState } from 'react'
import { loadPanelState, savePanelState, panelEventBus } from '../../framework/PanelAPI'

type TimerMode = 'up' | 'down'

interface Timer {
  id: string
  label: string
  mode: TimerMode
  durationMs?: number
  startedAt: number | null
  elapsedMs: number
  running: boolean
}

interface Bookmark {
  id: string
  timestamp: number
  label: string
}

interface TimersWidgetProps {
  panelId: string
}

const TimersWidget: React.FC<TimersWidgetProps> = ({ panelId }) => {
  const persisted = loadPanelState<{ timers: Timer[], bookmarks: Bookmark[] }>(`${panelId}:timers`, { timers: [], bookmarks: [] })
  const [timers, setTimers] = useState<Timer[]>(persisted.timers)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(persisted.bookmarks)

  const [label, setLabel] = useState('')
  const [mode, setMode] = useState<TimerMode>('up')
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const tickRef = useRef<number | null>(null)

  useEffect(() => {
    const handle = setTimeout(() => savePanelState(`${panelId}:timers`, { timers, bookmarks }), 250)
    return () => clearTimeout(handle)
  }, [panelId, timers, bookmarks])

  useEffect(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (timers.some(t => t.running)) {
      tickRef.current = window.setInterval(() => {
        setTimers(prev => prev.map(t => {
          if (!t.running) return t
          const now = Date.now()
          const base = t.startedAt ? now - t.startedAt : 0
          const elapsed = t.elapsedMs + base
          if (t.mode === 'down' && typeof t.durationMs === 'number' && elapsed >= t.durationMs) {
            // timer complete
            panelEventBus.emit('session:log:add', { type: 'timer', text: `Timer ended: ${t.label}` })
            return { ...t, running: false, startedAt: null, elapsedMs: t.durationMs }
          }
          return { ...t, startedAt: now, elapsedMs: elapsed, running: true }
        }))
      }, 1000) as unknown as number
    }
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [timers])

  const addTimer = () => {
    const name = label.trim() || (mode === 'up' ? 'Stopwatch' : 'Countdown')
    const durationMs = mode === 'down' ? (Math.max(0, minutes) * 60 + Math.max(0, seconds)) * 1000 : undefined
    const t: Timer = { id: `tm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label: name, mode, durationMs, startedAt: null, elapsedMs: 0, running: false }
    setTimers(prev => [...prev, t])
    setLabel('')
  }

  const start = (id: string) => setTimers(prev => prev.map(t => t.id === id ? { ...t, startedAt: Date.now(), running: true } : t))
  const pause = (id: string) => setTimers(prev => prev.map(t => t.id === id ? { ...t, running: false, startedAt: null } : t))
  const reset = (id: string) => setTimers(prev => prev.map(t => t.id === id ? { ...t, running: false, startedAt: null, elapsedMs: 0 } : t))
  const remove = (id: string) => setTimers(prev => prev.filter(t => t.id !== id))

  const fmt = (ms: number): string => {
    const total = Math.max(0, Math.floor(ms / 1000))
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const remaining = (t: Timer) => {
    if (t.mode === 'up') return fmt(t.elapsedMs)
    const dur = t.durationMs || 0
    const rem = Math.max(0, dur - t.elapsedMs)
    return fmt(rem)
  }

  const addBookmark = (lbl?: string) => {
    const b: Bookmark = { id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: Date.now(), label: (lbl || 'Bookmark') }
    setBookmarks(prev => [b, ...prev])
    panelEventBus.emit('session:log:add', { type: 'bookmark', text: `Bookmark added: ${b.label}` })
  }

  const removeBookmark = (id: string) => setBookmarks(prev => prev.filter(b => b.id !== id))

  const empty = useMemo(() => timers.length === 0, [timers])

  return (
    <div className="st-timers-widget">
      <div className="st-timer-form">
        <label htmlFor="tm-label">Label:</label>
        <input id="tm-label" type="text" value={label} onChange={e => setLabel(e.target.value)} aria-label="Timer label" />
        <label htmlFor="tm-mode">Mode:</label>
        <select id="tm-mode" value={mode} onChange={e => setMode(e.target.value as TimerMode)} aria-label="Timer mode">
          <option value="up">Stopwatch</option>
          <option value="down">Countdown</option>
        </select>
        {mode === 'down' && (
          <>
            <label htmlFor="tm-min">Min:</label>
            <input id="tm-min" type="number" value={minutes} onChange={e => setMinutes(Number.parseInt(e.target.value || '0'))} aria-label="Minutes" />
            <label htmlFor="tm-sec">Sec:</label>
            <input id="tm-sec" type="number" value={seconds} onChange={e => setSeconds(Number.parseInt(e.target.value || '0'))} aria-label="Seconds" />
          </>
        )}
        <button type="button" className="btn btn-primary" onClick={addTimer}>Add Timer</button>
        <button type="button" className="btn btn-outline" onClick={() => addBookmark()}>Add Bookmark</button>
      </div>

      <div className="st-timer-list" aria-live="polite">
        {empty && <div className="st-empty">No timers yet.</div>}
        {timers.map(t => (
          <div key={t.id} className="st-timer-row">
            <div className="st-timer-meta">
              <span className="st-timer-label">{t.label}</span>
              <span className="st-timer-remaining" aria-label={`${t.label} time`}>{remaining(t)}</span>
            </div>
            <div className="st-timer-actions">
              {!t.running && <button type="button" className="btn btn-secondary btn-sm" onClick={() => start(t.id)} aria-label={`Start ${t.label}`}>Start</button>}
              {t.running && <button type="button" className="btn btn-secondary btn-sm" onClick={() => pause(t.id)} aria-label={`Pause ${t.label}`}>Pause</button>}
              <button type="button" className="btn btn-outline btn-sm" onClick={() => reset(t.id)} aria-label={`Reset ${t.label}`}>Reset</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(t.id)} aria-label={`Delete ${t.label}`}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div className="st-bookmarks">
        <h3 className="st-card__title">Bookmarks</h3>
        {bookmarks.length === 0 && <div className="st-empty">No bookmarks yet.</div>}
        {bookmarks.map(b => (
          <div key={b.id} className="st-bookmark-row">
            <span className="st-bookmark-label">{b.label}</span>
            <span className="st-bookmark-time">{new Date(b.timestamp).toLocaleTimeString()}</span>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeBookmark(b.id)} aria-label={`Remove ${b.label}`}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimersWidget
