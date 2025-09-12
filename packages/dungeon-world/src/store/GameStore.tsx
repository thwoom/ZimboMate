/**
 * Game state store using React Context
 */

import type { Character } from '../models/Character'

import type {
  GameState,
  GameStateAction,
} from '../models/GameState'
import type { Inventory } from '../models/Inventory'
import { createEmptyInventory } from '../models/Inventory'
import type { Move } from '../models/Move'
import type { Session } from '../models/Session'
import type { SaveSlot } from '../services/DataPersistence'
import React, { createContext, use, useCallback, useEffect, useReducer, useState } from 'react'
import { useAutoSave } from '../hooks/useAutoSave'
import {
  createInitialGameState,
  gameStateReducer,
} from '../models/GameState'
import { dataPersistence } from '../services/DataPersistence'

// Context types
interface GameStoreContextType {
  state: GameState
  dispatch: React.Dispatch <GameStateAction>

  // Convenience methods
  setCharacter: (character: Character) => void
  updateCharacter: (characterId: string, updates: Partial <Character>) => void
  updateInventory: (characterId: string, updates: Partial <Inventory>) => void
  addMove: (move: Move) => void
  updateMove: (id: string, changes: Partial <Move>) => void
  removeMove: (id: string) => void
  updateSession: (updates: Partial <Session>) => void
  updateUIState: (updates: Partial <GameState['ui']>) => void
  updateSettings: (updates: Partial <GameState['settings']>) => void
  updateGameState: (newState: GameState) => void
  saveGame: (slotName?: string) => Promise <void>
  loadGame: (slotId?: string) => Promise <boolean>
  resetGame: () => void
  quickSave: () => Promise <void>
  getSaveSlots: () => Promise <SaveSlot[]>
  deleteSaveSlot: (slotId: string) => Promise <void>
  exportSave: () => Promise <void>
  importSave: (file: File) => Promise <boolean>
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  toggleAutoSave: (enabled: boolean) => void
}

// Create contexts
const GameStoreContext = createContext <GameStoreContextType | undefined>(undefined)

// Provider component
export const GameStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameStateReducer, createInitialGameState())
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  // Convenience methods
  const setCharacter = useCallback((character: Character) => {
    dispatch({ type: 'ADD_CHARACTER', payload: character })
    dispatch({ type: 'SET_ACTIVE_CHARACTER', payload: character.id })
    // Ensure an inventory exists for this character
    dispatch({ type: 'SET_INVENTORY', payload: { characterId: character.id, inventory: createEmptyInventory() } })
  }, [])

  const updateCharacter = useCallback((characterId: string, updates: Partial <Character>) => {
    dispatch({ type: 'UPDATE_CHARACTER', payload: { id: characterId, updates } })
  }, [])

  const updateInventory = useCallback((characterId: string, updates: Partial <Inventory>) => {
    dispatch({ type: 'UPDATE_INVENTORY', payload: { characterId, updates } })
  }, [])

  const addMove = useCallback((move: Move) => {
    dispatch({ type: 'ADD_MOVE', payload: move })
  }, [])

  const updateMove = useCallback((id: string, changes: Partial <Move>) => {
    dispatch({ type: 'UPDATE_MOVE', payload: { id, changes } })
  }, [])

  const removeMove = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_MOVE', payload: id })
  }, [])

  const updateSession = useCallback((updates: Partial <Session>) => {
    dispatch({ type: 'UPDATE_SESSION', payload: updates })
  }, [])

  const updateUIState = useCallback((updates: Partial <GameState['ui']>) => {
    dispatch({ type: 'SET_UI_STATE', payload: updates })
  }, [])

  const updateSettings = useCallback((updates: Partial <GameState['settings']>) => {
    dispatch({ type: 'SET_SETTINGS', payload: updates })
  }, [])

  // Save game to a slot
  const saveGame = useCallback(async (slotName?: string) => {
    try {
      await dataPersistence.saveGame(state, undefined, slotName)
      dispatch({ type: 'MARK_SAVED' })
    }
    catch (error) {
      throw error
    }
  }, [state])

  // Load game from a slot
  const loadGame = useCallback(async (slotId?: string): Promise <boolean> => {
    try {
      // If no slotId provided, try to load the most recent save
      if (!slotId) {
        const slots = await dataPersistence.getSaveSlots()
        if (slots.length === 0) {
          return false
        }
        slotId = slots[0].id
      }

      const loadedState = await dataPersistence.loadGame(slotId)
      if (!loadedState) {
        return false
      }

      dispatch({ type: 'LOAD_STATE', payload: loadedState })
      return true
    }
    catch {
      return false
    }
  }, [])

  // Quick save
  const quickSave = useCallback(async () => {
    try {
      await dataPersistence.quickSave(state)
      dispatch({ type: 'MARK_SAVED' })
    }
    catch (error) {
      throw error
    }
  }, [state])

  // Get save slots
  const getSaveSlots = useCallback(async () => {
    return dataPersistence.getSaveSlots()
  }, [])

  // Delete save slot
  const deleteSaveSlot = useCallback(async (slotId: string) => {
    return dataPersistence.deleteSaveSlot(slotId)
  }, [])

  // Export save
  const exportSave = useCallback(async () => {
    try {
      await dataPersistence.exportSave(state)
    }
    catch (error) {
      throw error
    }
  }, [state])

  // Import save
  const importSave = useCallback(async (file: File): Promise <boolean> => {
    try {
      const importedState = await dataPersistence.importSave(file)
      if (!importedState) {
        return false
      }
      dispatch({ type: 'LOAD_STATE', payload: importedState })
      return true
    }
    catch {
      return false
    }
  }, [])

  // Update entire game state (for imports)
  const updateGameState = useCallback((newState: GameState) => {
    dispatch({ type: 'REPLACE_STATE', payload: newState })
  }, [])

  // Reset game state
  const resetGame = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the game? This will clear all data.')) {
      dispatch({ type: 'RESET_STATE' })
      dataPersistence.clearAllSaves()
    }
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (state.settings.autoSave && state.isDirty) {
      const timeoutId = setTimeout(async () => {
        try {
          await dataPersistence.autoSave(state)
          dispatch({ type: 'MARK_SAVED' })
        }
        catch {
        }
      }, state.settings.autoSaveInterval * 60 * 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [state.settings.autoSave, state.settings.autoSaveInterval, state.isDirty, state])

  // Load saved game on mount
  useEffect(() => {
    loadGame()
  }, [])

  // Enhanced auto-save with visual feedback
  const { forceSave } = useAutoSave(state, {
    enabled: autoSaveEnabled && state.settings.autoSave,
    debounceMs: 2000,
    key: 'autosave',
    onSave: () => {
      setAutoSaveStatus('saved')
      dispatch({ type: 'MARK_SAVED' })
    },
    onError: (error) => {
      setAutoSaveStatus('error')
    },
  })

  const toggleAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveEnabled(enabled)
  }, [])

  const value: GameStoreContextType = {
    state,
    dispatch,
    setCharacter,
    updateCharacter,
    updateInventory,
    addMove,
    updateMove,
    removeMove,
    updateSession,
    updateUIState,
    updateSettings,
    updateGameState,
    saveGame,
    loadGame,
    resetGame,
    quickSave,
    getSaveSlots,
    deleteSaveSlot,
    exportSave,
    importSave,
    autoSaveStatus,
    toggleAutoSave,
  }

  return (
    <GameStoreContext value={value}>
      {children}
    </GameStoreContext>
  )
}

// Hook to use game store
export function useGameStore(): GameStoreContextType {
  const context = use(GameStoreContext)
  if (!context) {
    throw new Error('useGameStore must be used within a GameStoreProvider')
  }
  return context
}

// Selector hooks for specific parts of state
export function useCharacter() {
  const { state } = useGameStore()
  return state.activeCharacterId ? state.characters[state.activeCharacterId] : null
}

export function useInventory() {
  const { state } = useGameStore()
  return state.activeCharacterId ? state.inventories[state.activeCharacterId] : null
}

export function useMoves() {
  const { state } = useGameStore()
  return [...state.moves, ...state.customMoves]
}

export function useSession() {
  const { state } = useGameStore()
  return state.session
}

export function useUIState() {
  const { state } = useGameStore()
  return state.ui
}

export function useSettings() {
  const { state } = useGameStore()
  return state.settings
}
