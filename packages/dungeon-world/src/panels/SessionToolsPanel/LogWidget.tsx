import React, { useEffect, useMemo, useState } from 'react'
import { loadPanelState, savePanelState, panelEventBus } from '../../framework/PanelAPI'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select'
import { motion, useReducedMotion } from 'framer-motion'
import { itemFadeIn } from '../../utils/motion'

interface LogEntry {
  id: string
  timestamp: number
  type: string
  text: string
}

interface LogWidgetProps {
  panelId: string
}

const LogWidget: React.FC<LogWidgetProps> = ({ panelId }) => {
  const persisted = loadPanelState<{ log: LogEntry[] }>(`${panelId}:log`, { log: [] })
  const [log, setLog] = useState<LogEntry[]>(persisted.log)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const off = panelEventBus.on('session:log:add', (evt) => {
      const data = evt.data || {}
      const entry: LogEntry = {
        id: `lg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        type: String(data.type || 'event'),
        text: String(data.text || ''),
      }
      setLog(prev => [entry, ...prev].slice(0, 500))
    })
    return off
  }, [])

  useEffect(() => {
    const handle = setTimeout(() => savePanelState(`${panelId}:log`, { log }), 250)
    return () => clearTimeout(handle)
  }, [panelId, log])

  const types = useMemo(() => {
    const s = new Set<string>(log.map(e => e.type))
    return ['all', ...Array.from(s).sort()]
  }, [log])

  const filtered = useMemo(() => {
    return log.filter(e => (typeFilter === 'all' || e.type === typeFilter) && (!query.trim() || e.text.toLowerCase().includes(query.toLowerCase())))
  }, [log, typeFilter, query])

  const exportLog = async () => {
    try {
      const payload = JSON.stringify({ log }, null, 2)
      await navigator.clipboard?.writeText(payload)
    } catch {}
  }

  const importLog = () => {
    try {
      const obj = JSON.parse(importText)
      if (Array.isArray(obj)) {
        setLog(obj as LogEntry[])
      } else if (Array.isArray(obj.log)) {
        setLog(obj.log as LogEntry[])
      }
      setShowImport(false)
      setImportText('')
    } catch {}
  }

  const clearAll = () => setLog([])

  return (
    <div className="st-log-widget">
      <div className="st-log-toolbar flex flex-wrap items-end gap-2">
        <label htmlFor="log-type">Type:</label>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="text" placeholder="Search log..." value={query} onChange={e => setQuery((e.target as HTMLInputElement).value)} aria-label="Search log" />
        <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
          <Button type="button" variant="ghost" onClick={exportLog}>Export</Button>
        </motion.div>
        <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
          <Button type="button" variant="ghost" onClick={() => setShowImport(v => !v)}>{showImport ? 'Close Import' : 'Import'}</Button>
        </motion.div>
        <motion.div whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
          <Button type="button" variant="destructive" onClick={clearAll}>Clear</Button>
        </motion.div>
      </div>

      {showImport && (
        <div className="st-log-import">
          <textarea value={importText} onChange={e => setImportText((e.target as HTMLTextAreaElement).value)} rows={4} aria-label="Import JSON" className="w-full rounded-[--radius] border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] shadow-sm" />
          <Button type="button" onClick={importLog}>Import</Button>
        </div>
      )}

      <div className="st-log-list" role="list" aria-live="polite">
        {filtered.length === 0 && <div className="st-empty">No log entries.</div>}
        {filtered.map(e => (
          <motion.div key={e.id} role="listitem" className="st-log-row" variants={itemFadeIn} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
            <span className="st-log-time">{new Date(e.timestamp).toLocaleTimeString()}</span>
            <span className="st-log-type">[{e.type}]</span>
            <span className="st-log-text">{e.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default LogWidget
