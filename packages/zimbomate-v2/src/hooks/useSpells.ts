/**
 * useSpells Hook for ZimboMate V2
 * Spell preparation and casting system for Wizard/Cleric classes
 * Integrates SpellCastingService with character management
 */

import { useCallback, useMemo, useState } from 'react'
import { useCharacter } from './useCharacter'
import { useDiceRoll } from './useDiceRoll'
import { spellCastingService } from '../services/SpellCastingService'
import { characterStateService } from '../services/CharacterStateService'
import type { ServiceSpell, SpellClass, CastingTier, SpellCastingResult } from '../services/SpellCastingService'

export interface PreparedSpell extends ServiceSpell {
  isPrepared: boolean
  timesUsed: number
  maxUses: number
  canCast: boolean
}

export interface SpellSlot {
  level: number
  total: number
  used: number
  available: number
}

export interface CastingResult extends SpellCastingResult {
  animationTrigger: {
    type: 'success' | 'partial' | 'failure'
    spellLevel: number
    spellSchool: string
    particleColor: string
  }
}

export interface UseSpellsReturn {
  // Character spell info
  spellcastingClass: SpellClass | null
  canCastSpells: boolean
  castingTier: CastingTier
  
  // Spell library
  allSpells: ServiceSpell[]
  availableSpells: ServiceSpell[]
  knownSpells: ServiceSpell[]
  preparedSpells: PreparedSpell[]
  
  // Spell slots
  spellSlots: SpellSlot[]
  hasAvailableSlots: boolean
  canPrepareMore: boolean
  
  // Spell preparation
  prepareSpell: (spellId: string) => void
  unprepareSpell: (spellId: string) => void
  prepareSpellList: (spellIds: string[]) => void
  clearPreparedSpells: () => void
  
  // Spell casting
  castSpell: (spellId: string, options?: {
    targetId?: string
    customModifier?: number
    upcast?: boolean
  }) => Promise<CastingResult>
  castPreparedSpell: (spellId: string, options?: {
    targetId?: string
    customModifier?: number
  }) => Promise<CastingResult>
  
  // Quick casting
  castCantrip: (spellId: string) => Promise<CastingResult>
  castHealingSpell: (targetId?: string) => Promise<CastingResult>
  castDamageSpell: (targetId: string) => Promise<CastingResult>
  
  // Spell management
  learnSpell: (spellId: string) => void
  forgetSpell: (spellId: string) => void
  getSpellsForLevel: (level: number) => ServiceSpell[]
  searchSpells: (query: string) => ServiceSpell[]
  
  // Rest and recovery
  shortRest: () => void
  longRest: () => void
  recoverSpellSlot: (level: number) => void
  
  // Spell state
  isCasting: boolean
  lastCastResult: CastingResult | null
  
  // Character context
  character: any
  isLoading: boolean
  error: string | null
}

/**
 * Hook for managing character spells and spellcasting
 * @param characterId - Character ID (optional, uses active character if not provided)
 */
export function useSpells(characterId?: string): UseSpellsReturn {
  const { character, isLoading, error } = useCharacter(characterId)
  const { roll } = useDiceRoll()
  
  const [isCasting, setIsCasting] = useState(false)
  const [lastCastResult, setLastCastResult] = useState<CastingResult | null>(null)

  // Determine spellcasting class
  const spellcastingClass = useMemo((): SpellClass | null => {
    if (!character) return null
    
    const className = character.class.toLowerCase()
    if (className === 'wizard') return 'wizard'
    if (className === 'cleric') return 'cleric'
    return null
  }, [character?.class])

  const canCastSpells = useMemo(() => spellcastingClass !== null, [spellcastingClass])

  const castingTier = useMemo((): CastingTier => {
    if (!character || !spellcastingClass) return 'none'
    
    // Determine casting tier based on level
    if (character.level >= 7) return 'full'
    if (character.level >= 3) return 'partial'
    return 'cantrip'
  }, [character?.level, spellcastingClass])

  // Get all spells for the character's class
  const allSpells = useMemo(() => {
    if (!spellcastingClass) return []
    return spellCastingService.getSpellsForClass(spellcastingClass)
  }, [spellcastingClass])

  const availableSpells = useMemo(() => {
    if (!character || !spellcastingClass) return []
    return spellCastingService.getAvailableSpells(character, spellcastingClass)
  }, [character, spellcastingClass])

  // Get character's known and prepared spells
  const knownSpells = useMemo(() => {
    if (!character) return []
    
    // This would come from character data or be calculated based on class/level
    // For now, assume all available spells are known
    return availableSpells
  }, [availableSpells])

  const preparedSpells = useMemo((): PreparedSpell[] => {
    if (!character) return []

    const characterState = characterStateService.getCharacterState(character.id)
    const spellResources = characterState.resources.filter(r => r.type === 'spell_slots')

    return knownSpells.map(spell => {
      const resource = spellResources.find(r => r.name === spell.name)
      const maxUses = spellcastingClass === 'wizard' ? 1 : (resource?.max || 0)
      const timesUsed = resource ? (resource.max - resource.current) : 0

      return {
        ...spell,
        isPrepared: resource !== undefined,
        timesUsed,
        maxUses,
        canCast: resource ? resource.current > 0 : false,
      }
    }).filter(spell => spell.isPrepared)
  }, [character, knownSpells, spellcastingClass])

  // Calculate spell slots
  const spellSlots = useMemo((): SpellSlot[] => {
    if (!character || !spellcastingClass) return []

    const slots: SpellSlot[] = []
    const maxLevel = Math.min(9, Math.ceil(character.level / 2))

    for (let level = 1; level <= maxLevel; level++) {
      const total = spellCastingService.getSpellSlotsForLevel(character.level, level)
      const characterState = characterStateService.getCharacterState(character.id)
      const usedSlots = characterState.resources
        .filter(r => r.name === `Level ${level} Spell Slot`)
        .reduce((sum, r) => sum + (r.max - r.current), 0)

      slots.push({
        level,
        total,
        used: usedSlots,
        available: total - usedSlots,
      })
    }

    return slots
  }, [character, spellcastingClass])

  const hasAvailableSlots = useMemo(() => 
    spellSlots.some(slot => slot.available > 0), [spellSlots])

  const canPrepareMore = useMemo(() => {
    if (!character || !spellcastingClass) return false
    
    const maxPrepared = spellCastingService.getMaxPreparedSpells(character, spellcastingClass)
    return preparedSpells.length < maxPrepared
  }, [character, spellcastingClass, preparedSpells])

  // Spell preparation
  const prepareSpell = useCallback((spellId: string) => {
    if (!character || !canPrepareMore) return

    const spell = knownSpells.find(s => s.id === spellId)
    if (!spell) return

    // Add spell as a resource
    characterStateService.setResource(character.id, {
      id: `spell-${spellId}`,
      name: spell.name,
      current: 1,
      max: 1,
      type: 'spell_slots',
      source: 'Prepared Spell',
      refreshOn: 'rest',
    })
  }, [character, canPrepareMore, knownSpells])

  const unprepareSpell = useCallback((spellId: string) => {
    if (!character) return

    const characterState = characterStateService.getCharacterState(character.id)
    const updatedResources = characterState.resources.filter(r => r.id !== `spell-${spellId}`)
    
    characterStateService.updateCharacterState(character.id, {
      resources: updatedResources
    })
  }, [character])

  const prepareSpellList = useCallback((spellIds: string[]) => {
    clearPreparedSpells()
    spellIds.forEach(spellId => prepareSpell(spellId))
  }, [prepareSpell])

  const clearPreparedSpells = useCallback(() => {
    if (!character) return

    const characterState = characterStateService.getCharacterState(character.id)
    const updatedResources = characterState.resources.filter(r => r.type !== 'spell_slots')
    
    characterStateService.updateCharacterState(character.id, {
      resources: updatedResources
    })
  }, [character])

  // Spell casting
  const castSpell = useCallback(async (spellId: string, options = {}): Promise<CastingResult> => {
    if (!character || !spellcastingClass) {
      throw new Error('Cannot cast spells: no character or spellcasting class')
    }

    setIsCasting(true)

    try {
      const spell = allSpells.find(s => s.id === spellId)
      if (!spell) {
        throw new Error(`Spell not found: ${spellId}`)
      }

      // Check if spell can be cast
      const canCast = spellCastingService.canCastSpell(character, spell, spellcastingClass)
      if (!canCast.canCast) {
        throw new Error(canCast.reason)
      }

      // Roll for spell casting if required
      let rollResult = null
      if (spell.requiresRoll) {
        rollResult = await roll({
          stat: spellcastingClass === 'wizard' ? 'intelligence' : 'wisdom',
          modifier: options.customModifier,
          description: `Cast ${spell.name}`,
          characterId: character.id,
        })
      }

      // Execute spell casting
      const castingResult = await spellCastingService.castSpell(
        character,
        spell,
        spellcastingClass,
        {
          rollResult: rollResult?.total,
          targetId: options.targetId,
          upcast: options.upcast,
        }
      )

      // Create enhanced result with animation data
      const enhancedResult: CastingResult = {
        ...castingResult,
        animationTrigger: {
          type: rollResult ? (rollResult.result as any) : 'success',
          spellLevel: spell.level,
          spellSchool: spell.school || 'evocation',
          particleColor: getSpellParticleColor(spell.school || 'evocation'),
        }
      }

      // Update spell slot usage
      if (spell.level > 0) {
        const slotResource = characterStateService.getCharacterState(character.id).resources
          .find(r => r.name === `Level ${spell.level} Spell Slot`)
        
        if (slotResource) {
          characterStateService.updateResource(character.id, slotResource.id, slotResource.current - 1)
        }
      }

      setLastCastResult(enhancedResult)
      return enhancedResult

    } finally {
      setIsCasting(false)
    }
  }, [character, spellcastingClass, allSpells, roll])

  const castPreparedSpell = useCallback(async (spellId: string, options = {}) => {
    const preparedSpell = preparedSpells.find(s => s.id === spellId)
    if (!preparedSpell || !preparedSpell.canCast) {
      throw new Error('Spell not prepared or cannot be cast')
    }

    return castSpell(spellId, options)
  }, [preparedSpells, castSpell])

  // Quick casting functions
  const castCantrip = useCallback(async (spellId: string) => {
    const spell = allSpells.find(s => s.id === spellId && s.level === 0)
    if (!spell) {
      throw new Error('Cantrip not found')
    }

    return castSpell(spellId)
  }, [allSpells, castSpell])

  const castHealingSpell = useCallback(async (targetId?: string) => {
    const healingSpells = preparedSpells.filter(s => 
      s.tags?.includes('healing') && s.canCast
    )
    
    if (healingSpells.length === 0) {
      throw new Error('No healing spells available')
    }

    // Cast the lowest level healing spell available
    const spell = healingSpells.sort((a, b) => a.level - b.level)[0]
    return castPreparedSpell(spell.id, { targetId })
  }, [preparedSpells, castPreparedSpell])

  const castDamageSpell = useCallback(async (targetId: string) => {
    const damageSpells = preparedSpells.filter(s => 
      s.tags?.includes('damage') && s.canCast
    )
    
    if (damageSpells.length === 0) {
      throw new Error('No damage spells available')
    }

    // Cast the highest level damage spell available
    const spell = damageSpells.sort((a, b) => b.level - a.level)[0]
    return castPreparedSpell(spell.id, { targetId })
  }, [preparedSpells, castPreparedSpell])

  // Spell management
  const learnSpell = useCallback((spellId: string) => {
    // This would add the spell to the character's known spells
    // Implementation depends on how spells are stored on the character
  }, [])

  const forgetSpell = useCallback((spellId: string) => {
    // This would remove the spell from the character's known spells
    unprepareSpell(spellId)
  }, [unprepareSpell])

  const getSpellsForLevel = useCallback((level: number) => {
    return allSpells.filter(spell => spell.level === level)
  }, [allSpells])

  const searchSpells = useCallback((query: string) => {
    return spellCastingService.searchSpells(query, spellcastingClass)
  }, [spellcastingClass])

  // Rest and recovery
  const shortRest = useCallback(() => {
    if (!character) return
    characterStateService.refreshResources(character.id, 'scene')
  }, [character])

  const longRest = useCallback(() => {
    if (!character) return
    characterStateService.refreshResources(character.id, 'rest')
  }, [character])

  const recoverSpellSlot = useCallback((level: number) => {
    if (!character) return

    const slotResource = characterStateService.getCharacterState(character.id).resources
      .find(r => r.name === `Level ${level} Spell Slot`)
    
    if (slotResource && slotResource.current < slotResource.max) {
      characterStateService.updateResource(character.id, slotResource.id, slotResource.current + 1)
    }
  }, [character])

  return {
    // Character spell info
    spellcastingClass,
    canCastSpells,
    castingTier,
    
    // Spell library
    allSpells,
    availableSpells,
    knownSpells,
    preparedSpells,
    
    // Spell slots
    spellSlots,
    hasAvailableSlots,
    canPrepareMore,
    
    // Spell preparation
    prepareSpell,
    unprepareSpell,
    prepareSpellList,
    clearPreparedSpells,
    
    // Spell casting
    castSpell,
    castPreparedSpell,
    
    // Quick casting
    castCantrip,
    castHealingSpell,
    castDamageSpell,
    
    // Spell management
    learnSpell,
    forgetSpell,
    getSpellsForLevel,
    searchSpells,
    
    // Rest and recovery
    shortRest,
    longRest,
    recoverSpellSlot,
    
    // Spell state
    isCasting,
    lastCastResult,
    
    // Character context
    character,
    isLoading,
    error,
  }
}

// Helper function to get particle colors for spell schools
function getSpellParticleColor(school: string): string {
  const colors = {
    evocation: '#FF6B35',     // Orange-red
    abjuration: '#4A90E2',    // Blue
    conjuration: '#7B68EE',   // Purple
    divination: '#FFD700',    // Gold
    enchantment: '#FF69B4',   // Pink
    illusion: '#9370DB',      // Violet
    necromancy: '#2F4F2F',    // Dark green
    transmutation: '#32CD32', // Lime green
  }
  
  return colors[school.toLowerCase()] || '#FFFFFF'
}