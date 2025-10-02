/**
 * Character Store for ZimboMate V2
 * Manages character state, CRUD operations, and persistence
 * Integrates with CharacterStateService and AdvancementService
 */

import type { Character } from '../models/Character'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { advancementService } from '../services/AdvancementService'
import { characterStateService } from '../services/CharacterStateService'

interface CharacterState {
  // Character data
  characters: Character[]
  activeCharacterId: string | null
  isLoading: boolean
  error: string | null

  // Character CRUD operations
  createCharacter: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Character
  updateCharacter: (id: string, updates: Partial<Character>) => void
  deleteCharacter: (id: string) => void
  getCharacter: (id: string) => Character | undefined
  setActiveCharacter: (id: string | null) => void
  getActiveCharacter: () => Character | undefined

  // Character management
  duplicateCharacter: (id: string) => Character | undefined
  exportCharacter: (id: string) => string | undefined
  importCharacter: (characterData: string) => Character

  // XP and advancement
  addXP: (characterId: string, amount: number, source: string, description: string) => void
  levelUpCharacter: (characterId: string) => void

  // Health management
  updateHP: (characterId: string, newHP: number) => void
  healCharacter: (characterId: string, amount: number) => void
  damageCharacter: (characterId: string, amount: number) => void

  // Load management
  updateLoad: (characterId: string, newLoad: number) => void

  // Utility
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      // Initial state
      characters: [],
      activeCharacterId: null,
      isLoading: false,
      error: null,

      // Character CRUD operations
      createCharacter: (characterData) => {
        try {
          const character: Character = {
            ...characterData,
            id: `char-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          set(state => ({
            characters: [...state.characters, character],
            activeCharacterId: character.id,
            error: null,
          }))

          return character
        }
        catch (error) {
          set({ error: `Failed to create character: ${error instanceof Error ? error.message : 'Unknown error'}` })
          throw error
        }
      },

      updateCharacter: (id, updates) => {
        try {
          set(state => ({
            characters: state.characters.map(char =>
              char.id === id
                ? { ...char, ...updates, updatedAt: new Date() }
                : char,
            ),
            error: null,
          }))
        }
        catch (error) {
          set({ error: `Failed to update character: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      deleteCharacter: (id) => {
        try {
          // Clear character state service data
          characterStateService.clearCharacterState(id)

          // Clear advancement service data
          advancementService.clearXPHistory(id)

          set(state => ({
            characters: state.characters.filter(char => char.id !== id),
            activeCharacterId: state.activeCharacterId === id ? null : state.activeCharacterId,
            error: null,
          }))
        }
        catch (error) {
          set({ error: `Failed to delete character: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      getCharacter: (id) => {
        const { characters } = get()
        return characters.find(char => char.id === id)
      },

      setActiveCharacter: (id) => {
        const { characters } = get()
        if (id === null || characters.some(char => char.id === id)) {
          set({ activeCharacterId: id, error: null })
        }
        else {
          set({ error: 'Character not found' })
        }
      },

      getActiveCharacter: () => {
        const { characters, activeCharacterId } = get()
        if (!activeCharacterId)
          return undefined
        return characters.find(char => char.id === activeCharacterId)
      },

      // Character management
      duplicateCharacter: (id) => {
        try {
          const { characters, createCharacter } = get()
          const originalCharacter = characters.find(char => char.id === id)

          if (!originalCharacter) {
            set({ error: 'Character not found' })
            return undefined
          }

          const duplicatedCharacter = createCharacter({
            ...originalCharacter,
            name: `${originalCharacter.name} (Copy)`,
          })

          return duplicatedCharacter
        }
        catch (error) {
          set({ error: `Failed to duplicate character: ${error instanceof Error ? error.message : 'Unknown error'}` })
          return undefined
        }
      },

      exportCharacter: (id) => {
        try {
          const { characters } = get()
          const character = characters.find(char => char.id === id)

          if (!character) {
            set({ error: 'Character not found' })
            return undefined
          }

          return JSON.stringify(character, null, 2)
        }
        catch (error) {
          set({ error: `Failed to export character: ${error instanceof Error ? error.message : 'Unknown error'}` })
          return undefined
        }
      },

      importCharacter: (characterData) => {
        try {
          const parsedCharacter = JSON.parse(characterData) as Character

          // Validate required fields
          if (!parsedCharacter.name || !parsedCharacter.class) {
            throw new Error('Invalid character data: missing required fields')
          }

          // Create new character with imported data
          const importedCharacter = get().createCharacter({
            ...parsedCharacter,
            name: `${parsedCharacter.name} (Imported)`,
          })

          return importedCharacter
        }
        catch (error) {
          const errorMessage = `Failed to import character: ${error instanceof Error ? error.message : 'Unknown error'}`
          set({ error: errorMessage })
          throw new Error(errorMessage)
        }
      },

      // XP and advancement
      addXP: (characterId, amount, source, description) => {
        try {
          const { characters, updateCharacter } = get()
          const character = characters.find(char => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          // Use advancement service to add XP
          const updatedCharacter = advancementService.addXP(
            character,
            amount,
            source as any,
            description,
          )

          updateCharacter(characterId, updatedCharacter)
        }
        catch (error) {
          set({ error: `Failed to add XP: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      levelUpCharacter: (characterId) => {
        try {
          const { characters, updateCharacter } = get()
          const character = characters.find(char => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          // Use advancement service to level up
          const levelUpResult = advancementService.levelUp(character)
          updateCharacter(characterId, levelUpResult.character)
        }
        catch (error) {
          set({ error: `Failed to level up character: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      // Health management
      updateHP: (characterId, newHP) => {
        try {
          const { characters, updateCharacter } = get()
          const character = characters.find(char => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          const clampedHP = Math.max(0, Math.min(character.hp.max, newHP))
          updateCharacter(characterId, {
            hp: { ...character.hp, current: clampedHP },
          })
        }
        catch (error) {
          set({ error: `Failed to update HP: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      healCharacter: (characterId, amount) => {
        try {
          const { characters, updateHP } = get()
          const character = characters.find(char => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          updateHP(characterId, character.hp.current + amount)
        }
        catch (error) {
          set({ error: `Failed to heal character: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      damageCharacter: (characterId, amount) => {
        try {
          const { characters, updateHP } = get()
          const character = characters.find(char => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          updateHP(characterId, character.hp.current - amount)
        }
        catch (error) {
          set({ error: `Failed to damage character: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      // Load management
      updateLoad: (characterId, newLoad) => {
        try {
          const { characters, updateCharacter } = get()
          const character = characters.find(char => char.id === characterId)

          if (!character) {
            set({ error: 'Character not found' })
            return
          }

          const clampedLoad = Math.max(0, newLoad)
          updateCharacter(characterId, {
            load: { ...character.load, current: clampedLoad },
          })
        }
        catch (error) {
          set({ error: `Failed to update load: ${error instanceof Error ? error.message : 'Unknown error'}` })
        }
      },

      // Utility
      clearError: () => set({ error: null }),

      setLoading: loading => set({ isLoading: loading }),
    }),
    {
      name: 'zimbomate-character-storage',
      partialize: state => ({
        characters: state.characters,
        activeCharacterId: state.activeCharacterId,
      }),
    },
  ),
)
