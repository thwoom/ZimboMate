import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '../../utils/motion'
import { loadPanelState, savePanelState, panelEventBus } from '../../framework/PanelAPI'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select'

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

  const prefersReduced = useReducedMotion()
  return (
    <motion.div className="st-timers-widget" initial={prefersReduced ? undefined : 'hidden'} animate={prefersReduced ? undefined : 'visible'} variants={staggerContainer}>
      <motion.div className="st-timer-form flex flex-wrap items-end gap-2" variants={itemFadeIn}>
        <label htmlFor="tm-label">Label:</label>
        <Input id="tm-label" value={label} onChange={e => setLabel((e.target as HTMLInputElement).value)} aria-label="Timer label" className="w-40" />
        <label htmlFor="tm-mode">Mode:</label>
        <Select value={mode} onValueChange={(v) => setMode(v as TimerMode)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="up">Stopwatch</SelectItem>
            <SelectItem value="down">Countdown</SelectItem>
          </SelectContent>
        </Select>
        {mode === 'down' && (
          <>
            <label htmlFor="tm-min">Min:</label>
            <Input id="tm-min" type="number" value={minutes as any} onChange={e => setMinutes(Number.parseInt((e.target as HTMLInputElement).value || '0'))} aria-label="Minutes" className="w-20" />
            <label htmlFor="tm-sec">Sec:</label>
            <Input id="tm-sec" type="number" value={seconds as any} onChange={e => setSeconds(Number.parseInt((e.target as HTMLInputElement).value || '0'))} aria-label="Seconds" className="w-20" />
          </>
        )}
        <Button type="button" onClick={addTimer}>Add Timer</Button>
        <Button type="button" variant="ghost" onClick={() => addBookmark()}>Add Bookmark</Button>
      </motion.div>

      <motion.div className="st-timer-list" aria-live="polite" variants={staggerContainer}>
        {empty && <div className="st-empty">No timers yet.</div>}
        {timers.map(t => (
          <motion.div key={t.id} className="st-timer-row" variants={itemFadeIn} whileHover={prefersReduced ? undefined : { scale: 1.01 }}>
            <div className="st-timer-meta">
              <span className="st-timer-label">{t.label}</span>
              <span className="st-timer-remaining" aria-label={`${t.label} time`}>{remaining(t)}</span>
            </div>
            <div className="st-timer-actions flex gap-2">
              {!t.running && <Button type="button" variant="secondary" size="sm" onClick={() => start(t.id)} aria-label={`Start ${t.label}`}>Start</Button>}
              {t.running && <Button type="button" variant="secondary" size="sm" onClick={() => pause(t.id)} aria-label={`Pause ${t.label}`}>Pause</Button>}
              <Button type="button" variant="ghost" size="sm" onClick={() => reset(t.id)} aria-label={`Reset ${t.label}`}>Reset</Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(t.id)} aria-label={`Delete ${t.label}`}>Delete</Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="st-bookmarks" variants={staggerContainer}>
        <h3 className="st-card__title">Bookmarks</h3>
        {bookmarks.length === 0 && <div className="st-empty">No bookmarks yet.</div>}
        {bookmarks.map(b => (
          <motion.div key={b.id} className="st-bookmark-row" variants={itemFadeIn}>
            <span className="st-bookmark-label">{b.label}</span>
            <span className="st-bookmark-time">{new Date(b.timestamp).toLocaleTimeString()}</span>
            <Button type="button" variant="destructive" size="sm" onClick={() => removeBookmark(b.id)} aria-label={`Remove ${b.label}`}>Remove</Button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default TimersWidget
