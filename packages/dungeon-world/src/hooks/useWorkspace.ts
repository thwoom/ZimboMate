import { useState, useEffect, useCallback } from 'react'
import { WorkspaceContext, SidebarState, InspectorState } from '../types/workspace'

export interface WorkspaceState {
  activeContext: WorkspaceContext
  sidebarState: SidebarState
  inspectorState: InspectorState
  activePanelId: string
  favoritesPanelIds: string[]
  recentPanelIds: string[]
}

const STORAGE_KEY = 'dw-workspace-state'

const defaultState: WorkspaceState = {
  activeContext: WorkspaceContext.PLAY,
  sidebarState: SidebarState.EXPANDED,
  inspectorState: InspectorState.OPEN,
  activePanelId: 'character-stats',
  favoritesPanelIds: ['character-stats', 'moves', 'equipment', 'spells'],
  recentPanelIds: ['character-stats', 'moves', 'equipment', 'spells', 'inventory', 'session-tools']
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState
    } catch {
      return defaultState
    }
  })

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore storage errors
    }
  }, [state])

  const setActiveContext = useCallback((context: WorkspaceContext) => {
    setState(prev => ({ ...prev, activeContext: context }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState(prev => ({
      ...prev,
      sidebarState: prev.sidebarState === SidebarState.EXPANDED 
        ? SidebarState.COLLAPSED 
        : SidebarState.EXPANDED
    }))
  }, [])

  const toggleInspector = useCallback(() => {
    setState(prev => ({
      ...prev,
      inspectorState: prev.inspectorState === InspectorState.OPEN 
        ? InspectorState.CLOSED 
        : InspectorState.OPEN
    }))
  }, [])

  const setActivePanelId = useCallback((panelId: string) => {
    setState(prev => {
      const newRecentPanelIds = [panelId, ...prev.recentPanelIds.filter(id => id !== panelId)].slice(0, 10)
      return {
        ...prev,
        activePanelId: panelId,
        recentPanelIds: newRecentPanelIds
      }
    })
  }, [])

  const addToFavorites = useCallback((panelId: string) => {
    setState(prev => ({
      ...prev,
      favoritesPanelIds: prev.favoritesPanelIds.includes(panelId) 
        ? prev.favoritesPanelIds 
        : [...prev.favoritesPanelIds, panelId]
    }))
  }, [])

  const removeFromFavorites = useCallback((panelId: string) => {
    setState(prev => ({
      ...prev,
      favoritesPanelIds: prev.favoritesPanelIds.filter(id => id !== panelId)
    }))
  }, [])

  const toggleFavorite = useCallback((panelId: string) => {
    setState(prev => ({
      ...prev,
      favoritesPanelIds: prev.favoritesPanelIds.includes(panelId)
        ? prev.favoritesPanelIds.filter(id => id !== panelId)
        : [...prev.favoritesPanelIds, panelId]
    }))
  }, [])

  return {
    ...state,
    setActiveContext,
    toggleSidebar,
    toggleInspector,
    setActivePanelId,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite
  }
}