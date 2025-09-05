import { useCallback } from 'react'
import { useGameStore } from '../store/GameStore'
import { panelStateManager } from '../framework/PanelState'

export function usePanelState<T extends object = Record<string, unknown>>(panelId: string, initial: T) {
  const { state, updateUIState } = useGameStore()
  const persisted = panelStateManager.loadState(panelId) as T | null
  const current = (state.ui.panelState && state.ui.panelState[panelId]) || persisted || initial

  const setState = useCallback((updates: Partial<T>) => {
    const next = { ...(state.ui.panelState?.[panelId] || current), ...updates }
    updateUIState({ panelState: { ...(state.ui.panelState || {}), [panelId]: next } })
    try { panelStateManager.saveState(panelId, next) } catch {}
  }, [panelId, state.ui.panelState, initial, updateUIState])

  return [current as T, setState] as const
}


