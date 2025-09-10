import type { PanelMetadata } from '../framework/Panel'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { panelRegistry } from '../framework/PanelRegistry'
import { useGameStore } from '../store/GameStore'
import { filterPanelsForCharacter } from '../utils/navigationFilter'
import { panelEventBus } from '../framework/PanelAPI'
import './Sidebar.css'
import { HomeIcon, Cog6ToothIcon, BeakerIcon, CubeIcon } from '@heroicons/react/24/outline'

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
  const { state } = useGameStore()
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

  // Favorites and collapsible sections removed for condensed rail UX

  const filteredByQuery = memoizedPanels.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))

  const iconOverrides: Record<string, React.ReactNode> = {
    'character-stats': <HomeIcon className="w-5 h-5" />,
    'settings': <Cog6ToothIcon className="w-5 h-5" />,
    'test-playground': <BeakerIcon className="w-5 h-5" />,
  }

  const allPanels = filteredByQuery.map(p => ({
    ...p,
    iconNode: iconOverrides[p.id] || <span aria-hidden>{p.icon}</span>,
  }))

  // Hidden notice (panels filtered out by class prefs)
  // Hidden notice removed in condensed rail UX

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

      {/* Notice removed in minimized rail UX */}

      {false && showQuickOpen}

      <nav className="sidebar__nav" ref={navRef}>
        <ul className="sidebar__section-list">
          {allPanels.map(panel => (
            <li key={`panel-${panel.id}`} className="sidebar__nav-item">
              <button
                className={`sidebar__nav-button ${activePanelId === panel.id ? 'sidebar__nav-button--active' : ''}`}
                aria-current={activePanelId === panel.id ? 'page' : undefined}
                onClick={() => onPanelSelect?.(panel.id)}
                title={panel.name}
                type="button"
              >
                <span className="sidebar__nav-icon">{(panel as any).iconNode}</span>
                <span className="sidebar__nav-text">{panel.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
