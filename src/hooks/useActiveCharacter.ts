/**
 * useActiveCharacter Hook for ZimboMate V2
 * Manages the currently active character with seamless switching
 * Most commonly used hook for character operations
 */

import { useCallback, useMemo } from 'react'
import { useCharacterStore } from '../stores/characterStore'
import { useCharacter } from './useCharacter'
import type { Character } from '../models/Character'

export interface UseActiveCharacterReturn {
  // Active character data
  activeCharacter: Character | undefined
  activeCharacterId: string | null
  hasActiveCharacter: boolean
  
  // Character switching
  setActiveCharacter: (characterId: string | null) => void
  switchToCharacter: (characterId: string) => void
  clearActiveCharacter: () => void
  
  // Quick character operations (on active character)
  updateActiveCharacter: (updates: Partial<Character>) => void
  healActive: (amount: number) => void
  damageActive: (amount: number) => void
  addXPToActive: (amount: number, source: string, description: string) => void
  
  // Character list for switching
  availableCharacters: Array<{
    id: string
    name: string
    class: string
    level: number
    isActive: boolean
  }>
  
  // Utility
  isLoading: boolean
  error: string | null
  clearError: () => void
}

/**
 * Hook for managing the active character
 * Provides easy access to the currently selected character and switching operations
 */
export function useActiveCharacter(): UseActiveCharacterReturn {
  const {
    characters,
    activeCharacterId,
    isLoading,
    error,
    setActiveCharacter: storeSetActiveCharacter,
    clearError,
  } = useCharacterStore()

  // Use the character hook for the active character
  const {
    character: activeCharacter,
    updateCharacter: updateActiveCharacter,
    healCharacter: healActive,
    damageCharacter: damageActive,
    addXP: addXPToActive,
  } = useCharacter(activeCharacterId || undefined)

  // Computed values
  const hasActiveCharacter = useMemo(() => {
    return activeCharacterId !== null && activeCharacter !== undefined
  }, [activeCharacterId, activeCharacter])

  const availableCharacters = useMemo(() => {
    return characters.map(character => ({
      id: character.id,
      name: character.name,
      class: character.class,
      level: character.level,
      isActive: character.id === activeCharacterId,
    }))
  }, [characters, activeCharacterId])

  // Character switching operations
  const setActiveCharacter = useCallback((characterId: string | null) => {
    storeSetActiveCharacter(characterId)
  }, [storeSetActiveCharacter])

  const switchToCharacter = useCallback((characterId: string) => {
    const character = characters.find(c => c.id === characterId)
    if (character) {
      storeSetActiveCharacter(characterId)
    }
  }, [characters, storeSetActiveCharacter])

  const clearActiveCharacter = useCallback(() => {
    storeSetActiveCharacter(null)
  }, [storeSetActiveCharacter])

  return {
    // Active character data
    activeCharacter,
    activeCharacterId,
    hasActiveCharacter,
    
    // Character switching
    setActiveCharacter,
    switchToCharacter,
    clearActiveCharacter,
    
    // Quick character operations
    updateActiveCharacter,
    healActive,
    damageActive,
    addXPToActive,
    
    // Character list for switching
    availableCharacters,
    
    // Utility
    isLoading,
    error,
    clearError,
  }
}

/**
 * Hook for character switching UI components
 * Provides optimized data for character selector components
 */
export function useCharacterSwitcher() {
  const { availableCharacters, activeCharacterId, switchToCharacter } = useActiveCharacter()

  const switcherData = useMemo(() => {
    return availableCharacters.map(char => ({
      ...char,
      displayName: `${char.name} (${char.class} ${char.level})`,
    }))
  }, [availableCharacters])

  return {
    characters: switcherData,
    activeCharacterId,
    switchToCharacter,
  }
}