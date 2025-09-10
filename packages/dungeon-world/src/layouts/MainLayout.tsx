import React, { useEffect, useState } from 'react'

import { AutoSaveIndicator } from '../components/AutoSaveIndicator'

import UnifiedQuickTools from '../components/UnifiedQuickTools'
import { panelEventBus } from '../framework/PanelAPI'
import { useGameStore } from '../store/GameStore'
import ContentArea from './ContentArea'
import Sidebar from './Sidebar'
import GlassTopNav from './GlassTopNav'
import './MainLayout.css'

interface MainLayoutProps {
  // No longer need drawer props since we're removing the auxiliary drawer
}

const MainLayout: React.FC <MainLayoutProps> = () => {
  const [activePanelId, setActivePanelId] = useState <string>('character-stats')
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const { state } = useGameStore()

  // Listen for navigation events from panels
  useEffect(() => {
    const unsubscribe = panelEventBus.on('navigate', (event) => {
      if (event.data.panelId) {
        setActivePanelId(event.data.panelId)
      }
    })

    return unsubscribe
  }, [])

  // Emit panel activation events for context-aware tools
  useEffect(() => {
    panelEventBus.emit('panel-activated', {
      panelId: activePanelId,
    })
  }, [activePanelId])

  // Auto-save functionality
  useEffect(() => {
    let saveTimeout: NodeJS.Timeout

    const performAutoSave = async () => {
      try {
        setAutoSaveStatus('saving')

        // Save to localStorage
        localStorage.setItem('zimbomate-gamestate', JSON.stringify({
          ...state,
          lastSaved: new Date().toISOString(),
        }))

        setAutoSaveStatus('saved')

        // Reset to idle after showing saved status
        setTimeout(() => setAutoSaveStatus('idle'), 3000)
      }
      catch {
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus('idle'), 5000)
      }
    }

    // Debounce saves-only save after 2 seconds of no changes
    saveTimeout = setTimeout(performAutoSave, 2000)

    return () => clearTimeout(saveTimeout)
  }, [state])

  return (
    <div className="main-layout">
      <GlassTopNav />

      {/* Hover-to-expand minimal sidebar */}
      <Sidebar
        activePanelId={activePanelId}
        onPanelSelect={(id) => { setActivePanelId(id) }}
      />

      <main className="main-layout__content">
        <div className="content-float floating-glass">
          <ContentArea
            activePanelId={activePanelId}
          />
        </div>
      </main>

      {/* Unified Quick Tools */}
      <UnifiedQuickTools position="bottom-right" />

      {/* Auto-save indicator */}
      <AutoSaveIndicator
        status={autoSaveStatus}
        className="main-layout__autosave"
      />
    </div>
  )
}

export default MainLayout
