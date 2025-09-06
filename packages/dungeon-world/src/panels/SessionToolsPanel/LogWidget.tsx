import React, { useEffect, useMemo, useState } from 'react'
import { loadPanelState, savePanelState, panelEventBus } from '../../framework/PanelAPI'

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
      <div className="st-log-toolbar">
        <label htmlFor="log-type">Type:</label>
        <select id="log-type" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type">
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" placeholder="Search log..." value={query} onChange={e => setQuery(e.target.value)} aria-label="Search log" />
        <button type="button" className="btn btn-outline" onClick={exportLog}>Export</button>
        <button type="button" className="btn btn-outline" onClick={() => setShowImport(v => !v)}>{showImport ? 'Close Import' : 'Import'}</button>
        <button type="button" className="btn btn-danger" onClick={clearAll}>Clear</button>
      </div>

      {showImport && (
        <div className="st-log-import">
          <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={4} aria-label="Import JSON" />
          <button type="button" className="btn btn-primary" onClick={importLog}>Import</button>
        </div>
      )}

      <div className="st-log-list" role="list" aria-live="polite">
        {filtered.length === 0 && <div className="st-empty">No log entries.</div>}
        {filtered.map(e => (
          <div key={e.id} role="listitem" className="st-log-row">
            <span className="st-log-time">{new Date(e.timestamp).toLocaleTimeString()}</span>
            <span className="st-log-type">[{e.type}]</span>
            <span className="st-log-text">{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LogWidget
