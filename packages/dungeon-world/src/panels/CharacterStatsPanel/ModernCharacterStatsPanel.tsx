import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { PanelProps } from '../../framework/Panel'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI } from '../../framework/PanelAPI'
import { useGameStore } from '../../store/GameStore'
import { useWorkspace } from '../../hooks/useWorkspace'
import { WorkspaceContext } from '../../types/workspace'
import { SpecialMovesService } from '../../services/SpecialMovesService'
import { spellCastingService } from '../../services/SpellCastingService'
import { getClassMapping, isCaster } from '../../utils/conditionalContent'
import { getEffectivePrefs } from '../../utils/preferences'
import { getClassBaseLoad, getEffectiveModifier as getEffectiveModifierModel, getXPThreshold } from '../../models/Character'
import type { Character, AdvancementChoice } from '../../models/Character'
import type { LevelUpResult } from '../../services/SpecialMovesService'

// Modern Components
import { CharacterHeader } from '../../components/character/CharacterHeader'
import { HpCard } from '../../components/character/HpCard'
import { XpCard } from '../../components/character/XpCard'
import { AttributesGrid, type Attributes, type Debilities } from '../../components/character/AttributesGrid'
import { CombatStatsCard } from '../../components/character/CombatStatsCard'
import { StatusCard } from '../../components/character/StatusCard'
import { SpellcastingCard } from '../../components/character/SpellcastingCard'
import { DebilitiesCard } from '../../components/character/DebilitiesCard'
import { ClassFocusCard } from '../../components/character/ClassFocusCard'
import LevelUpModal from '../../components/LevelUpModal'

interface ModernCharacterStatsPanelState {
  name: string
  class: string
  alignment: string
  hp: number
  maxHp: number
  armor: number
  damage: string
  level: number
  xp: number
  load: number
  maxLoad: number
  attributes: Attributes
  debilities: Debilities
}

const ModernCharacterStatsPanel: React.FC<PanelProps & { panelState?: ModernCharacterStatsPanelState }> = ({
  id,
  panelState,
  onStateChange,
  isActive,
}) => {
  const api = createPanelAPI(id)
  const { state: gameState, updateCharacter } = useGameStore()
  const workspace = useWorkspace()
  const [showLevelUpModal, setShowLevelUpModal] = useState(false)

  // Get the active character from the game state
  const character = gameState.activeCharacterId ? gameState.characters[gameState.activeCharacterId] : null

  // Default state
  const defaultState: ModernCharacterStatsPanelState = {
    name: 'Theron Brightblade',
    class: 'Fighter',
    alignment: 'Good',
    hp: 18,
    maxHp: 24,
    armor: 3,
    damage: 'd10',
    level: 3,
    xp: 12,
    load: 8,
    maxLoad: 13,
    attributes: {
      STR: 16,
      DEX: 13,
      CON: 15,
      INT: 8,
      WIS: 12,
      CHA: 9,
    },
    debilities: {
      weak: false,
      shaky: true, // Example: character has shaky debility
      sick: false,
      confused: false,
      scarred: false,
      stunned: false,
    },
  }

  // Merge with existing state
  const state: ModernCharacterStatsPanelState = {
    ...defaultState,
    ...panelState,
    attributes: {
      ...defaultState.attributes,
      ...(panelState?.attributes || {}),
    },
    debilities: {
      ...defaultState.debilities,
      ...(panelState?.debilities || {}),
    },
  }

  // Use character from game store if available
  const displayCharacter = useMemo(() => character || {
    name: state.name,
    class: state.class,
    level: state.level,
    alignment: state.alignment,
    hp: { current: state.hp, max: state.maxHp },
    armor: state.armor,
    damageDie: state.damage,
    xp: state.xp,
    load: { current: state.load, max: state.maxLoad },
    attributes: state.attributes,
    debilities: state.debilities,
    conditions: ['ready', 'focused'], // Example conditions
    preparedSpells: ['Magic Missile', 'Shield', 'Cure Light Wounds'] // Example spells
  }, [character, state])

  const classMap = useMemo(() => getClassMapping(displayCharacter.class as any), [displayCharacter.class])
  const highlightStats = classMap?.statsHighlight || []
  const canLevelUp = character ? SpecialMovesService.canLevelUp(character) : state.xp >= (state.level + 7)
  const caster = isCaster(character as any) || displayCharacter.class === 'Wizard' || displayCharacter.class === 'Cleric'
  const preparedCount = displayCharacter.preparedSpells?.length || 0
  const spellBudget = character ? spellCastingService.getPreparationBudget(character) : (caster ? state.level + 1 : 0)
  const effective = getEffectivePrefs(gameState.settings, caster)

  // Event handlers
  const handleHpChange = useCallback((delta: number) => {
    const currentHp = displayCharacter.hp?.current ?? state.hp
    const maxHp = displayCharacter.hp?.max ?? state.maxHp
    const newHp = Math.max(0, Math.min(maxHp, currentHp + delta))
    
    if (character) {
      updateCharacter(character.id, { hp: { ...character.hp, current: newHp } })
    } else if (onStateChange) {
      onStateChange({ ...state, hp: newHp })
    }

    api.send('hp-changed', { hp: newHp, maxHp })
    if (newHp === 0 && currentHp > 0) {
      api.send('last-breath-triggered', { character: displayCharacter.name })
    }
  }, [displayCharacter, state, character, updateCharacter, onStateChange, api])

  const handleRest = useCallback(() => {
    if (character) {
      updateCharacter(character.id, { hp: { ...character.hp, current: character.hp.max } })
    } else if (onStateChange) {
      onStateChange({ ...state, hp: state.maxHp })
    }
    api.send('character-rested', { character: displayCharacter.name })
  }, [character, updateCharacter, state, onStateChange, displayCharacter.name, api])

  const handleAddXP = useCallback(() => {
    const newXP = displayCharacter.xp + 1
    if (character) {
      updateCharacter(character.id, { xp: newXP })
    } else if (onStateChange) {
      onStateChange({ ...state, xp: newXP })
    }
    
    if (newXP >= (displayCharacter.level + 7)) {
      api.send('level-up-available', { character: displayCharacter.name, level: displayCharacter.level })
    }
  }, [character, updateCharacter, state, onStateChange, displayCharacter, api])

  const handleLevelUp = useCallback(() => {
    setShowLevelUpModal(true)
  }, [])

  const handleLevelUpConfirm = useCallback((result: LevelUpResult, advancementChoice?: string) => {
    if (character && result.success) {
      const updates: Partial<Character> = {
        level: result.newLevel,
        xp: result.newXP,
      }

      if (advancementChoice) {
        const newAdvancement: AdvancementChoice = {
          level: result.newLevel,
          type: advancementChoice.includes('Increase') ? 'stat' : 'move',
          choice: advancementChoice,
          description: advancementChoice,
          timestamp: new Date(),
        }
        updates.advancements = [...(character.advancements || []), newAdvancement]
      }

      updateCharacter(character.id, updates)
    } else if (onStateChange) {
      onStateChange({ ...state, level: state.level + 1, xp: 0 })
    }
    setShowLevelUpModal(false)
  }, [character, updateCharacter, state, onStateChange])

  const handleRollAttribute = useCallback((attribute: keyof Attributes) => {
    const score = displayCharacter.attributes?.[attribute] ?? state.attributes[attribute]
    const debilityKey = {
      STR: 'weak',
      DEX: 'shaky', 
      CON: 'sick',
      INT: 'confused',
      WIS: 'scarred',
      CHA: 'stunned'
    }[attribute] as keyof Debilities
    
    const hasDebility = displayCharacter.debilities?.[debilityKey] ?? state.debilities[debilityKey]
    
    // Calculate modifier
    let modifier = 0
    if (score <= 3) modifier = -3
    else if (score <= 5) modifier = -2
    else if (score <= 8) modifier = -1
    else if (score <= 12) modifier = 0
    else if (score <= 15) modifier = 1
    else if (score <= 17) modifier = 2
    else modifier = 3
    
    if (hasDebility) modifier -= 1

    const roll1 = Math.floor(Math.random() * 6) + 1
    const roll2 = Math.floor(Math.random() * 6) + 1
    const total = roll1 + roll2 + modifier

    api.send('attribute-rolled', {
      attribute,
      roll1,
      roll2,
      modifier,
      total,
      character: displayCharacter.name,
    })
  }, [displayCharacter, state, api])

  const handleToggleDebility = useCallback((debility: keyof Debilities) => {
    if (character) {
      updateCharacter(character.id, {
        debilities: {
          ...character.debilities,
          [debility]: !character.debilities[debility]
        }
      })
    } else if (onStateChange) {
      onStateChange({
        ...state,
        debilities: {
          ...state.debilities,
          [debility]: !state.debilities[debility]
        }
      })
    }
  }, [character, updateCharacter, state, onStateChange])

  const handleOpenSpells = useCallback(() => {
    window.dispatchEvent(new CustomEvent('navigate-panel', { detail: { id: 'spells' } }))
  }, [])

  // Listen for level up events
  useEffect(() => {
    const off1 = api.listen('level-up-available', () => setShowLevelUpModal(true))
    const off2 = api.listen('open-levelup-modal', () => setShowLevelUpModal(true))
    return () => { off1(); off2() }
  }, [api])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowUp':
        case '+':
          e.preventDefault()
          handleHpChange(1)
          break
        case 'ArrowDown':
        case '-':
          e.preventDefault()
          handleHpChange(-1)
          break
        case ' ':
          e.preventDefault()
          api.send('quick-roll', { type: '2d6' })
          break
        case '1':
          e.preventDefault()
          handleRollAttribute('STR')
          break
        case '2':
          e.preventDefault()
          handleRollAttribute('DEX')
          break
        case '3':
          e.preventDefault()
          handleRollAttribute('CON')
          break
        case '4':
          e.preventDefault()
          handleRollAttribute('INT')
          break
        case '5':
          e.preventDefault()
          handleRollAttribute('WIS')
          break
        case '6':
          e.preventDefault()
          handleRollAttribute('CHA')
          break
        case 'x':
        case 'X':
          e.preventDefault()
          handleAddXP()
          break
        case 'r':
        case 'R':
          e.preventDefault()
          handleRest()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, handleHpChange, handleAddXP, handleRest, handleRollAttribute, api])

  // Context-aware layout
  const getLayoutClasses = () => {
    switch (workspace.activeContext) {
      case WorkspaceContext.PLAY:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      case WorkspaceContext.PREP:
        return 'grid grid-cols-1 md:grid-cols-2 gap-6'
      case WorkspaceContext.BUILD:
        return 'grid grid-cols-1 lg:grid-cols-2 gap-8'
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Character Header */}
      <CharacterHeader
        name={displayCharacter.name}
        characterClass={displayCharacter.class}
        level={displayCharacter.level}
        alignment={displayCharacter.alignment}
      />

      {/* Stats Grid - Context Aware */}
      <div className={getLayoutClasses()}>
        {/* HP Card - Always prominent in Play context */}
        <HpCard
          currentHp={displayCharacter.hp?.current ?? state.hp}
          maxHp={displayCharacter.hp?.max ?? state.maxHp}
          onHpChange={handleHpChange}
          onRest={handleRest}
          className={workspace.activeContext === WorkspaceContext.PLAY ? 'md:col-span-1' : ''}
        />

        {/* XP Card - More prominent in Prep context */}
        <XpCard
          currentXp={displayCharacter.xp}
          level={displayCharacter.level}
          onAddXp={handleAddXP}
          onLevelUp={canLevelUp ? handleLevelUp : undefined}
          canLevelUp={canLevelUp}
          className={workspace.activeContext === WorkspaceContext.PREP ? 'md:col-span-1' : ''}
        />

        {/* Combat Stats - Prominent in Play context */}
        <CombatStatsCard
          armor={displayCharacter.armor}
          damage={displayCharacter.damageDie}
        />

        {/* Status Card */}
        <StatusCard
          currentLoad={displayCharacter.load?.current ?? state.load}
          maxLoad={displayCharacter.load?.max ?? state.maxLoad}
          conditions={displayCharacter.conditions || []}
        />

        {/* Spellcasting Card - Only for casters */}
        {caster && effective.statsShowSpells && (
          <SpellcastingCard
            preparedCount={preparedCount}
            spellBudget={spellBudget}
            hasSpellcastingStrain={displayCharacter.conditions?.includes('spellcasting-strain')}
            onOpenSpells={handleOpenSpells}
          />
        )}

        {/* Debilities Card - Only if has debilities or in prep context */}
        {(Object.values(displayCharacter.debilities).some(Boolean) || workspace.activeContext === WorkspaceContext.PREP) && (
          <DebilitiesCard
            debilities={displayCharacter.debilities}
            onToggleDebility={handleToggleDebility}
          />
        )}

        {/* Class Focus Card - More prominent in Build context */}
        <ClassFocusCard
          characterClass={displayCharacter.class}
          className={workspace.activeContext === WorkspaceContext.BUILD ? 'md:col-span-2' : ''}
        />

        {/* Attributes Grid - Spans multiple columns in Build context */}
        <AttributesGrid
          attributes={displayCharacter.attributes}
          debilities={displayCharacter.debilities}
          onRollAttribute={handleRollAttribute}
          highlightStats={highlightStats}
          className={workspace.activeContext === WorkspaceContext.BUILD ? 'lg:col-span-2' : 'md:col-span-2 lg:col-span-3'}
        />
      </div>

      {/* Level Up Modal */}
      {character && (
        <LevelUpModal
          isOpen={showLevelUpModal}
          character={character}
          onConfirm={handleLevelUpConfirm}
          onCancel={() => setShowLevelUpModal(false)}
        />
      )}
    </div>
  )
}

// Export the component
export { ModernCharacterStatsPanel }

// Export the panel configuration
const modernCharacterStatsPanelConfig = createPanel(
  {
    id: 'character-stats-modern',
    name: 'Character Stats (Modern)',
    icon: '👤',
    description: 'Modern card-based character stats with context-aware layout',
    priority: 1,
    preload: true,
  },
  ModernCharacterStatsPanel,
  {
    getInitialState: () => ({
      name: 'Theron Brightblade',
      class: 'Fighter',
      alignment: 'Good',
      hp: 18,
      maxHp: 24,
      armor: 3,
      damage: 'd10',
      level: 3,
      xp: 12,
      load: 8,
      maxLoad: 13,
      attributes: {
        STR: 16,
        DEX: 13,
        CON: 15,
        INT: 8,
        WIS: 12,
        CHA: 9,
      },
      debilities: {
        weak: false,
        shaky: true,
        sick: false,
        confused: false,
        scarred: false,
        stunned: false,
      },
    }),
  },
)

export default modernCharacterStatsPanelConfig