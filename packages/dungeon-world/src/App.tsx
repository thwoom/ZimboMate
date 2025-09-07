import React, { useEffect, useState } from 'react'

import DarkModeToggle from './components/DarkModeToggle'

import ErrorBoundary from './components/ErrorBoundary'
import { panelRegistry } from './framework/PanelRegistry'
import MainLayout from './layouts/MainLayout'
import AlignmentXPTrackerPanel from './panels/AlignmentXPTrackerPanel/AlignmentXPTrackerPanel'
import BondTrackerPanel from './panels/BondTrackerPanel/BondTrackerPanel'
import CampaignPanel from './panels/CampaignPanel'
import CharacterCreationPanel from './panels/CharacterCreationPanel'
import CharacterStatsPanel from './panels/CharacterStatsPanel'
import ConditionTrackerPanel from './panels/ConditionTrackerPanel/ConditionTrackerPanel'
// Heavy panels will be lazily imported and registered
import EquipmentPanel from './panels/EquipmentPanel'
import SessionToolsPanel from './panels/SessionToolsPanel'
import { InventoryPanel } from './panels/InventoryPanel'
// MoveLibraryPanel will be lazy-loaded
import MovesPanel from './panels/MovesPanel'
import ConditionalContentSettings from './panels/SettingsPanel/ConditionalContentSettings'
import IntegrationSettings from './panels/SettingsPanel/IntegrationSettings'
import { createPlaceholderPanel } from './panels/PlaceholderPanel'
import { SpecialMovesPanel } from './panels/SpecialMovesPanel'
import { SpellPanel } from './panels/SpellPanel'
import TestPlaygroundPanel from './panels/TestPlayground'
import { GameStoreProvider, useSettings } from './store/GameStore'
import { panelDiagnostics } from './utils/panelDiagnostics'
import { panelRecoveryManager } from './utils/panelRecovery'
import ShortcutsOverlay from './components/ShortcutsOverlay'
import './components/ShortcutsOverlay.css'
const R3FOverlays = {
  R3FHudOverlay: React.lazy(() => import('./components/ui/r3f-overlays').then(m => ({ default: m.R3FHudOverlay }))),
  R3FIntroOverlay: React.lazy(() => import('./components/ui/r3f-overlays').then(m => ({ default: m.R3FIntroOverlay }))),
}
import ContextMenu, { type MenuItem } from './components/ContextMenu'
import { HUDToaster } from './components/ui/toast'
// import { PanelDebugger, testPanel } from './debug/PanelDebugger';
import './App.css'

function AppInner() {
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [menuState, setMenuState] = useState<{ open: boolean, x: number, y: number, items: MenuItem[] }>({ open: false, x: 0, y: 0, items: [] })
  const settings = useSettings()

  useEffect(() => {
    const root = document.querySelector('.app') as HTMLElement | null
    if (root)
      root.style.setProperty('--tt-delay', `${settings.integration?.tooltipDelayMs ?? 0}ms`)
  }, [settings.integration?.tooltipDelayMs])

  useEffect(() => {
    const onToggle = () => settings.integration?.overlayEnabled && setShowShortcuts(v => !v)
    window.addEventListener('shortcuts:toggle-overlay', onToggle as EventListener)
    return () => window.removeEventListener('shortcuts:toggle-overlay', onToggle as EventListener)
  }, [settings.integration?.overlayEnabled])

  useEffect(() => {
    if (!settings.integration?.contextMenuEnabled)
      return
    const onContext = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const appRoot = document.querySelector('.app')
      if (appRoot && appRoot.contains(target)) {
        e.preventDefault()
        const items: MenuItem[] = [
          { id: 'favorite', label: 'Add to Favorites', onSelect: () => window.dispatchEvent(new CustomEvent('menu:add-favorite')) },
          { id: 'copy', label: 'Copy Panel Link', onSelect: () => navigator.clipboard?.writeText(window.location.href).catch(() => {}) },
          { id: 'disabled', label: 'Inspect (coming soon)', onSelect: () => {}, disabled: true, disabledReason: 'Dev tool' },
        ]
        setMenuState({ open: true, x: e.clientX, y: e.clientY, items })
      }
    }
    window.addEventListener('contextmenu', onContext)
    return () => window.removeEventListener('contextmenu', onContext)
  }, [settings.integration?.contextMenuEnabled])

  return (
    <div className="app">
      <DarkModeToggle />
      <MainLayout />
      <HUDToaster />
      <React.Suspense fallback={null}>
        {settings.uiOverlays?.r3fHudEnabled !== false && <R3FOverlays.R3FHudOverlay enabled />}
        {settings.uiOverlays?.introSceneEnabled !== false && <R3FOverlays.R3FIntroOverlay enabled />}
      </React.Suspense>
      {menuState.open && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          items={menuState.items}
          onClose={() => setMenuState(s => ({ ...s, open: false }))}
        />
      )}
      {showShortcuts && (
        <ShortcutsOverlay onClose={() => setShowShortcuts(false)} />
      )}
      {/* <PanelDebugger /> */}
    </div>
  )
}

function App() {
  useEffect(() => {
    // Initialize recovery and diagnostic tools (only when debug mode is enabled)
    // To enable: localStorage.setItem('zimbomate-debug-mode', 'true')
    panelRecoveryManager.injectRecoveryTools()
    panelDiagnostics.injectDiagnosticTools()

    // Clear unknown existing panels first to prevent duplicates
    panelRegistry.clear()

    // Register panels with error handling
    const panelsToRegister = [
      CharacterCreationPanel,
      CharacterStatsPanel,
      EquipmentPanel,
      MovesPanel,
      ConditionalContentSettings,
      IntegrationSettings,
      SpellPanel,
      SpecialMovesPanel,
      CampaignPanel,
      TestPlaygroundPanel,
      // Lazy panels registered after initial frame (defer heavy code)
      // MoveLibraryPanel,
      // ContentStudioPanelInstance,
      // EquipmentCompendiumPanel,
      BondTrackerPanel,
      AlignmentXPTrackerPanel,
      ConditionTrackerPanel,
      InventoryPanel,
      SessionToolsPanel,
      createPlaceholderPanel('lore-journal', 'Lore & Journal', '📖'),
    ]

    for (const [index, panel] of panelsToRegister.entries()) {
      try {
        panelRegistry.register(panel)
      }
      catch (error) {
        // In development, provide recovery option
        if (process.env.NODE_ENV === 'development') {
          console.warn('Panel registration failed:', error)
        }
      }
    }

    // Defer heavy panels to next tick for initial TTI improvement
    setTimeout(async () => {
      try {
        const [{ default: MoveLibraryPanel }, { ContentStudioPanelInstance }, { default: EquipmentCompendiumPanel }] = await Promise.all([
          import('./panels/MoveLibraryPanel'),
          import('./panels/ContentStudioPanel/ContentStudioPanel'),
          import('./panels/EquipmentCompendiumPanel/EquipmentCompendiumPanel'),
        ])
        panelRegistry.register(MoveLibraryPanel)
        panelRegistry.register(ContentStudioPanelInstance)
        panelRegistry.register(EquipmentCompendiumPanel)
      } catch (e) {
        if (process.env.NODE_ENV === 'development') console.warn('Deferred panel load failed', e)
      }
    }, 0)

    // Log registry health after registration
    const _healthInfo = panelRegistry.getHealthInfo()
    // Check for registration errors
    const registrationErrors = panelRegistry.getRegistrationErrors()
    if (registrationErrors.length > 0) {
      console.warn('Registration errors found:', registrationErrors)
    }

    // Run diagnostics after registration
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        const diagnostics = panelDiagnostics.runDiagnostics()
        if (diagnostics.issues.length > 0) {
          console.warn('Diagnostics found issues, attempting automatic repair...')
        }
      }, 1000)
    }

    return () => {
      // Clean up on unmount
      panelRegistry.clear()
    }
  }, []) // Empty dependency array ensures this only runs once

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error occurred, attempting recovery...')
        }
      }}
    >
      <GameStoreProvider>
        <AppInner />
      </GameStoreProvider>
    </ErrorBoundary>
  )
}

export default App
