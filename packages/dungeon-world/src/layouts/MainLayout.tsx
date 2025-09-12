import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { panelRegistry } from '../framework/PanelRegistry'
import { panelLink } from '../lib/routes'
import HpOverlay from '../components/HpOverlay'
import { OverlayManager } from '../framework/OverlayManager'
import CombatOverlay from '../components/CombatOverlay'
import XpOverlay from '../components/XpOverlay'
import { useGameStore } from '../store/GameStore'
import { createDummyCharacter } from '../models/Character'
import LoadOverlay from '../components/LoadOverlay'
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
  const [loadRect, setLoadRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [classFocusRect, setClassFocusRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [debilitiesRect, setDebilitiesRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [attributesRect, setAttributesRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [prefsRect, setPrefsRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [shortcutsRect, setShortcutsRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  const [headerRect, setHeaderRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)
  
  // Dynamically size overlay clones to their content and sync placeholder min-heights
  const applyOverlaySizingOnce = (el: HTMLElement | null, placeholderSelector: string) => {
    if (!el) return
    const placeholder = document.querySelector(placeholderSelector) as HTMLElement | null
    const measure = () => {
      const inner = el.querySelector('.overlay-clone-content') as HTMLElement | null
      const contentHeight = inner?.scrollHeight || el.getBoundingClientRect().height
      el.style.height = `${contentHeight}px`
      if (placeholder) placeholder.style.minHeight = `${contentHeight}px`
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
    const update = () => {
      const el = document.querySelector('.stat-card--hp') as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      // Use viewport coordinates for fixed positioning
      setHpRect({ left: r.left, top: r.top, width: r.width, height: r.height })
      const combat = document.querySelector('.stat-card--combat') as HTMLElement | null
      if (combat) {
        const cr = combat.getBoundingClientRect()
        setCombatRect({ left: cr.left, top: cr.top, width: cr.width, height: cr.height })
      }
      const xpEl = document.querySelector('.stat-card--xp') as HTMLElement | null
      if (xpEl) {
        const xr = xpEl.getBoundingClientRect()
        setXpRect({ left: xr.left, top: xr.top, width: xr.width, height: xr.height })
      }
      const loadEl = document.querySelector('.stat-card--load') as HTMLElement | null
      if (loadEl) {
        const lr = loadEl.getBoundingClientRect()
        setLoadRect({ left: lr.left, top: lr.top, width: lr.width, height: lr.height })
      }
      const cfEl = document.querySelector('.stat-card--class-focus') as HTMLElement | null
      if (cfEl) {
        const cr = cfEl.getBoundingClientRect()
        setClassFocusRect({ left: cr.left, top: cr.top, width: cr.width, height: cr.height })
      }
      const debEl = document.querySelector('.stat-card--debilities') as HTMLElement | null
      if (debEl) {
        const dr = debEl.getBoundingClientRect()
        setDebilitiesRect({ left: dr.left, top: dr.top, width: dr.width, height: dr.height })
      }
      const attrEl = document.querySelector('.stat-card--attributes') as HTMLElement | null
      if (attrEl) {
        const ar = attrEl.getBoundingClientRect()
        setAttributesRect({ left: ar.left, top: ar.top, width: ar.width, height: ar.height })
      }
      const headerEl = document.querySelector('.stat-card--header') as HTMLElement | null
      if (headerEl) {
        const hr = headerEl.getBoundingClientRect()
        setHeaderRect({ left: hr.left, top: hr.top, width: hr.width, height: hr.height })
      }
      const prefEl = document.querySelector('.stat-card--prefs') as HTMLElement | null
      if (prefEl) {
        const pr = prefEl.getBoundingClientRect()
        setPrefsRect({ left: pr.left, top: pr.top, width: pr.width, height: pr.height })
      }
      const scEl = document.querySelector('.stat-card--shortcuts') as HTMLElement | null
      if (scEl) {
        const sr = scEl.getBoundingClientRect()
        setShortcutsRect({ left: sr.left, top: sr.top, width: sr.width, height: sr.height })
      }
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

  // Recompute overlay heights whenever rects update
  useLayoutEffect(() => {
    applyOverlaySizingOnce(hpCloneRef.current, '.stat-card--hp')
    applyOverlaySizingOnce(combatCloneRef.current, '.stat-card--combat')
    applyOverlaySizingOnce(xpCloneRef.current, '.stat-card--xp')
    applyOverlaySizingOnce(loadCloneRef.current, '.stat-card--load')
    applyOverlaySizingOnce(classFocusCloneRef.current, '.stat-card--class-focus')
    applyOverlaySizingOnce(debilitiesCloneRef.current, '.stat-card--debilities')
    applyOverlaySizingOnce(attributesCloneRef.current, '.stat-card--attributes')
    applyOverlaySizingOnce(prefsCloneRef.current, '.stat-card--prefs')
    applyOverlaySizingOnce(shortcutsCloneRef.current, '.stat-card--shortcuts')
    applyOverlaySizingOnce(headerCloneRef.current, '.stat-card--header')
  }, [hpRect, combatRect, xpRect, loadRect, classFocusRect, debilitiesRect, attributesRect, prefsRect, shortcutsRect, headerRect])

  return (
    <div ref={mainLayoutRef} className="main-layout" data-active-panel={activePanelId}>

      {/* Grid places the sidebar in column 1 naturally */}
      <Sidebar
        activePanelId={activePanelId}
        onPanelSelect={(id) => { setActivePanelId(id) }}
      />

      <main className="main-layout__content bg-transparent">
        <div className="content-float bg-transparent">
          {/* HUD for character stats is rendered inside the panel for tighter data integration */}
          <ContentArea
            activePanelId={activePanelId}
          />
        </div>
      </main>

      {/* Overlay root retained for future surfaces */}
      <div id="overlay-layer" />

      {/* HP clone surface as sibling to sidebar for identical compositing */}
      {hpRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            hpCloneRef.current = el
            if (el) {
              // Register this overlay under the character-stats layer
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((hpCloneRef.current as any)?.__unreg) {
              ;(hpCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: hpRect.left, top: hpRect.top, width: hpRect.width, minHeight: hpRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <HpOverlay />
            </div>
          </div>
        </div>
      )}

      {/* Combat overlay: anchored to combat card */}
      {combatRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            combatCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((combatCloneRef.current as any)?.__unreg) {
              ;(combatCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: combatRect.left, top: combatRect.top, width: combatRect.width, minHeight: combatRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <CombatOverlay />
            </div>
          </div>
        </div>
      )}

      {/* XP overlay: anchored to XP card */}
      {xpRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            xpCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((xpCloneRef.current as any)?.__unreg) {
              ;(xpCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: xpRect.left, top: xpRect.top, width: xpRect.width, minHeight: xpRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <XpOverlay />
            </div>
          </div>
        </div>
      )}

      {/* Load overlay: anchored to Load card */}
      {loadRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            loadCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((loadCloneRef.current as any)?.__unreg) {
              ;(loadCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: loadRect.left, top: loadRect.top, width: loadRect.width, minHeight: loadRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <LoadOverlay />
            </div>
          </div>
        </div>
      )}

      {/* Class Focus overlay */}
      {classFocusRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            classFocusCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((classFocusCloneRef.current as any)?.__unreg) {
              ;(classFocusCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: classFocusRect.left, top: classFocusRect.top, width: classFocusRect.width, minHeight: classFocusRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <ClassFocusOverlay />
            </div>
          </div>
        </div>
      )}

      {/* Debilities overlay */}
      {debilitiesRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            debilitiesCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((debilitiesCloneRef.current as any)?.__unreg) {
              ;(debilitiesCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: debilitiesRect.left, top: debilitiesRect.top, width: debilitiesRect.width, minHeight: debilitiesRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <DebilitiesOverlay />
            </div>
          </div>
        </div>
      )}

      {/* Attributes overlay */}
      {attributesRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            attributesCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((attributesCloneRef.current as any)?.__unreg) {
              ;(attributesCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: attributesRect.left, top: attributesRect.top, width: attributesRect.width, minHeight: attributesRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <AttributesOverlay />
            </div>
          </div>
        </div>
      )}

      {/* Preferences overlay */}
      {prefsRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            prefsCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((prefsCloneRef.current as any)?.__unreg) {
              ;(prefsCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: prefsRect.left, top: prefsRect.top, width: prefsRect.width, minHeight: prefsRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <PreferencesOverlay />
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts overlay */}
      {shortcutsRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            shortcutsCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((shortcutsCloneRef.current as any)?.__unreg) {
              ;(shortcutsCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: shortcutsRect.left, top: shortcutsRect.top, width: shortcutsRect.width, minHeight: shortcutsRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <KeyboardShortcutsOverlay />
            </div>
          </div>
        </div>
      )}

      {/* Header overlay */}
      {headerRect && (
        <div
          className="sidebar sidebar--hp-clone"
          ref={(el) => {
            headerCloneRef.current = el
            if (el) {
              const unregister = OverlayManager.register('character-stats', el)
              ;(el as any).__unreg = unregister
            } else if ((headerCloneRef.current as any)?.__unreg) {
              ;(headerCloneRef.current as any).__unreg()
            }
          }}
          style={{ position: 'fixed', left: headerRect.left, top: headerRect.top, width: headerRect.width, minHeight: headerRect.height }}
        >
          <div className="sidebar__inner floating-glass">
            <div className="overlay-clone-content">
              <HeaderOverlay />
            </div>
          </div>
        </div>
      )}


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
