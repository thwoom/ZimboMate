/**
 * Move Compendium Component
 *
 * A comprehensive interface for browsing, searching, filtering, and comparing * moves from the Dungeon World compendium.
 */

import type {
  CompendiumMove,
} from '../data/moveCompendium'

import React, { useMemo, useState } from 'react'

import { moveCompendiumService } from '../services/MoveCompendiumService'
import { useGameStore } from '../stores/gameStore'
import './MoveCompendium.css'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '../utils/motion'

interface MoveCompendiumState {
  searchQuery: string
  selectedCategory: string
  selectedType: string
  selectedTriggerType: string
  selectedClass: string
  selectedLevel: string
  selectedRollStat: string
  selectedTags: string[]
  viewMode: 'list' | 'grid' | 'detailed'
  sortBy: 'name' | 'level' | 'category' | 'type'
  sortOrder: 'asc' | 'desc'
  selectedMoves: string[]
  showComparison: boolean
  showFilters: boolean
}

const MoveCompendium: React.FC = () => {
  const { characterData } = useGameStore()
  const prefersReduced = useReducedMotion()

  const [state, setState] = useState <MoveCompendiumState>({
    searchQuery: '',
    selectedCategory: 'all',
    selectedType: 'all',
    selectedTriggerType: 'all',
    selectedClass: 'all',
    selectedLevel: 'all',
    selectedRollStat: 'all',
    selectedTags: [],
    viewMode: 'list',
    sortBy: 'name',
    sortOrder: 'asc',
    selectedMoves: [],
    showComparison: false,
    showFilters: true,
  })

  // Get available moves based on character data
  const availableMoves = useMemo(() => {
    if (characterData) {
      return moveCompendiumService.getAvailableMoves(
        characterData.class,
        characterData.level,
      )
    }
    return moveCompendiumService.getAllMoves()
  }, [characterData])

  // Filter and sort moves
  const filteredMoves = useMemo(() => {
    let moves = availableMoves

    // Apply search query
    if (state.searchQuery) {
      moves = moves.filter(move =>
        move.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        || move.description.toLowerCase().includes(state.searchQuery.toLowerCase())
        || move.trigger.toLowerCase().includes(state.searchQuery.toLowerCase())
        || (move.tags && move.tags.some(tag =>
          tag.toLowerCase().includes(state.searchQuery.toLowerCase()),
        )),
      )
    }

    // Apply category filter
    if (state.selectedCategory !== 'all') {
      moves = moves.filter(move => move.category === state.selectedCategory)
    }

    // Apply type filter
    if (state.selectedType !== 'all') {
      moves = moves.filter(move => move.type === state.selectedType)
    }

    // Apply trigger type filter
    if (state.selectedTriggerType !== 'all') {
      moves = moves.filter(move => move.triggerType === state.selectedTriggerType)
    }

    // Apply class filter
    if (state.selectedClass !== 'all') {
      moves = moves.filter(move =>
        move.requiresClass === state.selectedClass
        || move.category === 'basic',
      )
    }

    // Apply level filter
    if (state.selectedLevel !== 'all') {
      const level = Number.parseInt(state.selectedLevel)
      moves = moves.filter(move => !move.level || move.level <= level)
    }

    // Apply roll stat filter
    if (state.selectedRollStat !== 'all') {
      moves = moves.filter(move => move.rollStat === state.selectedRollStat)
    }

    // Apply tags filter
    if (state.selectedTags.length > 0) {
      moves = moves.filter(move =>
        move.tags && state.selectedTags.some(tag => move.tags!.includes(tag)),
      )
    }

    // Sort moves
    moves.sort((a, b) => {
      let aValue: number | string, bValue: number | string

      switch (state.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'level':
          aValue = a.level || 0
          bValue = b.level || 0
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      const compare = () => {
        if (typeof aValue === 'string' && typeof bValue === 'string') return aValue.localeCompare(bValue)
        const an = typeof aValue === 'number' ? aValue : Number(aValue)
        const bn = typeof bValue === 'number' ? bValue : Number(bValue)
        return an < bn ? -1 : an > bn ? 1 : 0
      }
      return state.sortOrder === 'asc' ? compare() : -compare()
    })

    return moves
  }, [availableMoves, state])

  // Get all available tags
  const allTags = useMemo(() => {
    const tags = new Set <string>()
    for (const move of availableMoves) {
      if (move.tags) {
        for (const tag of move.tags) tags.add(tag)
      }
    }
    return [...tags].sort()
  }, [availableMoves])

  // Update state helper
  const updateState = (updates: Partial <MoveCompendiumState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // Toggle move selection
  const toggleMoveSelection = (moveId: string) => {
    setState(prev => ({
      ...prev,
      selectedMoves: prev.selectedMoves.includes(moveId)
        ? prev.selectedMoves.filter(id => id !== moveId)
        : [...prev.selectedMoves, moveId],
    }))
  }

  // Clear all selections
  const clearSelections = () => {
    updateState({ selectedMoves: [] })
  }

  // Get comparison data
  const comparisonData = useMemo(() => {
    if (state.selectedMoves.length !== 2)
      return null
    return moveCompendiumService.compareMoves(
      state.selectedMoves[0],
      state.selectedMoves[1],
    )
  }, [state.selectedMoves])

  // Render move card
  const renderMoveCard = (move: CompendiumMove) => {
    const isSelected = state.selectedMoves.includes(move.id)
    const isAvailable = characterData
      ? moveCompendiumService.validateMovePrerequisites(
        move.id,
        characterData.class,
        characterData.level,
        characterData.moves || [],
        characterData.attributes,
      ).canTake
      : true

    return (
      <motion.div
        key={move.id}
        className={`move-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
        onClick={() => toggleMoveSelection(move.id)}
        variants={itemFadeIn}
        whileHover={prefersReduced ? undefined : { scale: 1.01 }}
      >
        <div className="move-header">
          <h3 className="move-name">{move.name}</h3>
          <div className="move-badges">
            <span className={`badge category-${move.category}`}>
              {move.category}
            </span>
            <span className={`badge type-${move.type}`}>
              {move.type}
            </span>
            {move.level && (
              <span className="badge level">
                Level
                {move.level}
              </span>
            )}
            {move.requiresClass && (
              <span className="badge class">{move.requiresClass}</span>
            )}
          </div>
        </div>

        <div className="move-content">
          <p className="move-description">{move.description}</p>
          <p className="move-trigger">
            <strong> Trigger:</strong>
            {' '}
            {move.trigger}
          </p>

          {move.rollStat && (
            <p className="move-roll">
              Roll:
              {move.rollStat}
            </p>
          )}

          {move.onSuccess && (
            <div className="move-results">
              <p>
                <strong> 10+:</strong>
                {' '}
                {move.onSuccess}
              </p>
              {move.onPartial && (
                <p>
                  <strong> 7-9:</strong>
                  {' '}
                  {move.onPartial}
                </p>
              )}
              {move.onFailure && (
                <p>
                  <strong> 6-:</strong>
                  {' '}
                  {move.onFailure}
                </p>
              )}
            </div>
          )}

          {move.tags && move.tags.length > 0 && (
            <div className="move-tags">
              {move.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}

          {move.source && (
            <p className="move-source">
              Source:
              {move.source}
            </p>
          )}
        </div>

        {!isAvailable && (
          <div className="move-unavailable">
            <p> Not available for your character</p>
          </div>
        )}
      </motion.div>
    )
  }

  // Render comparison panel
  const renderComparisonPanel = () => {
    if (!comparisonData)
      return null

    return (
      <div className="comparison-panel">
        <h3> Move Comparison</h3>
        <div className="comparison-content">
          <div className="comparison-moves">
            <div className="comparison-move">
              <h4>{comparisonData.move1.name}</h4>
              <p>{comparisonData.move1.description}</p>
            </div>
            <div className="comparison-move">
              <h4>{comparisonData.move2.name}</h4>
              <p>{comparisonData.move2.description}</p>
            </div>
          </div>

          <div className="comparison-details">
            <div className="similarities">
              <h5> Similarities</h5>
              <ul>
                {comparisonData.similarities.map((item, index) => (
                  <li key={index}>{similarity}</li>
                ))}
              </ul>
            </div>

            <div className="differences">
              <h5> Differences</h5>
              <ul>
                {comparisonData.differences.map((item, index) => (
                  <li key={index}>{difference}</li>
                ))}
              </ul>
            </div>

            {comparisonData.recommendations.length > 0 && (
              <div className="recommendations">
                <h5> Recommendations</h5>
                <ul>
                  {comparisonData.recommendations.map((item, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="move-compendium">
      <div className="compendium-header">
        <h2> Move Compendium</h2>
        <div className="header-actions">
          <motion.button
            className="btn btn-secondary"
            onClick={() => updateState({ showFilters: !state.showFilters })}
            whileHover={prefersReduced ? undefined : { scale: 1.02 }}
            whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          >
            {state.showFilters ? 'Hide' : 'Show'}
            {' '}
            Filters
          </motion.button>
          <motion.button
            className="btn btn-secondary"
            onClick={() => updateState({ showComparison: !state.showComparison })}
            whileHover={prefersReduced ? undefined : { scale: 1.02 }}
            whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          >
            {state.showComparison ? 'Hide' : 'Show'}
            {' '}
            Comparison
          </motion.button>
          {state.selectedMoves.length > 0 && (
            <motion.button
              className="btn btn-secondary"
              onClick={clearSelections}
              whileHover={prefersReduced ? undefined : { scale: 1.02 }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
            >
              Clear Selection (
              {state.selectedMoves.length}
              )
            </motion.button>
          )}
        </div>
      </div>

      {state.showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="search-filter">Search:</label>
              <input
                id="search-filter"
                type="text"
                value={state.searchQuery}
                onChange={e => updateState({ searchQuery: e.target.value })}
                placeholder="Search moves..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <Select value={state.selectedCategory} onValueChange={(v) => updateState({ selectedCategory: v })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {moveCompendiumService.getMoveCategories().map(category => (
                    <SelectItem key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="type-filter">Type:</label>
              <Select value={state.selectedType} onValueChange={(v) => updateState({ selectedType: v })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {moveCompendiumService.getMoveTypes().map(type => (
                    <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="trigger-filter">Trigger:</label>
              <Select value={state.selectedTriggerType} onValueChange={(v) => updateState({ selectedTriggerType: v })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Triggers" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Triggers</SelectItem>
                  {moveCompendiumService.getTriggerTypes().map(trigger => (
                    <SelectItem key={trigger} value={trigger}>{trigger.charAt(0).toUpperCase() + trigger.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="class-filter">Class:</label>
              <Select value={state.selectedClass} onValueChange={(v) => updateState({ selectedClass: v })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Fighter">Fighter</SelectItem>
                  <SelectItem value="Wizard">Wizard</SelectItem>
                  <SelectItem value="Cleric">Cleric</SelectItem>
                  <SelectItem value="Thief">Thief</SelectItem>
                  <SelectItem value="Ranger">Ranger</SelectItem>
                  <SelectItem value="Paladin">Paladin</SelectItem>
                  <SelectItem value="Bard">Bard</SelectItem>
                  <SelectItem value="Druid">Druid</SelectItem>
                  <SelectItem value="Barbarian">Barbarian</SelectItem>
                  <SelectItem value="Immolator">Immolator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="level-filter">Level:</label>
              <Select value={state.selectedLevel} onValueChange={(v) => updateState({ selectedLevel: v })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <SelectItem key={level} value={String(level)}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="roll-stat-filter">Roll Stat:</label>
              <Select value={state.selectedRollStat} onValueChange={(v) => updateState({ selectedRollStat: v })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Stats" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stats</SelectItem>
                  <SelectItem value="STR">Strength</SelectItem>
                  <SelectItem value="DEX">Dexterity</SelectItem>
                  <SelectItem value="CON">Constitution</SelectItem>
                  <SelectItem value="INT">Intelligence</SelectItem>
                  <SelectItem value="WIS">Wisdom</SelectItem>
                  <SelectItem value="CHA">Charisma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter">Sort By:</label>
              <Select value={state.sortBy} onValueChange={(v) => updateState({ sortBy: v as any })}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="level">Level</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="view-filter">View:</label>
              <Select value={state.viewMode} onValueChange={(v) => updateState({ viewMode: v as any })}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="tags-filter">
              <label> Tags:</label>
              <div className="tags-list">
                {allTags.map(tag => (
                  <label key={tag} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={state.selectedTags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateState({ selectedTags: [...state.selectedTags, tag] })
                        }
                        else {
                          updateState({
                            selectedTags: state.selectedTags.filter(t => t !== tag),
                          })
                        }
                      }}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="compendium-stats">
        <p>
          {' '}
          Showing
          {filteredMoves.length}
          {' '}
          of
          {availableMoves.length}
          {' '}
          moves
          {state.searchQuery && ` matching "${state.searchQuery}"`}
        </p>
      </div>

      {state.showComparison && state.selectedMoves.length === 2 && (
        renderComparisonPanel()
      )}

      <motion.div className={`moves-container view-${state.viewMode}`} variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
        {filteredMoves.length > 0
          ? (
              filteredMoves.map(renderMoveCard)
            )
          : (
              <motion.div className="no-results" variants={itemFadeIn}>
                <p> No moves found matching your criteria.</p>
                <motion.button
                  className="btn btn-primary"
                  onClick={() => updateState({
                    searchQuery: '',
                    selectedCategory: 'all',
                    selectedType: 'all',
                    selectedTriggerType: 'all',
                    selectedClass: 'all',
                    selectedLevel: 'all',
                    selectedRollStat: 'all',
                    selectedTags: [],
                  })}
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            )}
      </motion.div>
    </div>
  )
}

export default MoveCompendium
