import { useCallback } from 'react'
import { useGameStore } from '../store/GameStore'

export function usePanelState<T extends object = Record<string, unknown>>(panelId: string, initial: T) {
  const { state, updateUIState } = useGameStore()
  const current = (state.ui.panelState && state.ui.panelState[panelId]) || initial

  const setState = useCallback((updates: Partial<T>) => {
    const next = { ...(state.ui.panelState?.[panelId] || initial), ...updates }
    updateUIState({ panelState: { ...(state.ui.panelState || {}), [panelId]: next } })
  }, [panelId, state.ui.panelState, initial, updateUIState])

  return [current as T, setState] as const
}


