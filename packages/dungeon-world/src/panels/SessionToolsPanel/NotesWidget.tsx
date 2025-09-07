import React, { useEffect, useMemo, useState } from 'react'
import { loadPanelState, savePanelState } from '../../framework/PanelAPI'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { motion, useReducedMotion } from 'framer-motion'
import { itemFadeIn } from '../../utils/motion'

interface NotesWidgetProps {
  panelId: string
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ panelId }) => {
  const persisted = loadPanelState<{ notes: string }>(`${panelId}:notes`, { notes: '' })
  const [notes, setNotes] = useState<string>(persisted.notes)
  const [query, setQuery] = useState<string>('')
  const prefersReduced = useReducedMotion()

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
      <motion.div className="st-notes-toolbar" whileHover={prefersReduced ? undefined : { scale: 1.01 }}>
        <Input
          type="text"
          placeholder="Search notes..."
          value={query}
          onChange={e => setQuery((e.target as HTMLInputElement).value)}
          aria-label="Search notes"
        />
      </motion.div>
      <Textarea
        aria-label="Session notes"
        value={notes}
        onChange={e => setNotes((e.target as HTMLTextAreaElement).value)}
        rows={8}
        className="st-notes-textarea"
      />
      <motion.div className="st-notes-preview" aria-live="polite" variants={itemFadeIn} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
        {query ? highlighted : ''}
      </motion.div>
    </div>
  )
}

export default NotesWidget
