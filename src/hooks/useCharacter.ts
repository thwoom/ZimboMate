/**
 * useCharacter Hook for ZimboMate V2
 * Primary character management hook - foundation for all character operations
 * Integrates characterStore with CharacterStateService and AdvancementService
 */

import type { Character } from '../models/Character'
import { useCallback, useMemo } from 'react'
import { advancementService } from '../services/AdvancementService'
import { characterStateService } from '../services/CharacterStateService'
import { useCharacterStore } from '../stores/characterStore'

export interface UseCharacterReturn {
  // Character data
  character: Character | undefined
  isLoading: boolean
  error: string | null

  // Character operations
  updateCharacter: (updates: Partial<Character>) => void
  deleteCharacter: () => void
  duplicateCharacter: () => Character | undefined
  exportCharacter: () => string | undefined

  // Health management
  updateHP: (newHP: number) => void
  healCharacter: (amount: number) => void
  damageCharacter: (amount: number) => void

  // Load management
  updateLoad: (newLoad: number) => void

  // XP and advancement
  addXP: (amount: number, source: string, description: string) => void
  levelUp: () => void
  canLevelUp: boolean

  // Character state integration
  getStateSummary: () => {
    activeConditions: number
    totalOngoingModifiers: number
    availableForwardModifiers: number
    resourcesNeedingAttention: number
  }

  // Utility
  clearError: () => void
}

/**
 * Primary character management hook
 * @param characterId - Optional character ID. If not provided, uses active character
 * @returns Character data and operations
 */
export function useCharacter(characterId?: string): UseCharacterReturn {
  const {
    characters,
    activeCharacterId,
    isLoading,
    error,
    getCharacter,
    updateCharacter: storeUpdateCharacter,
    deleteCharacter: storeDeleteCharacter,
    duplicateCharacter: storeDuplicateCharacter,
    exportCharacter: storeExportCharacter,
    updateHP: storeUpdateHP,
    healCharacter: storeHealCharacter,
    damageCharacter: storeDamageCharacter,
    updateLoad: storeUpdateLoad,
    addXP: storeAddXP,
    levelUpCharacter: storeLevelUpCharacter,
    clearError,
  } = useCharacterStore()

  // Determine which character to use
  const targetCharacterId = characterId || activeCharacterId
  const character = useMemo(() => {
    if (!targetCharacterId)
      return undefined
    return getCharacter(targetCharacterId)
  }, [targetCharacterId, getCharacter, characters])

  // Character operations
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    if (!targetCharacterId)
      return
    storeUpdateCharacter(targetCharacterId, updates)
  }, [targetCharacterId, storeUpdateCharacter])

  const deleteCharacter = useCallback(() => {
    if (!targetCharacterId)
      return
    storeDeleteCharacter(targetCharacterId)
  }, [targetCharacterId, storeDeleteCharacter])

  const duplicateCharacter = useCallback(() => {
    if (!targetCharacterId)
      return undefined
    return storeDuplicateCharacter(targetCharacterId)
  }, [targetCharacterId, storeDuplicateCharacter])

  const exportCharacter = useCallback(() => {
    if (!targetCharacterId)
      return undefined
    return storeExportCharacter(targetCharacterId)
  }, [targetCharacterId, storeExportCharacter])

  // Health management
  const updateHP = useCallback((newHP: number) => {
    if (!targetCharacterId)
      return
    storeUpdateHP(targetCharacterId, newHP)
  }, [targetCharacterId, storeUpdateHP])

  const healCharacter = useCallback((amount: number) => {
    if (!targetCharacterId)
      return
    storeHealCharacter(targetCharacterId, amount)
  }, [targetCharacterId, storeHealCharacter])

  const damageCharacter = useCallback((amount: number) => {
    if (!targetCharacterId)
      return
    storeDamageCharacter(targetCharacterId, amount)
  }, [targetCharacterId, storeDamageCharacter])

  // Load management
  const updateLoad = useCallback((newLoad: number) => {
    if (!targetCharacterId)
      return
    storeUpdateLoad(targetCharacterId, newLoad)
  }, [targetCharacterId, storeUpdateLoad])

  // XP and advancement
  const addXP = useCallback((amount: number, source: string, description: string) => {
    if (!targetCharacterId)
      return
    storeAddXP(targetCharacterId, amount, source, description)
  }, [targetCharacterId, storeAddXP])

  const levelUp = useCallback(() => {
    if (!targetCharacterId)
      return
    storeLevelUpCharacter(targetCharacterId)
  }, [targetCharacterId, storeLevelUpCharacter])

  const canLevelUp = useMemo(() => {
    if (!character)
      return false
    return advancementService.shouldLevelUp(character)
  }, [character])

  // Character state integration
  const getStateSummary = useCallback(() => {
    if (!targetCharacterId) {
      return {
        activeConditions: 0,
        totalOngoingModifiers: 0,
        availableForwardModifiers: 0,
        resourcesNeedingAttention: 0,
      }
    }
    return characterStateService.getStateSummary(targetCharacterId)
  }, [targetCharacterId])

  return {
    // Character data
    character,
    isLoading,
    error,

    // Character operations
    updateCharacter,
    deleteCharacter,
    duplicateCharacter,
    exportCharacter,

    // Health management
    updateHP,
    healCharacter,
    damageCharacter,

    // Load management
    updateLoad,

    // XP and advancement
    addXP,
    levelUp,
    canLevelUp,

    // Character state integration
    getStateSummary,

    // Utility
    clearError,
  }
}

/**
 * Hook for managing multiple characters
 * @returns All characters and bulk operations
 */
export function useCharacters() {
  const {
    characters,
    isLoading,
    error,
    createCharacter,
    importCharacter,
    clearError,
  } = useCharacterStore()

  const createNewCharacter = useCallback((characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    return createCharacter(characterData)
  }, [createCharacter])

  const importFromData = useCallback((characterData: string) => {
    return importCharacter(characterData)
  }, [importCharacter])

  return {
    characters,
    isLoading,
    error,
    createCharacter: createNewCharacter,
    importCharacter: importFromData,
    clearError,
  }
}
