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
      let aValue: unknown, bValue: unknown

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

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
      else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
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
      <div
        key={move.id}
        className={`move-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
        onClick={() => toggleMoveSelection(move.id)}
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
      </div>
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
          <button
            className="btn btn-secondary"
            onClick={() => updateState({ showFilters: !state.showFilters })}
          >
            {state.showFilters ? 'Hide' : 'Show'}
            {' '}
            Filters
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => updateState({ showComparison: !state.showComparison })}
          >
            {state.showComparison ? 'Hide' : 'Show'}
            {' '}
            Comparison
          </button>
          {state.selectedMoves.length > 0 && (
            <button
              className="btn btn-secondary"
              onClick={clearSelections}
            >
              Clear Selection (
              {state.selectedMoves.length}
              )
            </button>
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
              <select
                id="category-filter"
                value={state.selectedCategory}
                onChange={e => updateState({ selectedCategory: e.target.value })}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {moveCompendiumService.getMoveCategories().map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="type-filter">Type:</label>
              <select
                id="type-filter"
                value={state.selectedType}
                onChange={e => updateState({ selectedType: e.target.value })}
                className="filter-select"
              >
                <option value="all">All Types</option>
                {moveCompendiumService.getMoveTypes().map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="trigger-filter">Trigger:</label>
              <select
                id="trigger-filter"
                value={state.selectedTriggerType}
                onChange={e => updateState({ selectedTriggerType: e.target.value })}
                className="filter-select"
              >
                <option value="all">All Triggers</option>
                {moveCompendiumService.getTriggerTypes().map(trigger => (
                  <option key={trigger} value={trigger}>
                    {trigger.charAt(0).toUpperCase() + trigger.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="class-filter">Class:</label>
              <select
                id="class-filter"
                value={state.selectedClass}
                onChange={e => updateState({ selectedClass: e.target.value })}
                className="filter-select"
              >
                <option value="all">All Classes</option>
                <option value="Fighter">Fighter</option>
                <option value="Wizard">Wizard</option>
                <option value="Cleric">Cleric</option>
                <option value="Thief">Thief</option>
                <option value="Ranger">Ranger</option>
                <option value="Paladin">Paladin</option>
                <option value="Bard">Bard</option>
                <option value="Druid">Druid</option>
                <option value="Barbarian">Barbarian</option>
                <option value="Immolator">Immolator</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="level-filter">Level:</label>
              <select
                id="level-filter"
                value={state.selectedLevel}
                onChange={e => updateState({ selectedLevel: e.target.value })}
                className="filter-select"
              >
                <option value="all">All Levels</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="roll-stat-filter">Roll Stat:</label>
              <select
                id="roll-stat-filter"
                value={state.selectedRollStat}
                onChange={e => updateState({ selectedRollStat: e.target.value })}
                className="filter-select"
              >
                <option value="all">All Stats</option>
                <option value="STR">Strength</option>
                <option value="DEX">Dexterity</option>
                <option value="CON">Constitution</option>
                <option value="INT">Intelligence</option>
                <option value="WIS">Wisdom</option>
                <option value="CHA">Charisma</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter">Sort By:</label>
              <select
                id="sort-filter"
                value={state.sortBy}
                onChange={e => updateState({ sortBy: e.target.value as string })}
                className="filter-select"
              >
                <option value="name">Name</option>
                <option value="level">Level</option>
                <option value="category">Category</option>
                <option value="type">Type</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="view-filter">View:</label>
              <select
                id="view-filter"
                value={state.viewMode}
                onChange={e => updateState({ viewMode: e.target.value as string })}
                className="filter-select"
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
                <option value="detailed">Detailed</option>
              </select>
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

      <div className={`moves-container view-${state.viewMode}`}>
        {filteredMoves.length > 0
          ? (
              filteredMoves.map(renderMoveCard)
            )
          : (
              <div className="no-results">
                <p> No moves found matching your criteria.</p>
                <button
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
                >
                  Clear All Filters
                </button>
              </div>
            )}
      </div>
    </div>
  )
}

export default MoveCompendium
