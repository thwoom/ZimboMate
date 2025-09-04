import type { PanelMetadata } from '../framework/Panel'

import React, { useEffect, useMemo, useState } from 'react'

import { panelRegistry } from '../framework/PanelRegistry'
import { useGameStore } from '../store/GameStore'
import { filterPanelsForCharacter } from '../utils/navigationFilter'
import './Sidebar.css'

interface SidebarProps {
  activePanelId?: string
  onPanelSelect?: (panelId: string) => void
}

const Sidebar: React.FC <SidebarProps> = ({ activePanelId, onPanelSelect }) => {
  const [panels, setPanels] = useState <PanelMetadata[]>([])
  const { state, updateSettings } = useGameStore()
  const [showQuickOpen, setShowQuickOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const updatePanels = () => {
      const sortedPanels = panelRegistry.getPanelsByPriority().map(p => p.metadata)
      const uniquePanels = sortedPanels.filter((panel, index, array) =>
        array.findIndex(p => p.id === panel.id) === index,
      )
      const filtered = filterPanelsForCharacter(uniquePanels, state)
      setPanels(filtered)
    }

    updatePanels()
    const unsubscribe = panelRegistry.addListener(() => { updatePanels() })
    return unsubscribe
  }, [state])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowQuickOpen((v) => !v)
      }
      if (e.key === 'Escape') setShowQuickOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const memoizedPanels = useMemo(() => panels, [panels])

  const favorites = state.settings.sidebarPrefs?.favorites || []
  const collapsed = new Set(state.settings.sidebarPrefs?.collapsedSections || [])

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites)
    if (next.has(id)) next.delete(id); else next.add(id)
    updateSettings({ sidebarPrefs: { ...state.settings.sidebarPrefs, favorites: Array.from(next) } })
  }

  const toggleCollapsed = (key: string) => {
    const next = new Set(collapsed)
    if (next.has(key)) next.delete(key); else next.add(key)
    updateSettings({ sidebarPrefs: { ...state.settings.sidebarPrefs, collapsedSections: Array.from(next) } })
  }

  const filteredByQuery = memoizedPanels.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))

  // Favorites vs All (dedup)
  const favoritePanels = filteredByQuery.filter(p => favorites.includes(p.id))
  const allPanels = filteredByQuery.filter(p => !favorites.includes(p.id))

  // Hidden notice (panels filtered out by class prefs)
  const totalRegistered = useMemo(() => {
    const list = panelRegistry.getPanelsByPriority().map(p => p.metadata)
    const unique = list.filter((panel, index, array) => array.findIndex(p => p.id === panel.id) === index)
    return unique.length
  }, [state])
  const hiddenCount = Math.max(0, totalRegistered - panels.length)

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">Dungeon World</h1>
      </div>

      {hiddenCount > 0 && (
        <div className="sidebar__notice">
          {hiddenCount} panel{hiddenCount > 1 ? 's' : ''} hidden by class preferences.
          {' '}
          <button
            className="sidebar__star-button"
            onClick={() => updateSettings({ conditionalContent: { ...state.settings.conditionalContent!, global: { ...state.settings.conditionalContent!.global, preferClassRelevant: false } } })}
          >
            Show all
          </button>
        </div>
      )}

      {showQuickOpen && (
        <div className="quick-open">
          <input className="quick-open__input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Quick open panel..." />
          <div className="quick-open__list">
            {filteredByQuery.map(p => (
              <div key={`qo-${p.id}`} className="quick-open__item" onClick={() => { onPanelSelect?.(p.id); setShowQuickOpen(false) }}>
                {p.icon} {p.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="sidebar__nav">
        {/* Favorites Section */}
        <div className="sidebar__section">
          <div className="sidebar__section-header" onClick={() => toggleCollapsed('favorites')}>
            <span>Favorites</span>
            <span className="sidebar__badge">{favoritePanels.length}</span>
          </div>
          {!collapsed.has('favorites') && (
            <ul className="sidebar__section-list">
              {favoritePanels.map(panel => (
                <li key={`fav-${panel.id}`} className="sidebar__nav-item">
                  <button
                    className={`sidebar__nav-button 
                      activePanelId === panel.id ? 'sidebar__nav-button--active' : ''}
                    }`}
                    aria-current={activePanelId === panel.id ? 'page' : undefined}
                    onClick={() => onPanelSelect?.(panel.id)}
                  >
                    <span className="sidebar__nav-icon">{panel.icon}</span>
                    <span className="sidebar__nav-text">{panel.name}</span>
                    <span className="sidebar__star">
                      <button className="sidebar__star-button" onClick={(e) => { e.stopPropagation(); toggleFavorite(panel.id) }} title={favorites.includes(panel.id) ? 'Unfavorite' : 'Favorite'}>
                        {favorites.includes(panel.id) ? '★' : '☆'}
                      </button>
                    </span>
                  </button>
                </li>
              ))}
              {favoritePanels.length === 0 && (
                <li className="sidebar__nav-item"><span className="sidebar__nav-text">No favorites yet</span></li>
              )}
            </ul>
          )}
        </div>

        {/* All Panels Section */}
        <div className="sidebar__section">
          <div className="sidebar__section-header" onClick={() => toggleCollapsed('all')}>
            <span>All Panels</span>
            <span className="sidebar__badge">{allPanels.length}</span>
          </div>
          {!collapsed.has('all') && (
            <ul className="sidebar__section-list">
              {allPanels.map(panel => (
                <li key={`panel-${panel.id}`} className="sidebar__nav-item">
                  <button
                    className={`sidebar__nav-button 
                      activePanelId === panel.id ? 'sidebar__nav-button--active' : ''}
                    }`}
                    aria-current={activePanelId === panel.id ? 'page' : undefined}
                    onClick={() => onPanelSelect?.(panel.id)}
                  >
                    <span className="sidebar__nav-icon">{panel.icon}</span>
                    <span className="sidebar__nav-text">{panel.name}</span>
                    <span className="sidebar__star">
                      <button className="sidebar__star-button" onClick={(e) => { e.stopPropagation(); toggleFavorite(panel.id) }} title={favorites.includes(panel.id) ? 'Unfavorite' : 'Favorite'}>
                        {favorites.includes(panel.id) ? '★' : '☆'}
                      </button>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__settings-button">
          <span className="sidebar__nav-icon">⚙️</span>
          <span className="sidebar__nav-text">Settings</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
