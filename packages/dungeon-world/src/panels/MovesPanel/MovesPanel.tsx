import type { PanelProps } from '../../framework/Panel'

import type { Move } from '../../models/Move'

import type { DiceRoll, EnhancedDiceRoll } from '../../services/DiceRollingService'
import type { RollInsight } from '../../services/RollAnalyticsService'
import type { MoveSuggestion } from '../../services/SmartMoveSuggestionService'
import type { Spell as ServiceSpell, SpellClass } from '../../services/Spells'
import React, { useEffect, useRef, useState } from 'react'
import ContextMenu from '../../components/ContextMenu'
import EnhancedDiceRoller from '../../components/EnhancedDiceRoller'
import MoveCard from '../../components/MoveCard'
import SpellConsequenceModal from '../../components/SpellConsequenceModal'
import Tooltip from '../../components/Tooltip'
import { createPanel } from '../../framework/Panel'
import { createPanelAPI, loadPanelState, savePanelState } from '../../framework/PanelAPI'
import { BASIC_MOVES, SPECIAL_MOVES } from '../../models/Move'
import { diceRollingService } from '../../services/DiceRollingService'
import { MoveCompendiumService } from '../../services/MoveCompendiumService'
import { rollAnalyticsService } from '../../services/RollAnalyticsService'
import { smartMoveSuggestionService } from '../../services/SmartMoveSuggestionService'
import { spellCastingService } from '../../services/SpellCastingService'
import { getSpellsForClass } from '../../services/Spells'
import { useGameStore } from '../../store/GameStore'
import { filterMovesByClass, getClassMapping } from '../../utils/conditionalContent'
import { registerShortcut, setActiveScope } from '../../utils/KeyboardShortcuts'
import { getEffectivePrefs, togglePanelOverride, setPanelShowAll } from '../../utils/preferences'
import './MovesPanel.css'
import { Checkbox } from '../../components/ui/checkbox'
import { Switch } from '../../components/ui/switch'
import { Button } from '../../components/ui/button'
import { motion, useReducedMotion } from 'framer-motion'
import { getVariant, staggerContainer, itemFadeIn } from '../../utils/motion'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Card } from '../../components/ui/card'

interface MovesPanelState {
  selectedCategory: 'all' | 'basic' | 'class' | 'advanced' | 'master' | 'special'
  searchTerm: string
  showAll: boolean
  showRollHistory: boolean
  showSuggestions: boolean
  showInsights: boolean
  showEnhancedDice: boolean
  expandedMoves: Set <string>
  contextDescription: string
}

const MovesPanel: React.FC <PanelProps> = ({ id }) => {
  const _api = createPanelAPI(id)
  const { state: gameState, updateCharacter, updateSettings } = useGameStore()
  const persisted = loadPanelState<Pick<MovesPanelState, 'selectedCategory' | 'searchTerm' | 'showAll'>>(id, { selectedCategory: 'all', searchTerm: '', showAll: false })
  const searchRef = useRef<HTMLInputElement>(null)
  const [panelState, setPanelState] = useState <MovesPanelState>({
    selectedCategory: persisted.selectedCategory,
    searchTerm: persisted.searchTerm,
    showAll: persisted.showAll,
    showRollHistory: false,
    showSuggestions: true,
    showInsights: false,
    showEnhancedDice: true,
    expandedMoves: new Set(),
    contextDescription: '',
  })

  useEffect(() => {
    setActiveScope(id)
    const unReg = registerShortcut({ combo: '/', handler: () => searchRef.current?.focus(), scope: id, preventDefault: true })
    const unToggle = registerShortcut({ combo: 'ctrl+alt+m', handler: () => {
      const next = togglePanelOverride(gameState.settings, 'moves')
      updateSettings({ conditionalContent: next.conditionalContent })
    }, scope: id, preventDefault: true })
    return () => {
      setActiveScope(null)
      unReg()
      unToggle()
    }
  }, [id, gameState.settings, updateSettings])

  const updateState = (updates: Partial <MovesPanelState>) => {
    setPanelState((prev) => {
      const next = { ...prev, ...updates }
      savePanelState(id, { selectedCategory: next.selectedCategory, searchTerm: next.searchTerm, showAll: next.showAll })
      return next
    })
  }

  const [rollHistory, setRollHistory] = useState <DiceRoll[]>([])
  const [suggestions, setSuggestions] = useState <MoveSuggestion[]>([])
  const [insights, setInsights] = useState <RollInsight[]>([])
  const [menuState, setMenuState] = useState<{ open: boolean, x: number, y: number, move?: Move }>({ open: false, x: 0, y: 0 })

  // Get active character
  const character = gameState.activeCharacterId
    ? gameState.characters[gameState.activeCharacterId]
    : null

  const compendium = new MoveCompendiumService()
  const effective = getEffectivePrefs(gameState.settings, Boolean(character && (character.class === 'Wizard' || character.class === 'Cleric' || character.class === 'Immolator')))

  // Spellcasting context
  const isCaster = Boolean(character && (character.class === 'Wizard' || character.class === 'Cleric' || character.class === 'Immolator'))
  const knownSpells: ServiceSpell[] = character && isCaster ? getSpellsForClass(character.class as SpellClass) : []
  const preparedIds = (character?.preparedSpells || [])
  const preparedSpells = knownSpells.filter(s => preparedIds.includes(s.id))
  const [spellModal, setSpellModal] = useState<{ open: boolean, spell?: ServiceSpell }>({ open: false })

  // Update roll history when it changes
  useEffect(() => {
    const updateHistory = () => {
      setRollHistory(diceRollingService.getRecentRolls(20))
    }

    // Initial load
    updateHistory()

    // Set up periodic updates (in a real app, you'd use events)
    const interval = setInterval(updateHistory, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load suggestions when character or context changes
  useEffect(() => {
    if (character && panelState.showSuggestions) {
      const newSuggestions = smartMoveSuggestionService.getSuggestions(
        character,
        'unknown',
        rollHistory.slice(-5),
        panelState.contextDescription,
      )
      setSuggestions(newSuggestions)
    }
  }, [character, panelState.contextDescription, panelState.showSuggestions, rollHistory])

  // Load insights
  useEffect(() => {
    if (character && panelState.showInsights) {
      const characterInsights = rollAnalyticsService.getInsights(character.id)
      setInsights(characterInsights)
    }
  }, [character, panelState.showInsights])

  // Get all available moves
  const getAllMoves = (): Move[] => {
    const moves: Move[] = []

    // Add basic moves (always available)
    for (const partialMove of BASIC_MOVES) {
      if (partialMove.name) {
        moves.push({
          id: `basic-${partialMove.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...partialMove,
        } as Move)
      }
    }

    // Add special moves
    for (const partialMove of SPECIAL_MOVES) {
      if (partialMove.name) {
        moves.push({
          id: `special-${partialMove.name.toLowerCase().replace(/\s+/g, '-')}`,
          ...partialMove,
        } as Move)
      }
    }

    // Add compendium moves
    if (character) {
      const level = character.level || 1
      const base = (effective.movesShowAll)
        ? compendium.getAllMoves().filter(m => m.category !== 'basic' && m.category !== 'special')
        : compendium.getAvailableMoves(character.class as any, level).filter(m => m.category === 'class')

      const compendiumMapped: Move[] = base.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category as any,
        description: m.description,
        trigger: m.trigger,
        triggerType: m.triggerType as any,
        rollStat: m.rollStat as any,
        onSuccess: m.onSuccess,
        onPartial: m.onPartial,
        onFailure: m.onFailure,
        level: m.level,
        requiresClass: m.requiresClass as any,
        source: m.source,
        custom: m.custom,
      }))

      moves.push(...compendiumMapped)
    }

    return moves
  }

  // Filter moves based on category and search
  const getFilteredMoves = (): Move[] => {
    let moves = getAllMoves()

    // Class-aware ordering/filtering (non-breaking): prefer class-relevant categories unless Show All is true
    if (character && !effective.movesShowAll) {
      moves = filterMovesByClass(character as any, moves)
    }

    // Filter by category
    if (panelState.selectedCategory !== 'all') {
      moves = moves.filter(move => move.category === panelState.selectedCategory)
    }

    // Filter by search term
    if (panelState.searchTerm) {
      const searchLower = panelState.searchTerm.toLowerCase()
      moves = moves.filter(move =>
        move.name.toLowerCase().includes(searchLower)
        || move.description?.toLowerCase().includes(searchLower)
        || move.trigger?.toLowerCase().includes(searchLower),
      )
    }

    return moves
  }

  const openContextMenu = (e: React.MouseEvent, move: Move) => {
    e.preventDefault()
    setMenuState({ open: true, x: e.clientX, y: e.clientY, move })
  }

  const closeContextMenu = () => setMenuState(prev => ({ ...prev, open: false }))

  const handleRoll = (roll: DiceRoll) => {
    // Record analytics and get insights
    const newInsights = rollAnalyticsService.recordRoll(roll)

    // Handle XP gain on failure
    if (diceRollingService.grantsXP(roll) && character) {
      const newXP = (character.xp || 0) + 1
      updateCharacter(character.id, { xp: newXP })
    }

    // Update roll history
    setRollHistory(diceRollingService.getRecentRolls(20))

    // Add new insights
    if (newInsights.length > 0) {
      setInsights(prev => [...newInsights, ...prev].slice(0, 10)) // Keep last 10 insights
    }
  }

  const handleUseMove = (move: Move) => {
    // Handle move usage (decrement uses, apply effects, etc.)
    if (move.uses && move.uses.current > 0) {
      // TODO: Update move uses in character data
    }
  }

  // (expand/collapse behavior handled within MoveCard)

  const filteredMoves = getFilteredMoves()
  const preferredCategories = character && getClassMapping((character.class as any))?.moves.preferredCategories
  const classMoves = character && !effective.movesShowAll
    ? filteredMoves.filter(m => (preferredCategories as any)?.includes((m.category as any)))
    : []
  const otherMoves = character && !effective.movesShowAll
    ? filteredMoves.filter(m => !(preferredCategories as any)?.includes((m.category as any)))
    : filteredMoves

  const renderSpellSection = () => {
    if (!character || !isCaster)
      return null

    const budget = spellCastingService.getPreparationBudget(character)
    const levelCost = (s: ServiceSpell) => (s.level === 0 ? 0 : (s.level as number))
    const current = preparedSpells.reduce((sum, s) => sum + levelCost(s), 0)

    const onTogglePrepare = (spellId: string) => {
      if (!character)
        return
      const next = preparedIds.includes(spellId)
        ? preparedIds.filter(id => id !== spellId)
        : [...preparedIds, spellId]
      try {
        const updated = spellCastingService.prepareSpells(character, next)
        // Persist only changed fields
        updateCharacter(character.id, { preparedSpells: updated.preparedSpells, conditions: updated.conditions })
      }
      catch (e) {
        console.warn((e as Error).message)
      }
    }

    const onCast = (spell: ServiceSpell) => {
      if (!character)
        return
      try {
        const { roll: _roll, updated, tier } = spellCastingService.castPreparedSpell(character, spell)
        if (tier === '7-9') {
          setSpellModal({ open: true, spell })
          updateCharacter(character.id, { xp: updated.xp })
        }
        else {
          updateCharacter(character.id, { xp: updated.xp })
        }
      }
      catch (e) {
        console.warn((e as Error).message)
      }
    }

    return (
      <div className="spells-section">
        <h3>✨ Spells</h3>
        <div className="spells-budget">
          <div className="spells-budget__label">
            Prepared levels:
            {current}
            {' '}
            /
            {budget}
            {' '}
            (cantrips / rotes don’t count)
          </div>
          <div className="spells-budget__bar" aria-label={`Prepared ${current} of ${budget}`}>
            <progress className="spells-progress" max={Math.max(1, budget)} value={Math.min(current, budget)} />
          </div>
        </div>
        <div className="spells-list">
          {knownSpells.map((spell) => {
            const isPrepared = preparedIds.includes(spell.id)
            const wouldExceed = !isPrepared && (current + levelCost(spell) > budget)
            const prepareDisabled = !isPrepared && wouldExceed
            const prepareTitle = prepareDisabled ? `Preparing this would exceed your budget (${current}+${levelCost(spell)} > ${budget})` : undefined
            const castDisabled = spell.level !== 0 && !isPrepared
            const castTitle = castDisabled ? 'You must prepare this spell before casting (DW rule)' : undefined
            return (
              <div key={spell.id} className={`spell-row ${isPrepared ? 'prepared' : ''}`}>
                <div className="spell-info">
                  <strong>{spell.name}</strong>
                  {' '}
                  {spell.level === 0 ? '(Cantrip / Rote)' : `(Level ${spell.level})`}
                </div>
                <div className="spell-actions">
                  <button className="toggle-button" onClick={() => !prepareDisabled && onTogglePrepare(spell.id)} disabled={prepareDisabled} title={prepareTitle} type="button">
                    {isPrepared ? 'Unprepare' : 'Prepare'}
                  </button>
                  <button className="toggle-button" onClick={() => onCast(spell)} disabled={castDisabled} title={castTitle} type="button">
                    Cast
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      className="moves-panel"
      initial={prefersReduced ? false : 'hidden'}
      animate={prefersReduced ? undefined : 'visible'}
      variants={getVariant('fade')}
    >
      <div className="moves-panel__header">
        <h2> Moves</h2>
        {character && (
          <div className="character-info">
            <span className="character-name">{character.name}</span>
            <span className="character-xp">
              XP:
              {character.xp || 0}
            </span>
          </div>
        )}
      </div>

      {!character && (
        <div className="no-character">
          <p> No character selected. Create or select a character to use moves.</p>
        </div>
      )}

      {character && (
        <>
          {/* Controls */}
          <motion.div className="moves-panel__controls" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search moves..."
                value={panelState.searchTerm}
                onChange={e => updateState({ searchTerm: e.target.value })}
                className="search-input"
                ref={searchRef}
              />
            </div>

            <div className="show-all-toggle">
              <label>
                <Switch
                  checked={gameState.settings.conditionalContent?.perPanel.moves.overrideEnabled || false}
                  onCheckedChange={() => {
                    const next = togglePanelOverride(gameState.settings, 'moves')
                    updateSettings({ conditionalContent: next.conditionalContent })
                  }}
                  aria-label="Override"
                />{' '}
                Override
              </label>
              <label className="ml-8">
                <Checkbox
                  checked={gameState.settings.conditionalContent?.perPanel.moves.showAll || false}
                  onCheckedChange={(checked) => {
                    const next = setPanelShowAll(gameState.settings, 'moves', Boolean(checked))
                    updateSettings({ conditionalContent: next.conditionalContent })
                  }}
                  disabled={!gameState.settings.conditionalContent?.perPanel.moves.overrideEnabled}
                  aria-label="Show all moves"
                />{' '}
                Show all moves
              </label>
            </div>

            <motion.div className="category-filters" variants={itemFadeIn}>
              <Tabs value={panelState.selectedCategory} onValueChange={(v) => updateState({ selectedCategory: v as any })}>
                <TabsList>
                  {(['all', 'basic', 'class', 'advanced', 'master', 'special'] as const).map(category => (
                    <Tooltip key={category} content={`Filter: ${category}`}>
                      <TabsTrigger value={category} className={`category-button ${panelState.selectedCategory === category ? 'active' : ''}`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </TabsTrigger>
                    </Tooltip>
                  ))}
                </TabsList>
              </Tabs>
            </motion.div>

            <div className="context-description">
              <input
                type="text"
                placeholder="Describe the current situation for smart suggestions..."
                value={panelState.contextDescription}
                onChange={e => updateState({ contextDescription: e.target.value })}
                className="context-input"
              />
            </div>

            <motion.div className="view-toggles" variants={itemFadeIn}>
              <Button
                variant="secondary"
                size="sm"
                className={`toggle-button ${panelState.showEnhancedDice ? 'active' : ''}`}
                onClick={() => updateState({ showEnhancedDice: !panelState.showEnhancedDice })}
                type="button"
              >
                🎲 Enhanced Dice
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`toggle-button ${panelState.showSuggestions ? 'active' : ''}`}
                onClick={() => updateState({ showSuggestions: !panelState.showSuggestions })}
                type="button"
              >
                💡 Smart Suggestions
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`toggle-button ${panelState.showInsights ? 'active' : ''}`}
                onClick={() => updateState({ showInsights: !panelState.showInsights })}
                type="button"
              >
                📊 Analytics
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className={`toggle-button ${panelState.showRollHistory ? 'active' : ''}`}
                onClick={() => updateState({ showRollHistory: !panelState.showRollHistory })}
                type="button"
              >
                📜 Roll History
              </Button>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <div className="moves-panel__content">
            {/* 7–9 Spell Consequence Modal */}
            {isCaster && (
              <SpellConsequenceModal
                isOpen={spellModal.open}
                spellName={spellModal.spell?.name || ''}
                casterClass={(character?.class as string) === 'Cleric' ? 'Cleric' : 'Wizard'}
                onConfirm={(choice: 'unwelcome-attention' | 'forget' | 'strain') => {
                  if (!character || !spellModal.spell)
                    return
                  const post = spellCastingService.applySevenToNineConsequence(character, spellModal.spell, choice)
                  updateCharacter(character.id, { preparedSpells: post.preparedSpells, conditions: post.conditions, xp: post.xp })
                  setSpellModal({ open: false })
                }}
                onCancel={() => setSpellModal({ open: false })}
              />
            )}
            {/* Spellcasting (DW: prepare level + 1 budget; cast with INT / WIS) */}
            {renderSpellSection()}
            {/* Enhanced Dice Roller */}
            {panelState.showEnhancedDice && (
              <div className="enhanced-dice-section">
                <h3>🎲 Enhanced Dice Roller</h3>
                <EnhancedDiceRoller
                  compact={false}
                  showHistory={true}
                  showAnimation={true}
                  animationTheme="classic"
                  soundEnabled={true}
                  onRoll={(enhancedRoll: EnhancedDiceRoll) => {
                    // Convert to legacy format for compatibility with existing systems
                    // Only create legacy roll for 2d6 or 3d6 (advantage / disadvantage) rolls
                    if (enhancedRoll.results.length === 2 || enhancedRoll.results.length === 3) {
                      const legacyRoll: DiceRoll = {
                        id: enhancedRoll.id,
                        dice: enhancedRoll.results as [number, number] | [number, number, number],
                        modifier: enhancedRoll.modifier,
                        total: enhancedRoll.finalResult,
                        result: enhancedRoll.rollResult || (enhancedRoll.success ? 'success' : 'failure'),
                        timestamp: enhancedRoll.timestamp,
                        description: `${enhancedRoll.expression.count}${enhancedRoll.expression.type}${enhancedRoll.modifier !== 0 ? (enhancedRoll.modifier > 0 ? '+' : '') + enhancedRoll.modifier : ''}`,
                        character: character?.name || 'Unknown',
                      }
                      setRollHistory(prev => [legacyRoll, ...prev.slice(0, 19)])
                    }
                  }}
                />
              </div>
            )}

            {/* Smart Suggestions */}
            {panelState.showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-section">
                <h3>💡 Smart Suggestions</h3>
                <div className="suggestions-grid">
                  {suggestions.slice(0, 6).map(suggestion => (
                    <Card key={suggestion.move.id} className={`suggestion-card ${suggestion.priority}`}>
                      <div className="suggestion-header">
                        <span className="suggestion-move-name">{suggestion.move.name}</span>
                        <span className="suggestion-relevance">
                          {suggestion.relevance}
                          %
                        </span>
                      </div>
                      <div className="suggestion-reason">{suggestion.reason}</div>
                      {suggestion.move.rollStat && character && (
                        <Button
                          size="sm"
                          className="suggestion-roll-btn"
                          onClick={() => {
                            const roll = diceRollingService.rollMove(suggestion.move, character)
                            handleRoll(roll)
                          }}
                          type="button"
                        >
                          🎲 Roll + {' '}{suggestion.move.rollStat}
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Insights */}
            {panelState.showInsights && insights.length > 0 && (
              <div className="insights-section">
                <h3>📊 Roll Insights</h3>
                <div className="insights-list">
                  {insights.slice(0, 5).map((item, index) => (
                    <div key={index} className={`insight-item ${item.severity}`}>
                      <div className="insight-header">
                        <span className="insight-title">{item.title}</span>
                        <span className="insight-type">{item.type}</span>
                      </div>
                      <div className="insight-description">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Moves List */}
            <motion.div className="moves-list" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
              {filteredMoves.length === 0
                ? (
                    <div className="no-moves">
                      <p> No moves found matching your criteria.</p>
                    </div>
                  )
                : (
                    <>
                      {character && !effective.movesShowAll && classMoves.length > 0 && (
                        <motion.div className="moves-group" variants={itemFadeIn}>
                          <h3>Class Moves</h3>
                          {classMoves.map(move => (
                            <motion.div key={move.id} onContextMenu={e => openContextMenu(e, move)} variants={itemFadeIn}>
                              <MoveCard
                                move={move}
                                character={character}
                                onRoll={handleRoll}
                                onUse={handleUseMove}
                                expanded={panelState.expandedMoves.has(move.id)}
                                className="moves-list__item"
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                      <motion.div className="moves-group" variants={itemFadeIn}>
                        {character && !effective.movesShowAll && classMoves.length > 0 && (
                          <h3>Other Moves</h3>
                        )}
                        {(character && !effective.movesShowAll ? otherMoves : filteredMoves).map(move => (
                          <motion.div key={move.id} onContextMenu={e => openContextMenu(e, move)} variants={itemFadeIn}>
                            <MoveCard
                              move={move}
                              character={character}
                              onRoll={handleRoll}
                              onUse={handleUseMove}
                              expanded={panelState.expandedMoves.has(move.id)}
                              className="moves-list__item"
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </>
                  )}
            </motion.div>

            {menuState.open && menuState.move && (
              <ContextMenu
                x={menuState.x}
                y={menuState.y}
                onClose={closeContextMenu}
                items={[
                  {
                    id: 'roll',
                    label: '🎲 Roll',
                    onSelect: () => {
                      if (character) {
                        const roll = diceRollingService.rollMove(menuState.move!, character)
                        handleRoll(roll)
                      }
                    },
                  },
                  {
                    id: 'copy',
                    label: '📋 Copy name',
                    onSelect: () => {
                      try {
                        void navigator.clipboard?.writeText(menuState.move!.name)
                      }
                      catch (e) {
                        console.warn('Clipboard copy failed', e)
                      }
                    },
                  },
                ]}
              />
            )}

            {/* Roll History Sidebar */}
            {panelState.showRollHistory && (
              <div className="roll-history">
                <div className="roll-history__header">
                  <h3> Recent Rolls</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="clear-history-button"
                    onClick={() => {
                      diceRollingService.clearHistory()
                      setRollHistory([])
                    }}
                    type="button"
                  >
                    Clear
                  </Button>
                </div>

                <div className="roll-history__list">
                  {rollHistory.length === 0
                    ? (
                        <p className="no-rolls">No rolls yet.</p>
                      )
                    : (
                        rollHistory.map(roll => (
                          <div key={roll.id} className={`roll-item ${roll.result}`}>
                            <div className="roll-header">
                              <span className="roll-description">
                                {roll.description || 'Unknown Roll'}
                              </span>
                              <span className="roll-time">
                                {new Date(roll.timestamp).toLocaleTimeString()}
                              </span>
                            </div>

                            <div className="roll-details">
                              <span className="roll-dice">
                                {roll.dice.length === 3
                                  ? `${roll.dice.join(' + ')} (${roll.advantage ? 'adv' : 'dis'})`
                                  : `${roll.dice[0]} + ${roll.dice[1]}`}
                              </span>
                              <span className="roll-modifier">
                                {roll.modifier >= 0 ? '+' : ''}
                                {roll.modifier}
                              </span>
                              <span className="roll-total">
                                =
                                {' '}
                                {roll.total}
                              </span>
                              <span className={`roll-result ${roll.result}`}>
                                {roll.result === 'success' && '✓'}
                                {roll.result === 'partial' && '~'}
                                {roll.result === 'failure' && '✗'}
                              </span>
                            </div>

                            {diceRollingService.grantsXP(roll) && (
                              <div className="xp-gained">+1 XP</div>
                            )}
                          </div>
                        ))
                      )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}

// Export the component separately for HMR compatibility
export { MovesPanel }

// Export the panel configuration
const movesPanelConfig = createPanel(
  {
    id: 'moves',
    name: 'Moves',
    icon: '📜',
    description: 'Roll moves, get suggestions, and track performance',
    priority: 3,
  },
  MovesPanel,
)

export default movesPanelConfig
