import React, { useEffect, useMemo, useState } from 'react'
import { getRegisteredShortcuts } from '../utils/KeyboardShortcuts'

interface ShortcutsOverlayProps {
  onClose: () => void
}

const ShortcutsOverlay: React.FC<ShortcutsOverlayProps> = ({ onClose }) => {
  const [query, setQuery] = useState('')
  const items = useMemo(() => getRegisteredShortcuts(), [])
  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q)
      return items
    return items.filter(i => (i.combo + ' ' + (i.description ?? '') + ' ' + (i.scope ?? '')).toLowerCase().includes(q))
  }, [items, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" className="shortcuts-overlay">
      <div className="shortcuts-overlay__panel">
        <div className="shortcuts-overlay__header">
          <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
          <button type="button" className="shortcuts-overlay__close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="shortcuts-overlay__search">
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={query}
            onChange={e => setQuery((e.target as HTMLInputElement).value)}
          />
        </div>
        <ul className="shortcuts-overlay__list">
          {list.map((i, idx) => (
            <li key={idx} className="shortcuts-overlay__item">
              <span className="shortcuts-overlay__combo">{i.combo}</span>
              <span className="shortcuts-overlay__desc">{i.description ?? ''}</span>
              <span className="shortcuts-overlay__scope">{i.scope ?? 'global'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ShortcutsOverlay


