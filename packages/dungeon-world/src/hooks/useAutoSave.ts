import type { GameState } from '../models/GameState'

import { useCallback, useEffect, useRef } from 'react'
import { DataPersistenceService } from '../services/DataPersistence'

interface AutoSaveOptions {
  enabled?: boolean
  debounceMs?: number
  key?: string
  onSave?: (state: GameState) => void
  onError?: (error: Error) => void
}

export function useAutoSave(
  state: GameState,
  options: AutoSaveOptions = {},
) {
  const {
    enabled = true,
    debounceMs = 2000,
    key = 'autosave',
    onSave,
    onError,
  } = options

  const saveTimeout = useRef <ReturnType <typeof setTimeout> | null>(null)
  const previousState = useRef <GameState | null>(null)
  const isSaving = useRef(false)

  const performSave = useCallback(async (stateToSave: GameState) => {
    if (isSaving.current)
      return

    try {
      isSaving.current = true
      await DataPersistenceService.getInstance().saveGame(stateToSave, undefined, key)

      // Update saved indicator
      if (onSave) {
        onSave(stateToSave)
      }
    }
    catch (e) {
      if (onError) {
        onError(e as Error)
      }
    }
    finally {
      isSaving.current = false
    }
  }, [key, onSave, onError])

  const debouncedSave = useCallback((newState: GameState) => {
    // Clear unknown pending save
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }

    // Schedule new save
    saveTimeout.current = setTimeout(() => {
      performSave(newState)
    }, debounceMs)
  }, [performSave, debounceMs])

  useEffect(() => {
    if (!enabled || !state || !state.isDirty)
      return

    // Check if state has actually changed
    const hasChanged = JSON.stringify(state) !== JSON.stringify(previousState.current)
    if (!hasChanged)
      return

    previousState.current = state
    debouncedSave(state)

    // Cleanup on unmount
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
        // Perform immediate save on unmount if there's pending changes
        if (state.isDirty) {
          performSave(state)
        }
      }
    }
  }, [state, enabled, debouncedSave, performSave])

  // Force save method
  const forceSave = useCallback(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }
    performSave(state)
  }, [state, performSave])

  return { isSaving: isSaving.current, forceSave }
}

// Hook to show auto-save status
export function useAutoSaveStatus() {
  const lastSaveTime = useRef <Date | null>(null)
  const saveStatus = useRef<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const updateStatus = useCallback((status: 'saving' | 'saved' | 'error') => {
    saveStatus.current = status
    if (status === 'saved') {
      lastSaveTime.current = new Date()
    }
  }, [])

  const getStatusMessage = useCallback(() => {
    switch (saveStatus.current) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        if (lastSaveTime.current) {
          const seconds = Math.floor((Date.now() - lastSaveTime.current.getTime()) / 1000)
          if (seconds < 60)
            return 'Saved just now'
          if (seconds < 3600)
            return `Saved ${Math.floor(seconds / 60)} min ago`
          return `Saved ${Math.floor(seconds / 3600)} hours ago`
        }
        return 'Saved'
      case 'error':
        return 'Save failed'
      default:
        return ''
    }
  }, [])

  return {
    status: saveStatus.current,
    lastSaveTime: lastSaveTime.current,
    updateStatus,
    getStatusMessage,
  }
}
