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
  const { state } = useGameStore()

  useEffect(() => {
    // Get initial panels sorted by priority
    const updatePanels = () => {
      const sortedPanels = panelRegistry.getPanelsByPriority().map(p => p.metadata)

      // Ensure unique IDs (defensive programming)
      const uniquePanels = sortedPanels.filter((panel, index, array) =>
        array.findIndex(p => p.id === panel.id) === index,
      )

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        const panelIds = uniquePanels.map(p => p.id)
        const duplicates = panelIds.filter((id, index) => panelIds.indexOf(id) !== index)
        if (duplicates.length > 0) {
        }
      }

      // Apply conditional navigation filter
      const filtered = filterPanelsForCharacter(uniquePanels, state)
      setPanels(filtered)
    }

    updatePanels()

    // Listen for registry changes
    const unsubscribe = panelRegistry.addListener(() => {
      updatePanels()
    })

    return unsubscribe
  }, [state])

  // Memoize the panel list to prevent unnecessary re-renders
  const memoizedPanels = useMemo(() => panels, [panels])

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">Dungeon World</h1>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__nav-list">
          {memoizedPanels.map(panel => (
            <li key={`panel-${panel.id}`} className="sidebar__nav-item">
              <button
                className={`sidebar__nav-button 
                  activePanelId === panel.id ? 'sidebar__nav-button--active' : ''}
                }`}
                onClick={() => onPanelSelect?.(panel.id)}
              >
                <span className="sidebar__nav-icon">{panel.icon}</span>
                <span className="sidebar__nav-text">{panel.name}</span>
              </button>
            </li>
          ))}
        </ul>
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
