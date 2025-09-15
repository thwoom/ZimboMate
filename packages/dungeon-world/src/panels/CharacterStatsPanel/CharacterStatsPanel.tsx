import type { PanelProps } from '../../framework/Panel'

import React, { useCallback, useEffect, useMemo, useState, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import LevelUpModal from '../../components/LevelUpModal'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI, loadPanelState, savePanelState } from '../../framework/PanelAPI'
import { SpecialMovesService } from '../../services/SpecialMovesService'
import { spellCastingService } from '../../services/SpellCastingService'
import { useGameStore } from '../../store/GameStore'
import { getClassMapping, isCaster } from '../../utils/conditionalContent'
import { getEffectivePrefs, setStatsShowSpells, togglePanelOverride } from '../../utils/preferences'
import { getAttributeTooltip, getEncumbranceTier, getSpellBudgetProgress, getXpToNext } from '../../utils/statsPanelHelpers'
import { getClassBaseLoad, getEffectiveModifier as getEffectiveModifierModel, getXPThreshold } from '../../models/Character'
import type { Character, AdvancementChoice } from '../../models/Character'
import type { LevelUpResult } from '../../services/SpecialMovesService'
import './CharacterStatsPanel.css'
import Tooltip from '../../components/Tooltip'
import OverlaySurface from '../../components/OverlaySurface'
import HpOverlay from '../../components/HpOverlay'
import ProgressOverlay from '../../components/ProgressOverlay'
import StatusOverlay from '../../components/StatusOverlay'
import AttributesOverlay from '../../components/AttributesOverlay'
import ClassFocusOverlay from '../../components/ClassFocusOverlay'
import PreferencesOverlay from '../../components/PreferencesOverlay'

interface CharacterStatsPanelState {
  // Basic Info
  name: string
  class: string
  alignment: string

  // Stats
  hp: number
  maxHp: number
  armor: number
  damage: string
  level: number
  xp: number
  load: number
  maxLoad: number

  // Attributes
  attributes: {
    STR: number
    DEX: number
    CON: number
    INT: number
    WIS: number
    CHA: number
  }

  // Debilities
  debilities: {
    weak: boolean // -1 STR
    shaky: boolean // -1 DEX
    sick: boolean // -1 CON
    confused: boolean // -1 INT
    scarred: boolean // -1 WIS
    stunned: boolean // -1 CHA
  }
}

const CharacterStatsPanel: React.FC <PanelProps & { panelState?: CharacterStatsPanelState }> = ({
  id,
  panelState,
  onStateChange,
  isActive,
}) => {
  const api = createPanelAPI(id)
  const { state: gameState, updateCharacter, updateSettings } = useGameStore()
  const [showLevelUpModal, setShowLevelUpModal] = useState(false)


  // Get the active character from the game state
  const character = gameState.activeCharacterId ? gameState.characters[gameState.activeCharacterId] : null

  // restore persisted section toggles
  const persisted = loadPanelState(id + ':stats', { sections: { showSpellcasting: true, showClassFocus: true } }) as any
  const [sections, setSections] = useState<{ showSpellcasting: boolean; showClassFocus: boolean }>(persisted.sections)
  const toggleSection = useCallback((key: keyof typeof sections) => {
    const next = { ...sections, [key]: !sections[key] }
    setSections(next)
    savePanelState(id + ':stats', { sections: next })
  }, [sections, id])

  // Default state with migration for old data
  const defaultState: CharacterStatsPanelState = {
    name: 'Unnamed Hero',
    class: 'Fighter',
    alignment: 'Neutral',
    hp: 21,
    maxHp: 21,
    armor: 2,
    damage: 'd10',
    level: 1,
    xp: 0,
    load: 5,
    maxLoad: 12,
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
      shaky: false,
      sick: false,
      confused: false,
      scarred: false,
      stunned: false,
    },
  }

  // Merge with existing state, ensuring all properties exist
  const state: CharacterStatsPanelState = {
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

  // Calculate attribute modifiers (prefer store character values when available)
  const currentAttributes = character?.attributes || state.attributes
  const currentDebilities = character?.debilities || state.debilities
  const getEffectiveModifier = useCallback((attribute: keyof typeof state.attributes): number => {
    return getEffectiveModifierModel(attribute as any, currentAttributes as any, currentDebilities as any)
  }, [currentAttributes, currentDebilities])

  // Calculate max load based on class base + STR modifier
  const calculateMaxLoad = useCallback(() => {
    const baseLoad = getClassBaseLoad((state.class as any))
    const strModifier = getEffectiveModifier('STR')
    return baseLoad + strModifier
  }, [state.class, getEffectiveModifier])

  // Memoized derived values
  const xpThreshold = useMemo(() => getXPThreshold((character?.level ?? state.level) as number), [character?.level, state.level])
  const maxLoadMemo = useMemo(() => calculateMaxLoad(), [calculateMaxLoad])

  const handleHpChange = useCallback((delta: number) => {
    const newHp = Math.max(0, Math.min(state.maxHp, state.hp + delta))
    if (character) {
      updateCharacter(character.id, { hp: { ...character.hp, current: newHp } })
    } else if (onStateChange) {
      onStateChange({ ...state, hp: newHp })
    }

    api.send('hp-changed', { hp: newHp, maxHp: state.maxHp })
    if (newHp === 0 && state.hp > 0) {
      api.send('last-breath-triggered', { character: state.name })
    }
  }, [state, onStateChange, api, character, updateCharacter])

  const handleAddXP = useCallback(() => {
    if (!character) return
    const newXP = character.xp + 1
    updateCharacter(character.id, { xp: newXP })
    if (SpecialMovesService.canLevelUp({ ...character, xp: newXP })) {
      api.send('level-up-available', { character: character.name, level: character.level })
    }
  }, [character, updateCharacter, api])

  // Open the Level Up modal when overlays signal availability
  useEffect(() => {
    const off = api.listen('level-up-available', () => {
      setShowLevelUpModal(true)
    })
    const off2 = api.listen('open-levelup-modal', () => setShowLevelUpModal(true))
    return () => { off(); off2() }
  }, [api])

  const handleRest = useCallback(() => {
    if (!character) return
    updateCharacter(character.id, { hp: { ...character.hp, current: character.hp.max } })
    api.send('character-rested', { character: character.name })
  }, [character, updateCharacter, api])

  const handleLevelUp = useCallback(() => {
    setShowLevelUpModal(true)
  }, [])

  const handleLevelUpConfirm = useCallback((result: LevelUpResult, advancementChoice?: string) => {
    if (character && result.success) {
      // Update character with new level and XP
      const updates: Partial<Character> = {
        level: result.newLevel,
        xp: result.newXP,
      }

      // Add advancement choice to character's advancement history
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
    }
    setShowLevelUpModal(false)
  }, [character, updateCharacter])

  const handleDebilityToggle = (debility: keyof typeof state.debilities) => {
    if (onStateChange) {
      onStateChange({
        ...state,
        debilities: {
          ...state.debilities,
          [debility]: !state.debilities[debility],
        },
      })
    }
  }

  const formatModifier = (mod: number): string => {
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  // Get HP status color (currently unused but kept for future use)
  // const getHpColor = (): string => {
  //   const hpPercent = (state.hp / state.maxHp) * 100;
  //   if (hpPercent > 50) return '#28a745';
  //   if (hpPercent > 25) return '#ffc107';
  //   return '#dc3545';
  // };

  // Get HP status CSS class
  const getHpClass = (): string => {
    const hpPercent = (state.hp / state.maxHp) * 100
    if (state.hp <= 0)
      return 'hp-bar__fill--dead'
    if (hpPercent <= 25)
      return 'hp-bar__fill--critical'
    if (hpPercent <= 50)
      return 'hp-bar__fill--injured'
    return 'hp-bar__fill--full'
  }

  const rollAttribute = useCallback((attribute: keyof typeof state.attributes) => {
    const modifier = getEffectiveModifier(attribute)
    const roll1 = Math.floor(Math.random() * 6) + 1
    const roll2 = Math.floor(Math.random() * 6) + 1
    const total = roll1 + roll2 + modifier

    api.send('attribute-rolled', {
      attribute,
      roll1,
      roll2,
      modifier,
      total,
      character: state.name,
    })
  }, [state, api, getEffectiveModifier])

  // Listen for equipment weight changes
  useEffect(() => {
    const unsubscribe = api.listen('equipment-weight-changed', (data: { totalWeight: number }) => {
      if (onStateChange) {
        onStateChange({ ...state, load: data.totalWeight })
      }
    })

    return unsubscribe
  }, [state, onStateChange, api])

  // Listen for healing item usage
  useEffect(() => {
    const unsubscribe = api.listen('healing-item-used', (data: { item: { name: string }, healAmount: number }) => {
      if (onStateChange) {
        const newHp = Math.min(state.maxHp, state.hp + data.healAmount)
        onStateChange({ ...state, hp: newHp })

        // Notify about the healing
        api.send('character-healed', {
          character: state.name,
          healAmount: data.healAmount,
          item: data.item.name,
          newHp,
        })
      }
    })

    return unsubscribe
  }, [state, onStateChange, api])

  // Listen for equipment armor changes
  useEffect(() => {
    const unsubscribe = api.listen('equipment-armor-changed', (data: { totalArmor: number }) => {
      if (onStateChange) {
        onStateChange({ ...state, armor: data.totalArmor })
      }
    })

    return unsubscribe
  }, [state, onStateChange, api])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isActive)
      return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs
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
          // Roll 2d6
          api.send('quick-roll', { type: '2d6' })
          break
        case '1':
          e.preventDefault()
          rollAttribute('STR')
          break
        case '2':
          e.preventDefault()
          rollAttribute('DEX')
          break
        case '3':
          e.preventDefault()
          rollAttribute('CON')
          break
        case '4':
          e.preventDefault()
          rollAttribute('INT')
          break
        case '5':
          e.preventDefault()
          rollAttribute('WIS')
          break
        case '6':
          e.preventDefault()
          rollAttribute('CHA')
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
  }, [isActive, handleHpChange, handleAddXP, handleRest, rollAttribute, api])

  // Stats panel override shortcut
  useEffect(() => {
    if (!isActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key.toLowerCase() === 's')) {
        e.preventDefault()
        const next = togglePanelOverride(gameState.settings, 'stats')
        updateSettings({ conditionalContent: next.conditionalContent })
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isActive, gameState.settings, updateSettings])

  // Use character from game store if available, otherwise fall back to local state
  const displayCharacter = useMemo(() => character || {
    name: state.name,
    class: state.class,
    level: state.level,
    alignment: state.alignment,
    hp: { current: state.hp, max: state.maxHp },
    armor: state.armor,
    damageDie: state.damage,
    xp: state.xp,
    load: { current: state.load, max: maxLoadMemo },
    attributes: state.attributes,
    debilities: state.debilities,
  }, [character, state.name, state.class, state.level, state.alignment, state.hp, state.maxHp, state.armor, state.damage, state.xp, state.load, maxLoadMemo, state.attributes, state.debilities])

  const classMap = useMemo(() => getClassMapping((displayCharacter.class as any)), [displayCharacter.class])
  const highlightStats = classMap?.statsHighlight || []
  const caster = isCaster(character as any)
  const preparedCount = (character?.preparedSpells || []).length
  const spellBudget = character ? spellCastingService.getPreparationBudget(character) : 0
  const xpToNext = getXpToNext(displayCharacter.level as number, displayCharacter.xp as number)
  const effective = getEffectivePrefs(gameState.settings, caster)

  return (
    <div className="character-stats-panel">
      <div aria-live="polite" className="aria-live-region">
        HP {state.hp} of {state.maxHp}. XP {displayCharacter.xp} of {displayCharacter.level + 7}.
      </div>
      <div className="stats-grid" style={{ overflow: 'visible' }}>
        {/* Page title */}
        <div className="stat-card stat-card--pageTitle">
          <div className="hp-sidebar-glass-content">
            <h3> Character Stats</h3>
          </div>
        </div>

        {/* HP inline */}
        <div className="stat-card stat-card--hp">
          <div className="hp-sidebar-glass-content">
            <div className="hp-header">
              <h3> Hit Points</h3>
              <button type="button" className="hp-rest-button" onClick={handleRest} aria-label="Rest to full HP">Rest</button>
            </div>
            <div className="hp-display">
              <button className="hp-button hp-button--minus" onClick={() => handleHpChange(-1)} type="button">-</button>
              <div className="hp-value">
                <span className="hp-current">{displayCharacter.hp?.current ?? state.hp}</span>
                <span className="hp-separator">/</span>
                <span className="hp-max">{displayCharacter.hp?.max ?? state.maxHp}</span>
              </div>
              <button className="hp-button hp-button--plus" onClick={() => handleHpChange(1)} type="button">+</button>
            </div>
            <div className="hp-bar">
              <progress className={`hp-progress ${getHpClass()}`} max={state.maxHp} value={state.hp} aria-label="HP progress" />
            </div>
          </div>
        </div>

        {/* Progress composite (XP + Combat) inline */}
        <div className="stat-card stat-card--progress">
          <ProgressOverlay />
        </div>

        {/* Status composite (Load + Debilities) inline */}
        <div className="stat-card stat-card--status">
          <StatusOverlay />
        </div>

        {/* Preferences override placeholder (overlay renders content) */}
        <div className="stat-card stat-card--prefs" />

        {sections.showSpellcasting && effective.statsShowSpells && character && (
          <div className="stat-card">
            <h3> Spellcasting</h3>
            <div className="combat-stats">
              <div className="stat-item">
                <span className="stat-label">Prepared:</span>
                <span className="stat-value">{preparedCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Budget (levels):</span>
                <span className="stat-value">{spellBudget}</span>
              </div>
            </div>
            <div className="xp-bar">
              <progress
                className="xp-progress"
                max={Math.max(1, spellBudget)}
                value={Math.min(spellBudget, preparedCount)}
                aria-label="Spell budget progress"
              />
            </div>
            <div className="quick-actions">
              <a href="#spells" className="action-link" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('navigate-panel', { detail: { id: 'spells' } } as any)) }}>Open Spells</a>
            </div>
            {character.conditions?.includes('spellcasting-strain') && (
              <div className="load-warning">Spellcasting Strain (-1 ongoing to Cast a Spell)</div>
            )}
          </div>
        )}
        {/* Attributes inline */}
        <div className="stat-card stat-card--attributes">
          <AttributesOverlay />
        </div>

        {/* Class Focus placeholder (overlay renders content) */}
        {sections.showClassFocus && classMap && (
          <div className="stat-card stat-card--class-focus">
            <ClassFocusOverlay />
          </div>
        )}

        {/* Preferences inline */}
        <div className="stat-card stat-card--prefs">
          <PreferencesOverlay />
        </div>

        {/* (Shortcuts tile removed) */}
      </div>

      {/* (Rest button moved into HP overlay actions) */}

      {/* (Shortcuts tile removed) */}

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

// Export the component separately for HMR compatibility
export { CharacterStatsPanel }

// Export the panel configuration
const characterStatsPanelConfig = createPanel(
  {
    id: 'character-stats',
    name: 'Character Stats',
    icon: '👤',
    description: 'View and manage character attributes, HP, and status',
    priority: 1,
    preload: true,
  },
  CharacterStatsPanel,
  {
    getInitialState: () => {
      const defaultState: CharacterStatsPanelState = {
        name: 'Unnamed Hero',
        class: 'Fighter',
        alignment: 'Neutral',
        hp: 21,
        maxHp: 21,
        armor: 2,
        damage: 'd10',
        level: 1,
        xp: 0,
        load: 5,
        maxLoad: 12,
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
          shaky: false,
          sick: false,
          confused: false,
          scarred: false,
          stunned: false,
        },
      }
      return defaultState
    },
  },
)

export default characterStatsPanelConfig
