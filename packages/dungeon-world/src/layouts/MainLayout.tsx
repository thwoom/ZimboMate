import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { panelRegistry } from '../framework/PanelRegistry'
import { panelLink } from '../lib/routes'
import HpOverlay from '../components/HpOverlay'
import { OverlayManager } from '../framework/OverlayManager'
import CombatOverlay from '../components/CombatOverlay'
import XpOverlay from '../components/XpOverlay'
import ProgressOverlay from '../components/ProgressOverlay'
import { useGameStore } from '../store/GameStore'
import { createDummyCharacter } from '../models/Character'
import LoadOverlay from '../components/LoadOverlay'
import StatusOverlay from '../components/StatusOverlay'
import ClassFocusOverlay from '../components/ClassFocusOverlay'
import DebilitiesOverlay from '../components/DebilitiesOverlay'
import AttributesOverlay from '../components/AttributesOverlay'
import PreferencesOverlay from '../components/PreferencesOverlay'
import KeyboardShortcutsOverlay from '../components/KeyboardShortcutsOverlay'
import HeaderOverlay from '../components/HeaderOverlay'

import { AutoSaveIndicator } from '../components/AutoSaveIndicator'

import UnifiedQuickTools from '../components/UnifiedQuickTools'
import { panelEventBus } from '../framework/PanelAPI'
import ContentArea from './ContentArea'
import Sidebar from './Sidebar'
import './MainLayout.css'

interface MainLayoutProps {
  // No longer need drawer props since we're removing the auxiliary drawer
}

const MainLayout: React.FC <MainLayoutProps> = () => {
  const params = useParams()
  const navigate = useNavigate()
  const initialPanel = (params.panelId as string) || 'character-stats'
  const [activePanelId, setActivePanelId] = useState <string>(initialPanel)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const { state, setCharacter } = useGameStore()
  const [debugTiles, setDebugTiles] = useState<boolean>(false)

  // Keep URL in sync when panel changes
  useEffect(() => {
    const current = (params.panelId as string) || 'character-stats'
    const validCurrent = panelRegistry.getPanel(current) ? current : 'character-stats'
    if (activePanelId !== validCurrent) {
      navigate(panelLink(activePanelId), { replace: true })
    }
  }, [activePanelId])

  // Keep state in sync if the URL changes (e.g., user navigates directly)
  useEffect(() => {
    const current = (params.panelId as string) || 'character-stats'
    if (current !== activePanelId) {
      setActivePanelId(current)
    }
  }, [params.panelId])

  // Listen for navigation events from panels
  useEffect(() => {
    const unsubscribe = panelEventBus.on('navigate', (event) => {
      if (event.data.panelId) {
        setActivePanelId(event.data.panelId)
      }
    })

    return unsubscribe
  }, [])

  // Ensure we have an active character for demo/troubleshooting
  useEffect(() => {
    if (!state.activeCharacterId) {
      setCharacter(createDummyCharacter())
    }
  }, [state.activeCharacterId, setCharacter])

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

  // Auto-position HP clone over the real HP card
  const hpCloneRef = useRef<HTMLDivElement | null>(null)
  const combatCloneRef = useRef<HTMLDivElement | null>(null)
  const xpCloneRef = useRef<HTMLDivElement | null>(null)
  const loadCloneRef = useRef<HTMLDivElement | null>(null)
  const classFocusCloneRef = useRef<HTMLDivElement | null>(null)
  const debilitiesCloneRef = useRef<HTMLDivElement | null>(null)
  const attributesCloneRef = useRef<HTMLDivElement | null>(null)
  const prefsCloneRef = useRef<HTMLDivElement | null>(null)
  const shortcutsCloneRef = useRef<HTMLDivElement | null>(null)
  const headerCloneRef = useRef<HTMLDivElement | null>(null)
  const [hpRect, setHpRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [combatRect, setCombatRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [xpRect, setXpRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [progressRect, setProgressRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [loadRect, setLoadRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [statusRect, setStatusRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [classFocusRect, setClassFocusRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [debilitiesRect, setDebilitiesRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [attributesRect, setAttributesRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [prefsRect, setPrefsRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [titleRect, setTitleRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [shortcutsRect, setShortcutsRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [headerRect, setHeaderRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const titleCloneRef = useRef<HTMLDivElement | null>(null)
  
  // Dynamically size overlay clones to their content and sync placeholder min-heights
  const applyOverlaySizingOnce = (el: HTMLElement | null, placeholderSelector: string) => {
    if (!el) return
    const placeholder = document.querySelector(placeholderSelector) as HTMLElement | null
    const gridUnit = (() => {
      const val = getComputedStyle(document.documentElement).getPropertyValue('--grid-unit')
      const n = parseFloat(val)
      return Number.isFinite(n) && n > 0 ? n : 16
    })()
    const measure = () => {
      const inner = el.querySelector('.overlay-clone-content') as HTMLElement | null
      const raw = inner?.scrollHeight || el.getBoundingClientRect().height
      const rounded = Math.ceil(raw / gridUnit) * gridUnit
      el.style.height = `${rounded}px`
      if (placeholder) placeholder.style.minHeight = `${rounded}px`
    }
    // Initial and on next frame for layout
    measure()
    requestAnimationFrame(measure)
    const inner = el.querySelector('.overlay-clone-content') as HTMLElement | null
    if (inner && !(inner as any).__ro) {
      const ro = new ResizeObserver(() => measure())
      ro.observe(inner)
      ;(inner as any).__ro = ro
    }
  }
  useLayoutEffect(() => {
    let rafId: number | null = null
    let mo: MutationObserver | null = null
    const gridUnit = (() => {
      const val = getComputedStyle(document.documentElement).getPropertyValue('--grid-unit')
      const n = parseFloat(val)
      return Number.isFinite(n) && n > 0 ? n : 16
    })()
    const snap = (v: number) => Math.round(v / gridUnit) * gridUnit
    const snapRect = (r: DOMRect) => ({ left: snap(r.left), top: snap(r.top), width: snap(r.width), height: snap(r.height) })
    const update = () => {
      const el = document.querySelector('.stat-card--hp') as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      const rs = snapRect(r)
      // Use viewport coordinates for fixed positioning (snapped to grid)
      setHpRect(rs)
      const combat = document.querySelector('.stat-card--combat') as HTMLElement | null
      if (combat) {
        const cr = snapRect(combat.getBoundingClientRect())
        setCombatRect(cr)
      }
      const xpEl = document.querySelector('.stat-card--xp') as HTMLElement | null
      if (xpEl) {
        const xr = snapRect(xpEl.getBoundingClientRect())
        setXpRect(xr)
      }
      const progEl = document.querySelector('.stat-card--progress') as HTMLElement | null
      if (progEl) {
        const pr = snapRect(progEl.getBoundingClientRect())
        setProgressRect(pr)
      }
      const loadEl = document.querySelector('.stat-card--load') as HTMLElement | null
      if (loadEl) {
        const lr = snapRect(loadEl.getBoundingClientRect())
        setLoadRect(lr)
      }
      const statusEl = document.querySelector('.stat-card--status') as HTMLElement | null
      if (statusEl) {
        const sr = snapRect(statusEl.getBoundingClientRect())
        setStatusRect(sr)
      }
      const cfEl = document.querySelector('.stat-card--class-focus') as HTMLElement | null
      if (cfEl) {
        const cr = snapRect(cfEl.getBoundingClientRect())
        setClassFocusRect(cr)
      }
      const debEl = document.querySelector('.stat-card--debilities') as HTMLElement | null
      if (debEl) {
        const dr = snapRect(debEl.getBoundingClientRect())
        setDebilitiesRect(dr)
      }
      const attrEl = document.querySelector('.stat-card--attributes') as HTMLElement | null
      if (attrEl) {
        const ar = snapRect(attrEl.getBoundingClientRect())
        setAttributesRect(ar)
      }
      const headerEl = document.querySelector('.stat-card--header') as HTMLElement | null
      if (headerEl) {
        const hr = snapRect(headerEl.getBoundingClientRect())
        setHeaderRect(hr)
      }
      const titleEl = document.querySelector('.stat-card--pageTitle') as HTMLElement | null
      if (titleEl) {
        const tr = snapRect(titleEl.getBoundingClientRect())
        setTitleRect(tr)
      }
      const prefEl = document.querySelector('.stat-card--prefs') as HTMLElement | null
      if (prefEl) {
        const pr = snapRect(prefEl.getBoundingClientRect())
        setPrefsRect(pr)
      }
      // Shortcuts tile removed
    }
    update()
    // If HP element not yet in DOM, observe for it
    if (!document.querySelector('.stat-card--hp')) {
      mo = new MutationObserver(() => {
        const found = document.querySelector('.stat-card--hp')
        if (found) {
          update()
          mo && mo.disconnect()
          mo = null
        }
      })
      mo.observe(document.body, { childList: true, subtree: true })
    }
    const onResize = () => update()
    window.addEventListener('resize', onResize)

    // No sidebar hover-driven remeasurement; overlay handles movement

    return () => {
      window.removeEventListener('resize', onResize)
      if (rafId) cancelAnimationFrame(rafId)
      if (mo) mo.disconnect()
    }
  }, [activePanelId])

  // Toggle rail-open class on main-layout to avoid :has hover thrash when interacting with overlay
  const mainLayoutRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const sidebarEl = document.querySelector('.sidebar:not(.sidebar--hp-clone)')
    const root = mainLayoutRef.current
    if (!sidebarEl || !root) return
    let hoverTimer: number | null = null
    const open = () => root.classList.add('rail-open')
    const close = () => root.classList.remove('rail-open')
    const onEnter = () => {
      if (hoverTimer) window.clearTimeout(hoverTimer)
      open()
    }
    const onLeave = () => {
      if (hoverTimer) window.clearTimeout(hoverTimer)
      // small delay to ignore incidental hover transitions over panels
      hoverTimer = window.setTimeout(() => close(), 120)
    }
    sidebarEl.addEventListener('mouseenter', onEnter)
    sidebarEl.addEventListener('mouseleave', onLeave)
    return () => {
      sidebarEl.removeEventListener('mouseenter', onEnter)
      sidebarEl.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // Update overlay active layer when panel changes
  useEffect(() => {
    OverlayManager.setActiveLayer(activePanelId)
  }, [activePanelId])

  // Inline render mode: no overlay sizing required
  useLayoutEffect(() => {}, [])

  // Toggle overlays-active flag for scoped styling when clones are present
  useEffect(() => {
    const anyClone = !!(hpRect || combatRect || xpRect || loadRect || classFocusRect || debilitiesRect || attributesRect || prefsRect || headerRect || titleRect)
    document.body.classList.toggle('overlays-active', anyClone)
  }, [hpRect, combatRect, xpRect, loadRect, classFocusRect, debilitiesRect, attributesRect, prefsRect, headerRect, titleRect])

  // Debug tile toggle: adds/removes helper classes on body
  useEffect(() => {
    document.body.classList.toggle('debug-overlay-glass-off', debugTiles)
    document.body.classList.toggle('debug-placeholder-glass-off', debugTiles)
    return () => {
      document.body.classList.remove('debug-overlay-glass-off')
      document.body.classList.remove('debug-placeholder-glass-off')
    }
  }, [debugTiles])

  return (
    <div ref={mainLayoutRef} className="main-layout" data-active-panel={activePanelId}>

      {/* Grid places the sidebar in column 1 naturally */}
      <Sidebar
        activePanelId={activePanelId}
        onPanelSelect={(id) => { setActivePanelId(id) }}
      />

      <main className="main-layout__content bg-transparent">
        {/* Debug tile toggle */}
        <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1100 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={debugTiles} onChange={(e) => setDebugTiles(e.target.checked)} />
            <span style={{ userSelect: 'none' }}>Debug tiles</span>
          </label>
        </div>
        {/* HUD for character stats is rendered inside the panel for tighter data integration */}
        <ContentArea
          activePanelId={activePanelId}
        />
      </main>

      {/* Overlay root retained for future surfaces */}
      <div id="overlay-layer" />

      {/* HP inlined on panel: overlay removed */}

      {/* Inline render mode: Progress handled inline in panel */}

      {/* Inline render mode: Status handled inline in panel */}

      {/* Inline render mode: Class Focus handled inline */}

      {/* Debilities inlined as part of Status composite */}

      {/* Inline render mode: Attributes handled inline */}

      {/* Inline render mode: Preferences handled inline */}

      {/* Shortcuts overlay removed */}

      {/* Header/title overlays removed in inline mode */}


      {/* Unified Quick Tools removed (dice roller button hidden) */}

      {/* Auto-save indicator */}
      <AutoSaveIndicator
        status={autoSaveStatus}
        className="main-layout__autosave"
      />
    </div>
  )
}

export default MainLayout
