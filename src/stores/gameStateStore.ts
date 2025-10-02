/**
 * Game State Store for ZimboMate V2
 * Manages global game state, conditions, modifiers, and cross-character effects
 * Integrates with CharacterStateService and other game services
 */

import type { Condition, OngoingModifier } from '../services/CharacterStateService'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { characterStateService } from '../services/CharacterStateService'

// Global game effects that affect multiple characters
interface GlobalEffect {
  id: string
  name: string
  description: string
  type: 'environmental' | 'magical' | 'curse' | 'blessing' | 'other'
  affects: 'all' | 'party' | string[] // character IDs
  conditions: Condition[]
  modifiers: OngoingModifier[]
  duration: 'permanent' | 'scene' | 'encounter' | 'session' | number
  source: string
  createdAt: Date
}

// Game time tracking
interface GameTime {
  currentScene: string
  sceneCount: number
  encounterCount: number
  turnCount: number
  sessionTime: number // in minutes
  gameTime: {
    days: number
    hours: number
    minutes: number
  }
}

// Party-wide resources
interface PartyResource {
  id: string
  name: string
  current: number
  max: number
  type: 'shared' | 'pooled' | 'tracked'
  description: string
  refreshOn: 'rest' | 'scene' | 'session' | 'manual'
}

interface GameStateState {
  // Global effects
  globalEffects: GlobalEffect[]

  // Time tracking
  gameTime: GameTime

  // Party resources
  partyResources: PartyResource[]

  // Environmental conditions
  environment: {
    location: string
    weather: string
    lighting: 'bright' | 'dim' | 'dark' | 'magical'
    temperature: 'freezing' | 'cold' | 'cool' | 'warm' | 'hot' | 'scorching'
    hazards: string[]
  }

  // Global modifiers (affect all characters)
  globalModifiers: {
    statModifiers: Record<string, number> // stat -> modifier
    moveModifiers: Record<string, number> // move -> modifier
    damageModifiers: {
      incoming: number
      outgoing: number
    }
  }

  // Global effect management
  addGlobalEffect: (effect: Omit<GlobalEffect, 'id' | 'createdAt'>) => void
  removeGlobalEffect: (effectId: string) => void
  updateGlobalEffect: (effectId: string, updates: Partial<GlobalEffect>) => void
  getActiveGlobalEffects: () => GlobalEffect[]

  // Time management
  advanceTime: (type: 'turn' | 'scene' | 'encounter', amount?: number) => void
  setGameTime: (time: Partial<GameTime['gameTime']>) => void
  resetTime: () => void

  // Party resource management
  addPartyResource: (resource: Omit<PartyResource, 'id'>) => void
  updatePartyResource: (resourceId: string, updates: Partial<PartyResource>) => void
  removePartyResource: (resourceId: string) => void
  refreshPartyResources: (trigger: 'rest' | 'scene' | 'session') => void

  // Environment management
  setEnvironment: (environment: Partial<GameStateState['environment']>) => void
  addHazard: (hazard: string) => void
  removeHazard: (hazard: string) => void

  // Global modifier management
  setGlobalStatModifier: (stat: string, modifier: number) => void
  setGlobalMoveModifier: (move: string, modifier: number) => void
  setGlobalDamageModifier: (type: 'incoming' | 'outgoing', modifier: number) => void
  clearGlobalModifiers: () => void

  // Utility
  applyGlobalEffectsToCharacter: (characterId: string) => void
  removeGlobalEffectsFromCharacter: (characterId: string) => void
  getGameStateSnapshot: () => {
    activeEffects: number
    partyResources: number
    currentScene: string
    sessionDuration: number
  }
}

export const useGameStateStore = create<GameStateState>()(
  persist(
    (set, get) => ({
      // Initial state
      globalEffects: [],
      gameTime: {
        currentScene: 'Opening Scene',
        sceneCount: 1,
        encounterCount: 0,
        turnCount: 0,
        sessionTime: 0,
        gameTime: {
          days: 0,
          hours: 0,
          minutes: 0,
        },
      },
      partyResources: [],
      environment: {
        location: 'Unknown',
        weather: 'Clear',
        lighting: 'bright',
        temperature: 'warm',
        hazards: [],
      },
      globalModifiers: {
        statModifiers: {},
        moveModifiers: {},
        damageModifiers: {
          incoming: 0,
          outgoing: 0,
        },
      },

      // Global effect management
      addGlobalEffect: (effectData) => {
        const effect: GlobalEffect = {
          ...effectData,
          id: `effect-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          createdAt: new Date(),
        }

        set(state => ({
          globalEffects: [...state.globalEffects, effect],
        }))

        // Apply effect to affected characters
        const characterIds = effect.affects === 'all'
          ? ['all']
          : effect.affects === 'party'
            ? ['party']
            : effect.affects as string[]

        if (characterIds.includes('all') || characterIds.includes('party')) {
          // This would need to get character IDs from character store
          // For now, we'll just track the effect
        }
        else {
          for (const characterId of characterIds) {
            get().applyGlobalEffectsToCharacter(characterId)
          }
        }
      },

      removeGlobalEffect: (effectId) => {
        const { globalEffects } = get()
        const effect = globalEffects.find(e => e.id === effectId)

        if (effect) {
          // Remove effect from affected characters
          const characterIds = effect.affects === 'all'
            ? ['all']
            : effect.affects === 'party'
              ? ['party']
              : effect.affects as string[]

          if (!characterIds.includes('all') && !characterIds.includes('party')) {
            for (const characterId of characterIds) {
              get().removeGlobalEffectsFromCharacter(characterId)
            }
          }
        }

        set(state => ({
          globalEffects: state.globalEffects.filter(e => e.id !== effectId),
        }))
      },

      updateGlobalEffect: (effectId, updates) => {
        set(state => ({
          globalEffects: state.globalEffects.map(effect =>
            effect.id === effectId ? { ...effect, ...updates } : effect,
          ),
        }))
      },

      getActiveGlobalEffects: () => {
        const { globalEffects } = get()
        return globalEffects.filter((effect) => {
          if (effect.duration === 'permanent')
            return true
          if (typeof effect.duration === 'number')
            return effect.duration > 0
          return true // Scene/encounter/session effects are active until explicitly removed
        })
      },

      // Time management
      advanceTime: (type, amount = 1) => {
        set((state) => {
          const newGameTime = { ...state.gameTime }

          switch (type) {
            case 'turn':
              newGameTime.turnCount += amount
              break
            case 'scene':
              newGameTime.sceneCount += amount
              newGameTime.currentScene = `Scene ${newGameTime.sceneCount}`
              break
            case 'encounter':
              newGameTime.encounterCount += amount
              break
          }

          return { gameTime: newGameTime }
        })

        // Update global effect durations
        set(state => ({
          globalEffects: state.globalEffects.map((effect) => {
            if (typeof effect.duration === 'number') {
              return { ...effect, duration: Math.max(0, effect.duration - amount) }
            }
            return effect
          }).filter(effect =>
            effect.duration === 'permanent'
            || (typeof effect.duration === 'number' && effect.duration > 0)
            || typeof effect.duration === 'string',
          ),
        }))
      },

      setGameTime: (time) => {
        set(state => ({
          gameTime: {
            ...state.gameTime,
            gameTime: { ...state.gameTime.gameTime, ...time },
          },
        }))
      },

      resetTime: () => {
        set({
          gameTime: {
            currentScene: 'Opening Scene',
            sceneCount: 1,
            encounterCount: 0,
            turnCount: 0,
            sessionTime: 0,
            gameTime: {
              days: 0,
              hours: 0,
              minutes: 0,
            },
          },
        })
      },

      // Party resource management
      addPartyResource: (resourceData) => {
        const resource: PartyResource = {
          ...resourceData,
          id: `resource-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        }

        set(state => ({
          partyResources: [...state.partyResources, resource],
        }))
      },

      updatePartyResource: (resourceId, updates) => {
        set(state => ({
          partyResources: state.partyResources.map(resource =>
            resource.id === resourceId ? { ...resource, ...updates } : resource,
          ),
        }))
      },

      removePartyResource: (resourceId) => {
        set(state => ({
          partyResources: state.partyResources.filter(r => r.id !== resourceId),
        }))
      },

      refreshPartyResources: (trigger) => {
        set(state => ({
          partyResources: state.partyResources.map(resource =>
            resource.refreshOn === trigger
              ? { ...resource, current: resource.max }
              : resource,
          ),
        }))
      },

      // Environment management
      setEnvironment: (environment) => {
        set(state => ({
          environment: { ...state.environment, ...environment },
        }))
      },

      addHazard: (hazard) => {
        set(state => ({
          environment: {
            ...state.environment,
            hazards: [...state.environment.hazards, hazard],
          },
        }))
      },

      removeHazard: (hazard) => {
        set(state => ({
          environment: {
            ...state.environment,
            hazards: state.environment.hazards.filter(h => h !== hazard),
          },
        }))
      },

      // Global modifier management
      setGlobalStatModifier: (stat, modifier) => {
        set(state => ({
          globalModifiers: {
            ...state.globalModifiers,
            statModifiers: {
              ...state.globalModifiers.statModifiers,
              [stat]: modifier,
            },
          },
        }))
      },

      setGlobalMoveModifier: (move, modifier) => {
        set(state => ({
          globalModifiers: {
            ...state.globalModifiers,
            moveModifiers: {
              ...state.globalModifiers.moveModifiers,
              [move]: modifier,
            },
          },
        }))
      },

      setGlobalDamageModifier: (type, modifier) => {
        set(state => ({
          globalModifiers: {
            ...state.globalModifiers,
            damageModifiers: {
              ...state.globalModifiers.damageModifiers,
              [type]: modifier,
            },
          },
        }))
      },

      clearGlobalModifiers: () => {
        set({
          globalModifiers: {
            statModifiers: {},
            moveModifiers: {},
            damageModifiers: {
              incoming: 0,
              outgoing: 0,
            },
          },
        })
      },

      // Utility
      applyGlobalEffectsToCharacter: (characterId) => {
        const { globalEffects } = get()

        for (const effect of globalEffects) {
          // Apply conditions
          for (const condition of effect.conditions) {
            characterStateService.addCondition(characterId, condition)
          }

          // Apply modifiers
          for (const modifier of effect.modifiers) {
            characterStateService.addOngoingModifier(characterId, modifier)
          }
        }
      },

      removeGlobalEffectsFromCharacter: (characterId) => {
        const { globalEffects } = get()

        for (const effect of globalEffects) {
          // Remove conditions
          for (const condition of effect.conditions) {
            characterStateService.removeCondition(characterId, condition.id)
          }
        }
      },

      getGameStateSnapshot: () => {
        const { partyResources, gameTime } = get()

        return {
          activeEffects: get().getActiveGlobalEffects().length,
          partyResources: partyResources.length,
          currentScene: gameTime.currentScene,
          sessionDuration: gameTime.sessionTime,
        }
      },
    }),
    {
      name: 'zimbomate-gamestate-storage',
      partialize: state => ({
        gameTime: state.gameTime,
        environment: state.environment,
        globalModifiers: state.globalModifiers,
        partyResources: state.partyResources,
      }),
    },
  ),
)
