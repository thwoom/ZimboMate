import type { PanelMetadata } from '../framework/Panel'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { panelRegistry } from '../framework/PanelRegistry'
import { useGameStore } from '../store/GameStore'
import { filterPanelsForCharacter } from '../utils/navigationFilter'
import { panelEventBus } from '../framework/PanelAPI'
import './Sidebar.css'

interface SidebarProps {
  activePanelId?: string
  onPanelSelect?: (panelId: string) => void
  overlay?: boolean
  open?: boolean
  onRequestClose?: () => void
}

type SectionKey = 'gameplay' | 'tools' | 'settings' | 'development'

const sectionLabels: Record<SectionKey, string> = {
  gameplay: 'Gameplay',
  tools: 'Tools',
  settings: 'Settings',
  development: 'Development',
}

function categorize(panel: PanelMetadata): SectionKey {
  const id = panel.id.toLowerCase()
  const name = panel.name.toLowerCase()
  // Gameplay
  if (id.includes('character') || id.includes('stats') || id.includes('equipment') || id.includes('moves') || id.includes('inventory'))
    return 'gameplay'
  // Tools
  if (id.includes('session') || id.includes('dice') || name.includes('tool') || id.includes('performance'))
    return 'tools'
  // Settings
  if (id.includes('settings') || id.includes('export') || id.includes('import') || id.includes('skin') || id.includes('ai'))
    return 'settings'
  // Development
  if (id.includes('test') || id.includes('debug') || id.includes('playground') || id.includes('studio') || id.includes('warning'))
    return 'development'
  // Fallback
  return 'gameplay'
}

function getBadgeCount(panelId: string): number {
  try {
    const anyWin = window as any
    const m = anyWin.__panelBadges
    if (m && typeof m === 'object' && typeof m[panelId] === 'number')
      return m[panelId]
  } catch {}
  return 0
}

const Sidebar: React.FC <SidebarProps> = ({ activePanelId, onPanelSelect, overlay, open, onRequestClose }) => {
  const [panels, setPanels] = useState <PanelMetadata[]>([])
  const { state, updateSettings } = useGameStore()
  const [showQuickOpen, setShowQuickOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navRef = useRef<HTMLElement | null>(null)

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
    const offBadge = panelEventBus.on('badge:update', () => {
      // trigger a re-render so getBadgeCount reflects latest counts
      setPanels(prev => [...prev])
    })
    return () => { unsubscribe(); offBadge() }
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

  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (!target || !target.classList.contains('sidebar__nav-button')) return
      const list = target.closest('ul')
      if (!list) return
      const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('.sidebar__nav-button'))
      const idx = buttons.indexOf(target as HTMLButtonElement)
      if (idx < 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = buttons[(idx + 1) % buttons.length]
        next?.focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = buttons[(idx - 1 + buttons.length) % buttons.length]
        prev?.focus()
      } else if (e.key === 'Home') {
        e.preventDefault(); buttons[0]?.focus()
      } else if (e.key === 'End') {
        e.preventDefault(); buttons[buttons.length - 1]?.focus()
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [navRef])

  const memoizedPanels = useMemo(() => panels, [panels])

  const favorites = state.settings.sidebarPrefs?.favorites || []
  const collapsed = new Set(state.settings.sidebarPrefs?.collapsedSections || [])

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites)
    if (next.has(id)) next.delete(id); else next.add(id)
    updateSettings({ sidebarPrefs: { favorites: Array.from(next), collapsedSections: state.settings.sidebarPrefs?.collapsedSections || [], order: state.settings.sidebarPrefs?.order || [], recents: state.settings.sidebarPrefs?.recents || [] } })
  }

  const toggleCollapsed = (key: string) => {
    const next = new Set(collapsed)
    if (next.has(key)) next.delete(key); else next.add(key)
    updateSettings({ sidebarPrefs: { favorites: state.settings.sidebarPrefs?.favorites || [], collapsedSections: Array.from(next), order: state.settings.sidebarPrefs?.order || [], recents: state.settings.sidebarPrefs?.recents || [] } })
  }

  const filteredByQuery = memoizedPanels.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))

  // Favorites vs rest (dedup)
  const favoritePanels = filteredByQuery.filter(p => favorites.includes(p.id))
  const nonFavoritePanels = filteredByQuery.filter(p => !favorites.includes(p.id))

  // Group non-favorites into sections
  const sectionsOrder: SectionKey[] = ['gameplay', 'tools', 'settings', 'development']
  const grouped: Record<SectionKey, PanelMetadata[]> = {
    gameplay: [], tools: [], settings: [], development: [],
  }
  for (const p of nonFavoritePanels)
    grouped[categorize(p)].push(p)

  // Hidden notice (panels filtered out by class prefs)
  const totalRegistered = useMemo(() => {
    const list = panelRegistry.getPanelsByPriority().map(p => p.metadata)
    const unique = list.filter((panel, index, array) => array.findIndex(p => p.id === panel.id) === index)
    return unique.length
  }, [state])
  const hiddenCount = Math.max(0, totalRegistered - panels.length)

  const rootClasses = [
    'sidebar',
    'floating-glass',
    'bg-white/10',
    'dark:bg-white/10',
    'backdrop-blur-2xl',
    'saturate-150',
    'border',
    'border-white/20',
  ].join(' ')

  return (
    <div className={rootClasses}>
      <div className="sidebar__header glass-header">
        <h1 className="sidebar__title">Dungeon World</h1>
      </div>

      {/* Notice removed in minimized rail UX */}

      {showQuickOpen && (
        <div className="quick-open glass-panel">
          <input className="quick-open__input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Quick open panel..." />
          <div className="quick-open__list">
            {filteredByQuery.map(p => (
              <div key={`qo-${p.id}`} className="quick-open__item" onClick={() => { onPanelSelect?.(p.id); setShowQuickOpen(false) }}>
                {p.icon} {p.name} <span className="sidebar__section-label">({sectionLabels[categorize(p)]})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="sidebar__nav" ref={navRef}>
        {/* Favorites removed for minimal rail UX */}

        {/* Grouped Sections */}
        {sectionsOrder.map((sec) => (
          <div key={`sec-${sec}`} className="sidebar__section">
            <button className="sidebar__section-header" aria-controls={`sec-${sec}-list`} onClick={() => toggleCollapsed(`sec:${sec}`)} type="button">
              <span>{sectionLabels[sec]}</span>
              <span className="sidebar__badge">{grouped[sec].length}</span>
            </button>
            {!collapsed.has(`sec:${sec}`) && (
              <ul id={`sec-${sec}-list`} className="sidebar__section-list">
                {grouped[sec].map(panel => (
                  <li key={`panel-${panel.id}`} className="sidebar__nav-item">
                    <div className="sidebar__nav-row">
                      <button
                        className={`sidebar__nav-button ${activePanelId === panel.id ? 'sidebar__nav-button--active' : ''}`}
                        aria-current={activePanelId === panel.id ? 'page' : undefined}
                        onClick={() => onPanelSelect?.(panel.id)}
                        type="button"
                      >
                        <span className="sidebar__nav-icon">{panel.icon}</span>
                        <span className="sidebar__nav-text">{panel.name}</span>
                        {getBadgeCount(panel.id) > 0 && (
                          <span className="sidebar__badge" aria-label={`Notifications ${getBadgeCount(panel.id)}`}>{Math.min(99, getBadgeCount(panel.id))}</span>
                        )}
                      </button>
                      <button className="sidebar__star-button" onClick={(e) => { e.stopPropagation(); toggleFavorite(panel.id) }} title={favorites.includes(panel.id) ? 'Unfavorite' : 'Favorite'} type="button">
                        {favorites.includes(panel.id) ? '★' : '☆'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer glass-header">
        <button className="sidebar__settings-button" type="button">
          <span className="sidebar__nav-icon">⚙️</span>
          <span className="sidebar__nav-text">Settings</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
