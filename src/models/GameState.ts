/**
 * Overall game state management for Dungeon World
 */

import type { Campaign } from './Campaign'
import type { Character } from './Character'
import type { ActiveCondition } from './Conditions'
import type { Inventory } from './Inventory'
import type { ModifierSet, TemporaryModifier } from './Modifiers'
import type { Move } from './Move'
import type { Session } from './Session'
import type { SpellPreparation } from './Spell'
import { createEmptyInventory } from './Inventory'

// Application-wide settings
export interface AppSettings {
  theme: 'light' | 'dark'
  autoSave: boolean
  autoSaveInterval: number // minutes
  showRollAnimations: boolean
  confirmDangerousActions: boolean
  keyboardShortcuts: Record<string, string>
  integration?: {
    contextMenuEnabled: boolean
    tooltipDelayMs: number
    highContrastMenu: boolean
    suspendShortcutsOnDialog: boolean
    overlayEnabled: boolean
  }
  conditionalContent?: {
    global: {
      preferClassRelevant: boolean
      showAllMoves: boolean
      showAllEquipment: boolean
      showSpellsForNonCasters: boolean
    }
    perPanel: {
      moves: { overrideEnabled: boolean; showAll: boolean }
      equipment: { overrideEnabled: boolean; showAll: boolean }
      stats: { overrideEnabled: boolean; showSpells: boolean }
    }
  }
  sidebarPrefs?: {
    favorites: string[]
    collapsedSections: string[]
    order: string[]
    recents: string[]
  }
}

// Complete game state
export interface GameState {
  // Core data
  characters: Record<string, Character> // Multiple characters by ID
  activeCharacterId: string | null // Currently active character
  inventories: Record<string, Inventory> // Inventory per character
  moves: Move[]
  customMoves: Move[]
  session: Session

  // Advanced features
  spellPreparations: Record<string, SpellPreparation> // Spell prep per character
  modifiers: ModifierSet
  conditions: ActiveCondition[]
  campaign: Campaign | null

  // UI state
  ui: {
    activePanel: string
    sidePanelOpen: boolean
    auxiliaryDrawerOpen: boolean
    modalStack: string[]
    panelState?: Record<string, any>
  }

  // App settings
  settings: AppSettings

  // Metadata
  version: string
  lastSaved: Date | null
  isDirty: boolean // Has unsaved changes
}

// Action types for state updates
export type GameStateAction =
  | { type: 'ADD_CHARACTER'; payload: Character }
  | {
      type: 'UPDATE_CHARACTER'
      payload: { id: string; updates: Partial<Character> }
    }
  | { type: 'REMOVE_CHARACTER'; payload: string }
  | { type: 'SET_ACTIVE_CHARACTER'; payload: string }
  | { type: 'SET_CHARACTER'; payload: Character } // Legacy support
  | {
      type: 'SET_INVENTORY'
      payload: { characterId: string; inventory: Inventory }
    }
  | {
      type: 'UPDATE_INVENTORY'
      payload: { characterId: string; updates: Partial<Inventory> }
    }
  | { type: 'ADD_MOVE'; payload: Move }
  | { type: 'UPDATE_MOVE'; payload: { id: string; changes: Partial<Move> } }
  | { type: 'REMOVE_MOVE'; payload: string }
  | { type: 'SET_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: Partial<Session> }
  | { type: 'SET_UI_STATE'; payload: Partial<GameState['ui']> }
  | { type: 'SET_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_MODIFIER'; payload: TemporaryModifier }
  | { type: 'REMOVE_MODIFIER'; payload: string }
  | {
      type: 'UPDATE_MODIFIER'
      payload: { id: string; updates: Partial<TemporaryModifier> }
    }
  | { type: 'SET_MODIFIERS'; payload: ModifierSet }
  | { type: 'CLEAR_MODIFIERS' }
  | { type: 'MARK_SAVED' }
  | { type: 'MARK_DIRTY' }
  | { type: 'RESET_STATE' }
  | { type: 'REPLACE_STATE'; payload: GameState }
  | { type: 'LOAD_STATE'; payload: GameState }

// Utility functions

/**
 * Create initial game state
 */
export function createInitialGameState(): GameState {
  return {
    characters: {},
    activeCharacterId: null,
    inventories: {},
    moves: [],
    customMoves: [],
    session: {
      id: generateId(),
      startTime: new Date(),
      notes: [],
      rollHistory: [],
      events: [],
      trackers: [],
      bookmarks: [],
    },
    spellPreparations: {},
    modifiers: {
      modifiers: [],
      lastUpdated: new Date(),
    },
    conditions: [],
    campaign: null,
    ui: {
      activePanel: 'character',
      sidePanelOpen: true,
      auxiliaryDrawerOpen: false,
      modalStack: [],
      panelState: {},
    },
    settings: {
      theme: 'light',
      autoSave: true,
      autoSaveInterval: 5,
      showRollAnimations: true,
      confirmDangerousActions: true,
      keyboardShortcuts: {
        rollDamage: 'd',
        rollStat: 'r',
        quickSave: 'ctrl + s',
        toggleDrawer: 'ctrl + d',
      },
      integration: {
        contextMenuEnabled: true,
        tooltipDelayMs: 0,
        highContrastMenu: false,
        suspendShortcutsOnDialog: true,
        overlayEnabled: true,
      },
      conditionalContent: {
        global: {
          preferClassRelevant: true,
          showAllMoves: false,
          showAllEquipment: false,
          showSpellsForNonCasters: false,
        },
        perPanel: {
          moves: { overrideEnabled: false, showAll: false },
          equipment: { overrideEnabled: false, showAll: false },
          stats: { overrideEnabled: false, showSpells: false },
        },
      },
      sidebarPrefs: {
        favorites: [],
        collapsedSections: [],
        order: [],
        recents: [],
      },
    },
    version: '1.0.0',
    lastSaved: null,
    isDirty: false,
  }
}

/**
 * Game state reducer
 */
export function gameStateReducer(
  state: GameState,
  action: GameStateAction,
): GameState {
  switch (action.type) {
    case 'ADD_CHARACTER': {
      const charId = action.payload.id
      return {
        ...state,
        characters: {
          ...state.characters,
          [charId]: action.payload,
        },
        inventories: {
          ...state.inventories,
          [charId]: createEmptyInventory(),
        },
        activeCharacterId: state.activeCharacterId || charId,
        isDirty: true,
      }
    }

    case 'UPDATE_CHARACTER': {
      const { id, updates } = action.payload
      if (!state.characters[id]) return state
      return {
        ...state,
        characters: {
          ...state.characters,
          [id]: {
            ...state.characters[id],
            ...updates,
            updatedAt: new Date(),
          },
        },
        isDirty: true,
      }
    }

    case 'REMOVE_CHARACTER': {
      const newCharacters = { ...state.characters }
      const newInventories = { ...state.inventories }
      delete newCharacters[action.payload]
      delete newInventories[action.payload]

      const remainingIds = Object.keys(newCharacters)
      const newActiveId =
        state.activeCharacterId === action.payload
          ? remainingIds.length > 0
            ? remainingIds[0]
            : null
          : state.activeCharacterId

      return {
        ...state,
        characters: newCharacters,
        inventories: newInventories,
        activeCharacterId: newActiveId,
        isDirty: true,
      }
    }

    case 'SET_ACTIVE_CHARACTER':
      return {
        ...state,
        activeCharacterId: action.payload,
        isDirty: true,
      }

    case 'SET_CHARACTER': {
      // Legacy support-adds character and sets as active
      const legacyId = action.payload.id
      return {
        ...state,
        characters: {
          ...state.characters,
          [legacyId]: action.payload,
        },
        inventories: {
          ...state.inventories,
          [legacyId]: state.inventories[legacyId] || createEmptyInventory(),
        },
        activeCharacterId: legacyId,
        isDirty: true,
      }
    }

    case 'SET_INVENTORY': {
      const { characterId, inventory } = action.payload
      return {
        ...state,
        inventories: {
          ...state.inventories,
          [characterId]: inventory,
        },
        isDirty: true,
      }
    }

    case 'UPDATE_INVENTORY': {
      const invCharId = action.payload.characterId
      const invUpdates = action.payload.updates
      if (!state.inventories[invCharId]) return state
      return {
        ...state,
        inventories: {
          ...state.inventories,
          [invCharId]: {
            ...state.inventories[invCharId],
            ...invUpdates,
            lastUpdated: new Date(),
          },
        },
        isDirty: true,
      }
    }

    case 'ADD_MOVE':
      return {
        ...state,
        customMoves: [...state.customMoves, action.payload],
        isDirty: true,
      }

    case 'UPDATE_MOVE':
      return {
        ...state,
        customMoves: state.customMoves.map((move) =>
          move.id === action.payload.id
            ? { ...move, ...action.payload.changes }
            : move,
        ),
        isDirty: true,
      }

    case 'REMOVE_MOVE':
      return {
        ...state,
        customMoves: state.customMoves.filter(
          (move) => move.id !== action.payload,
        ),
        isDirty: true,
      }

    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        isDirty: true,
      }

    case 'UPDATE_SESSION':
      return {
        ...state,
        session: {
          ...state.session,
          ...action.payload,
        },
        isDirty: true,
      }

    case 'SET_UI_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          ...action.payload,
        },
      }

    case 'SET_SETTINGS':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
        isDirty: true,
      }

    case 'ADD_MODIFIER': {
      return {
        ...state,
        modifiers: {
          ...state.modifiers,
          modifiers: [...state.modifiers.modifiers, action.payload],
        },
        isDirty: true,
      }
    }

    case 'REMOVE_MODIFIER': {
      return {
        ...state,
        modifiers: {
          ...state.modifiers,
          modifiers: state.modifiers.modifiers.filter(
            (m) => m.id !== action.payload,
          ),
        },
        isDirty: true,
      }
    }

    case 'UPDATE_MODIFIER': {
      return {
        ...state,
        modifiers: {
          ...state.modifiers,
          modifiers: state.modifiers.modifiers.map((m) =>
            m.id === action.payload.id
              ? { ...m, ...action.payload.updates }
              : m,
          ),
        },
        isDirty: true,
      }
    }

    case 'SET_MODIFIERS': {
      return {
        ...state,
        modifiers: action.payload,
        isDirty: true,
      }
    }

    case 'CLEAR_MODIFIERS': {
      return {
        ...state,
        modifiers: { modifiers: [], lastUpdated: new Date() },
        isDirty: true,
      }
    }

    case 'MARK_SAVED':
      return {
        ...state,
        lastSaved: new Date(),
        isDirty: false,
      }

    case 'MARK_DIRTY':
      return {
        ...state,
        isDirty: true,
      }

    case 'RESET_STATE':
      return createInitialGameState()

    case 'REPLACE_STATE':
      return {
        ...action.payload,
        isDirty: true,
      }

    case 'LOAD_STATE':
      return {
        ...action.payload,
        isDirty: false,
      }

    default:
      return state
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * Validate game state
 */
export function validateGameState(state: any): state is GameState {
  return (
    state &&
    typeof state === 'object' &&
    'character' in state &&
    'inventory' in state &&
    'moves' in state &&
    'session' in state &&
    'ui' in state &&
    'settings' in state &&
    'version' in state
  )
}

/**
 * Migrate game state from older versions
 */
export function migrateGameState(
  state: unknown,
  _fromVersion: string,
): GameState {
  // Handle migration logic here as versions change
  // For now, just ensure all required fields exist
  const currentState = createInitialGameState()

  return {
    ...currentState,
    ...state,
    version: currentState.version,
  }
}

/**
 * Export game state for backup
 */
export function exportGameState(state: GameState): string {
  const exportData = {
    ...state,
    exportDate: new Date().toISOString(),
    exportVersion: state.version,
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Import game state from backup
 */
export function importGameState(jsonString: string): GameState | null {
  try {
    const data = JSON.parse(jsonString)

    if (!validateGameState(data)) {
      return null
    }

    // Migrate if needed
    if (data.version !== createInitialGameState().version) {
      return migrateGameState(data, data.version)
    }

    return data
  } catch {
    return null
  }
}

