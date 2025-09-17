/**
 * Combat Store for ZimboMate V2
 * Manages combat state, initiative, damage tracking, and battle flow
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character } from '../models/Character'
import { gameLogicService, type CombatResult } from '../services/GameLogicService'

export interface CombatParticipant {
  id: string
  name: string
  type: 'character' | 'npc' | 'monster'
  characterId?: string // For player characters
  hp: { current: number; max: number }
  armor: number
  initiative?: number
  conditions: string[]
  position: 'front' | 'close' | 'near' | 'far'
  isActive: boolean
  isPlayer: boolean
}

export interface CombatAction {
  id: string
  participantId: string
  type: 'attack' | 'defend' | 'move' | 'other'
  description: string
  timestamp: Date
  rollResult?: any
  damage?: number
  target?: string
}

export interface CombatEncounter {
  id: string
  name: string
  participants: CombatParticipant[]
  currentTurn: number
  round: number
  status: 'setup' | 'active' | 'paused' | 'completed'
  startTime: Date
  endTime?: Date
  actions: CombatAction[]
  environment: {
    terrain: string
    hazards: string[]
    lighting: 'bright' | 'dim' | 'dark'
    weather?: string
  }
}

interface CombatState {
  // Current encounter
  currentEncounter: CombatEncounter | null
  encounterHistory: CombatEncounter[]
  
  // Combat management
  startCombat: (name: string, participants: Omit<CombatParticipant, 'id'>[]) => void
  endCombat: () => void
  pauseCombat: () => void
  resumeCombat: () => void
  
  // Participant management
  addParticipant: (participant: Omit<CombatParticipant, 'id'>) => void
  removeParticipant: (participantId: string) => void
  updateParticipant: (participantId: string, updates: Partial<CombatParticipant>) => void
  
  // Turn management
  nextTurn: () => void
  previousTurn: () => void
  setCurrentTurn: (participantIndex: number) => void
  
  // Damage and healing
  applyDamage: (participantId: string, damage: number, armor?: number, piercing?: number) => CombatResult
  healParticipant: (participantId: string, amount: number) => void
  
  // Conditions
  addCondition: (participantId: string, condition: string) => void
  removeCondition: (participantId: string, condition: string) => void
  
  // Actions
  addAction: (action: Omit<CombatAction, 'id' | 'timestamp'>) => void
  getActionsForParticipant: (participantId: string) => CombatAction[]
  
  // Initiative
  rollInitiative: (participantId: string) => void
  setInitiative: (participantId: string, initiative: number) => void
  sortByInitiative: () => void
  
  // Utility
  getCurrentParticipant: () => CombatParticipant | null
  getAliveParticipants: () => CombatParticipant[]
  isEncounterComplete: () => boolean
  getCombatSummary: () => {
    round: number
    turn: number
    activeParticipants: number
    totalDamageDealt: number
    actionsThisRound: number
  }
}

export const useCombatStore = create<CombatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentEncounter: null,
      encounterHistory: [],

      // Combat management
      startCombat: (name, participants) => {
        const encounter: CombatEncounter = {
          id: `combat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name,
          participants: participants.map((p, index) => ({
            ...p,
            id: `participant-${Date.now()}-${index}`,
            conditions: [],
            isActive: true
          })),
          currentTurn: 0,
          round: 1,
          status: 'setup',
          startTime: new Date(),
          actions: [],
          environment: {
            terrain: 'normal',
            hazards: [],
            lighting: 'bright'
          }
        }

        set({ currentEncounter: encounter })
      },

      endCombat: () => {
        const { currentEncounter } = get()
        if (!currentEncounter) return

        const completedEncounter = {
          ...currentEncounter,
          status: 'completed' as const,
          endTime: new Date()
        }

        set((state) => ({
          currentEncounter: null,
          encounterHistory: [completedEncounter, ...state.encounterHistory.slice(0, 19)] // Keep last 20
        }))
      },

      pauseCombat: () => {
        set((state) => ({
          currentEncounter: state.currentEncounter
            ? { ...state.currentEncounter, status: 'paused' }
            : null
        }))
      },

      resumeCombat: () => {
        set((state) => ({
          currentEncounter: state.currentEncounter
            ? { ...state.currentEncounter, status: 'active' }
            : null
        }))
      },

      // Participant management
      addParticipant: (participant) => {
        set((state) => {
          if (!state.currentEncounter) return state

          const newParticipant: CombatParticipant = {
            ...participant,
            id: `participant-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            conditions: [],
            isActive: true
          }

          return {
            currentEncounter: {
              ...state.currentEncounter,
              participants: [...state.currentEncounter.participants, newParticipant]
            }
          }
        })
      },

      removeParticipant: (participantId) => {
        set((state) => {
          if (!state.currentEncounter) return state

          return {
            currentEncounter: {
              ...state.currentEncounter,
              participants: state.currentEncounter.participants.filter(p => p.id !== participantId)
            }
          }
        })
      },

      updateParticipant: (participantId, updates) => {
        set((state) => {
          if (!state.currentEncounter) return state

          return {
            currentEncounter: {
              ...state.currentEncounter,
              participants: state.currentEncounter.participants.map(p =>
                p.id === participantId ? { ...p, ...updates } : p
              )
            }
          }
        })
      },

      // Turn management
      nextTurn: () => {
        set((state) => {
          if (!state.currentEncounter) return state

          const aliveParticipants = state.currentEncounter.participants.filter(p => 
            p.isActive && p.hp.current > 0
          )
          
          let nextTurn = state.currentEncounter.currentTurn + 1
          let nextRound = state.currentEncounter.round

          if (nextTurn >= aliveParticipants.length) {
            nextTurn = 0
            nextRound += 1
          }

          return {
            currentEncounter: {
              ...state.currentEncounter,
              currentTurn: nextTurn,
              round: nextRound
            }
          }
        })
      },

      previousTurn: () => {
        set((state) => {
          if (!state.currentEncounter) return state

          const aliveParticipants = state.currentEncounter.participants.filter(p => 
            p.isActive && p.hp.current > 0
          )
          
          let prevTurn = state.currentEncounter.currentTurn - 1
          let prevRound = state.currentEncounter.round

          if (prevTurn < 0) {
            prevTurn = aliveParticipants.length - 1
            prevRound = Math.max(1, prevRound - 1)
          }

          return {
            currentEncounter: {
              ...state.currentEncounter,
              currentTurn: prevTurn,
              round: prevRound
            }
          }
        })
      },

      setCurrentTurn: (participantIndex) => {
        set((state) => {
          if (!state.currentEncounter) return state

          return {
            currentEncounter: {
              ...state.currentEncounter,
              currentTurn: participantIndex
            }
          }
        })
      },

      // Damage and healing
      applyDamage: (participantId, damage, armor = 0, piercing = 0) => {
        const { currentEncounter, updateParticipant } = get()
        if (!currentEncounter) {
          return { damage: 0, armorReduction: 0, finalDamage: 0, conditions: [], effects: [] }
        }

        const participant = currentEncounter.participants.find(p => p.id === participantId)
        if (!participant) {
          return { damage: 0, armorReduction: 0, finalDamage: 0, conditions: [], effects: [] }
        }

        const effectiveArmor = armor || participant.armor
        const combatResult = gameLogicService.calculateCombatDamage(
          damage,
          effectiveArmor,
          piercing,
          participant.conditions
        )

        // Apply damage
        const newHP = Math.max(0, participant.hp.current - combatResult.finalDamage)
        updateParticipant(participantId, {
          hp: { ...participant.hp, current: newHP },
          conditions: [...participant.conditions, ...combatResult.conditions]
        })

        // Add combat action
        get().addAction({
          participantId,
          type: 'other',
          description: `Takes ${combatResult.finalDamage} damage (${damage} - ${combatResult.armorReduction} armor)`,
          damage: combatResult.finalDamage
        })

        return combatResult
      },

      healParticipant: (participantId, amount) => {
        const { currentEncounter, updateParticipant } = get()
        if (!currentEncounter) return

        const participant = currentEncounter.participants.find(p => p.id === participantId)
        if (!participant) return

        const newHP = Math.min(participant.hp.max, participant.hp.current + amount)
        updateParticipant(participantId, {
          hp: { ...participant.hp, current: newHP }
        })

        get().addAction({
          participantId,
          type: 'other',
          description: `Heals ${amount} HP (${participant.hp.current} → ${newHP})`
        })
      },

      // Conditions
      addCondition: (participantId, condition) => {
        const { currentEncounter, updateParticipant } = get()
        if (!currentEncounter) return

        const participant = currentEncounter.participants.find(p => p.id === participantId)
        if (!participant || participant.conditions.includes(condition)) return

        updateParticipant(participantId, {
          conditions: [...participant.conditions, condition]
        })

        get().addAction({
          participantId,
          type: 'other',
          description: `Gains condition: ${condition}`
        })
      },

      removeCondition: (participantId, condition) => {
        const { currentEncounter, updateParticipant } = get()
        if (!currentEncounter) return

        const participant = currentEncounter.participants.find(p => p.id === participantId)
        if (!participant) return

        updateParticipant(participantId, {
          conditions: participant.conditions.filter(c => c !== condition)
        })

        get().addAction({
          participantId,
          type: 'other',
          description: `Removes condition: ${condition}`
        })
      },

      // Actions
      addAction: (actionData) => {
        set((state) => {
          if (!state.currentEncounter) return state

          const action: CombatAction = {
            ...actionData,
            id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            timestamp: new Date()
          }

          return {
            currentEncounter: {
              ...state.currentEncounter,
              actions: [...state.currentEncounter.actions, action]
            }
          }
        })
      },

      getActionsForParticipant: (participantId) => {
        const { currentEncounter } = get()
        if (!currentEncounter) return []

        return currentEncounter.actions.filter(a => a.participantId === participantId)
      },

      // Initiative
      rollInitiative: (participantId) => {
        const initiative = Math.floor(Math.random() * 20) + 1
        get().setInitiative(participantId, initiative)
      },

      setInitiative: (participantId, initiative) => {
        get().updateParticipant(participantId, { initiative })
      },

      sortByInitiative: () => {
        set((state) => {
          if (!state.currentEncounter) return state

          const sortedParticipants = [...state.currentEncounter.participants].sort((a, b) => {
            const aInit = a.initiative || 0
            const bInit = b.initiative || 0
            return bInit - aInit // Highest first
          })

          return {
            currentEncounter: {
              ...state.currentEncounter,
              participants: sortedParticipants,
              currentTurn: 0 // Reset to first participant
            }
          }
        })
      },

      // Utility
      getCurrentParticipant: () => {
        const { currentEncounter } = get()
        if (!currentEncounter) return null

        const aliveParticipants = currentEncounter.participants.filter(p => 
          p.isActive && p.hp.current > 0
        )
        
        return aliveParticipants[currentEncounter.currentTurn] || null
      },

      getAliveParticipants: () => {
        const { currentEncounter } = get()
        if (!currentEncounter) return []

        return currentEncounter.participants.filter(p => p.isActive && p.hp.current > 0)
      },

      isEncounterComplete: () => {
        const { currentEncounter } = get()
        if (!currentEncounter) return false

        const alivePlayers = currentEncounter.participants.filter(p => 
          p.isPlayer && p.isActive && p.hp.current > 0
        )
        const aliveEnemies = currentEncounter.participants.filter(p => 
          !p.isPlayer && p.isActive && p.hp.current > 0
        )

        return alivePlayers.length === 0 || aliveEnemies.length === 0
      },

      getCombatSummary: () => {
        const { currentEncounter } = get()
        if (!currentEncounter) {
          return { round: 0, turn: 0, activeParticipants: 0, totalDamageDealt: 0, actionsThisRound: 0 }
        }

        const activeParticipants = get().getAliveParticipants().length
        const totalDamageDealt = currentEncounter.actions
          .filter(a => a.damage && a.damage > 0)
          .reduce((sum, a) => sum + (a.damage || 0), 0)
        
        const currentRoundActions = currentEncounter.actions.filter(a => {
          const actionTime = a.timestamp.getTime()
          const roundStart = currentEncounter.startTime.getTime() + 
            ((currentEncounter.round - 1) * 60000) // Assume 1 minute per round
          return actionTime >= roundStart
        }).length

        return {
          round: currentEncounter.round,
          turn: currentEncounter.currentTurn + 1,
          activeParticipants,
          totalDamageDealt,
          actionsThisRound: currentRoundActions
        }
      }
    }),
    {
      name: 'zimbomate-combat-storage',
      partialize: (state) => ({
        currentEncounter: state.currentEncounter,
        encounterHistory: state.encounterHistory.slice(0, 5) // Only persist last 5 encounters
      }),
    }
  )
)