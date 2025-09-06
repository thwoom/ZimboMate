import React, { useEffect, useMemo, useState } from 'react'
import { loadPanelState, savePanelState } from '../../framework/PanelAPI'

interface NotesWidgetProps {
  panelId: string
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ panelId }) => {
  const persisted = loadPanelState<{ notes: string }>(`${panelId}:notes`, { notes: '' })
  const [notes, setNotes] = useState<string>(persisted.notes)
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    const handle = setTimeout(() => savePanelState(`${panelId}:notes`, { notes }), 300)
    return () => clearTimeout(handle)
  }, [panelId, notes])

  const highlighted = useMemo(() => {
    if (!query.trim()) return notes
    try {
      const safe = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const rx = new RegExp(safe, 'gi')
      return notes.replace(rx, (m) => `<<${m}>>`)
    } catch { return notes }
  }, [notes, query])

  return (
    <div className="st-notes-widget">
      <div className="st-notes-toolbar">
        <input
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="Search notes"
        />
      </div>
      <textarea
        aria-label="Session notes"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={8}
        className="st-notes-textarea"
      />
      <div className="st-notes-preview" aria-live="polite">
        {query ? highlighted : ''}
      </div>
    </div>
  )
}

export default NotesWidget
