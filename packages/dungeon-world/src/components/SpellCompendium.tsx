/**
 * Enhanced Spell Compendium Component
 *
 * Provides comprehensive spell browsing, search, filtering, and comparison * functionality for the Dungeon World control panel.
 */

import type {
  CompendiumSpell,
  SpellLevel,
  SpellSchool,
} from '../data/spellCompendium'

import type {
  SpellSearchOptions,
} from '../services/SpellCompendiumService'

import React, { useMemo, useState } from 'react'
import {
  spellCompendiumService,
} from '../services/SpellCompendiumService'
import { useGameStore } from '../store/GameStore'
import './SpellCompendium.css'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '../utils/motion'

interface SpellCompendiumProps {
  onSpellSelect?: (spell: CompendiumSpell) => void
  showPreparationTools?: boolean
  showComparisonTools?: boolean
  showUsageStats?: boolean
}

interface SpellCompendiumState {
  searchQuery: string
  selectedClass: string
  selectedLevel: SpellLevel | 'all'
  selectedSchool: SpellSchool | 'all'
  selectedTags: string[]
  viewMode: 'grid' | 'list' | 'table'
  sortBy: 'name' | 'level' | 'school' | 'category'
  sortOrder: 'asc' | 'desc'
  showFilters: boolean
  selectedSpells: string[]
  comparisonMode: boolean
}

const SpellCompendium: React.FC <SpellCompendiumProps> = ({
  onSpellSelect,
  showPreparationTools = true,
  showComparisonTools = true,
  showUsageStats = false,
}) => {
  const { state: gameState } = useGameStore()
  const character = gameState.activeCharacterId
    ? gameState.characters[gameState.activeCharacterId]
    : null
  const prefersReduced = useReducedMotion()

  const [state, setState] = useState <SpellCompendiumState>({
    searchQuery: '',
    selectedClass: 'all',
    selectedLevel: 'all',
    selectedSchool: 'all',
    selectedTags: [],
    viewMode: 'grid',
    sortBy: 'name',
    sortOrder: 'asc',
    showFilters: false,
    selectedSpells: [],
    comparisonMode: false,
  })

  // Get available spells based on filters
  const filteredSpells = useMemo(() => {
    const options: SpellSearchOptions = {
      query: state.searchQuery || undefined,
      class: state.selectedClass !== 'all' ? state.selectedClass as string : undefined,
      level: state.selectedLevel !== 'all' ? state.selectedLevel : undefined,
      school: state.selectedSchool !== 'all' ? state.selectedSchool : undefined,
      tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
    }

    return spellCompendiumService.getAllSpells(options)
  }, [state.searchQuery, state.selectedClass, state.selectedLevel, state.selectedSchool, state.selectedTags])

  // Sort spells
  const sortedSpells = useMemo(() => {
    return [...filteredSpells].sort((a, b) => {
      let comparison = 0

      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'level':
          comparison = a.level - b.level
          break
        case 'school':
          comparison = a.school.localeCompare(b.school)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
      }

      return state.sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredSpells, state.sortBy, state.sortOrder])

  // Spell comparison data
  const spellComparison = useMemo(() => {
    if (state.selectedSpells.length === 2 && state.comparisonMode) {
      return spellCompendiumService.compareSpells(state.selectedSpells[0], state.selectedSpells[1])
    }
    return null
  }, [state.selectedSpells, state.comparisonMode])

  // Preparation validation
  const preparationValidation = useMemo(() => {
    if (!character || !showPreparationTools)
      return null
    return spellCompendiumService.validateSpellPreparation(character, state.selectedSpells)
  }, [character, state.selectedSpells, showPreparationTools])

  const updateState = (updates: Partial <SpellCompendiumState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const handleSpellSelect = (spell: CompendiumSpell) => {
    if (onSpellSelect) {
      onSpellSelect(spell)
    }
  }

  const handleSpellToggle = (spellId: string) => {
    updateState({
      selectedSpells: state.selectedSpells.includes(spellId)
        ? state.selectedSpells.filter(id => id !== spellId)
        : [...state.selectedSpells, spellId],
    })
  }

  const handleComparisonToggle = () => {
    updateState({
      comparisonMode: !state.comparisonMode,
      selectedSpells: state.comparisonMode ? [] : state.selectedSpells.slice(0, 2),
    })
  }

  const clearFilters = () => {
    updateState({
      searchQuery: '',
      selectedClass: 'all',
      selectedLevel: 'all',
      selectedSchool: 'all',
      selectedTags: [],
    })
  }

  const getSpellLevelLabel = (level: SpellLevel): string => {
    if (level === 0)
      return 'Cantrip / Rote'
    return `Level ${level}`
  }

  const getSpellSchoolLabel = (school: SpellSchool): string => {
    return school.charAt(0).toUpperCase() + school.slice(1)
  }

  return (
    <div className="spell-compendium">
      {/* Header */}
      <div className="compendium-header">
        <h2>📚 Spell Compendium</h2>
        <div className="header-controls">
          <motion.button
            className="filter-toggle"
            onClick={() => updateState({ showFilters: !state.showFilters })}
            whileHover={prefersReduced ? undefined : { scale: 1.02 }}
            whileTap={prefersReduced ? undefined : { scale: 0.98 }}
          >
            {state.showFilters ? 'Hide' : 'Show'}
            {' '}
            Filters
          </motion.button>
          {showComparisonTools && (
            <motion.button
              className={`comparison-toggle ${state.comparisonMode ? 'active' : ''}`}
              onClick={handleComparisonToggle}
              disabled={state.selectedSpells.length < 2}
              whileHover={prefersReduced ? undefined : { scale: 1.02 }}
              whileTap={prefersReduced ? undefined : { scale: 0.98 }}
            >
              Compare Spells
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters */}
      {state.showFilters && (
        <div className="compendium-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label> Search:</label>
              <input
                type="text"
                value={state.searchQuery}
                onChange={e => updateState({ searchQuery: e.target.value })}
                placeholder="Search spells..."
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="class-filter">Class:</label>
              <Select value={state.selectedClass} onValueChange={(v) => updateState({ selectedClass: v })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="wizard">Wizard</SelectItem>
                  <SelectItem value="cleric">Cleric</SelectItem>
                  <SelectItem value="immolator">Immolator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="level-filter">Level:</label>
              <Select value={String(state.selectedLevel)} onValueChange={(v) => updateState({ selectedLevel: v === 'all' ? 'all' : (Number(v) as any) })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="0">Cantrips / Rotes</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                  <SelectItem value="5">Level 5</SelectItem>
                  <SelectItem value="7">Level 7</SelectItem>
                  <SelectItem value="9">Level 9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="school-filter">School:</label>
              <Select value={state.selectedSchool} onValueChange={(v) => updateState({ selectedSchool: v as any })}>
                <SelectTrigger className="w-56"><SelectValue placeholder="All Schools" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {spellCompendiumService.getSpellSchools().map(school => (
                    <SelectItem key={school} value={school}>{getSpellSchoolLabel(school)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="sort-filter">Sort By:</label>
              <Select value={state.sortBy} onValueChange={(v) => updateState({ sortBy: v as any })}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="level">Level</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="category">Class</SelectItem>
                </SelectContent>
              </Select>
              <motion.button
                className="sort-order"
                onClick={() => updateState({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' })}
                whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                whileTap={prefersReduced ? undefined : { scale: 0.98 }}
              >
                {state.sortOrder === 'asc' ? '↑' : '↓'}
              </motion.button>
            </div>

            <div className="filter-group">
              <label htmlFor="view-filter">View:</label>
              <Select value={state.viewMode} onValueChange={(v) => updateState({ viewMode: v as any })}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <motion.button className="clear-filters" onClick={clearFilters} whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>
              Clear Filters
            </motion.button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <span>
          {sortedSpells.length}
          {' '}
          spells found
        </span>
        {character && (
          <span>
            •
            {spellCompendiumService.getAvailableSpells(character).length}
            {' '}
            available for your class
          </span>
        )}
      </div>

      {/* Spell Comparison */}
      {spellComparison && (
        <div className="spell-comparison">
          <h3> Spell Comparison</h3>
          <div className="comparison-grid">
            <div className="comparison-spell">
              <h4>{spellComparison.spell1.name}</h4>
              <p>
                <strong> Level:</strong>
                {' '}
                {getSpellLevelLabel(spellComparison.spell1.level)}
              </p>
              <p>
                <strong> School:</strong>
                {' '}
                {getSpellSchoolLabel(spellComparison.spell1.school)}
              </p>
              <p>
                <strong> Range:</strong>
                {' '}
                {spellComparison.spell1.range || 'N / A'}
              </p>
              <p>
                <strong> Duration:</strong>
                {' '}
                {spellComparison.spell1.duration || 'N / A'}
              </p>
              <p>
                <strong> Tags:</strong>
                {' '}
                {spellComparison.spell1.tags.join(', ')}
              </p>
            </div>

            <div className="comparison-spell">
              <h4>{spellComparison.spell2.name}</h4>
              <p>
                <strong> Level:</strong>
                {' '}
                {getSpellLevelLabel(spellComparison.spell2.level)}
              </p>
              <p>
                <strong> School:</strong>
                {' '}
                {getSpellSchoolLabel(spellComparison.spell2.school)}
              </p>
              <p>
                <strong> Range:</strong>
                {' '}
                {spellComparison.spell2.range || 'N / A'}
              </p>
              <p>
                <strong> Duration:</strong>
                {' '}
                {spellComparison.spell2.duration || 'N / A'}
              </p>
              <p>
                <strong> Tags:</strong>
                {' '}
                {spellComparison.spell2.tags.join(', ')}
              </p>
            </div>
          </div>

          {spellComparison.similarities.length > 0 && (
            <div className="similarities">
              <h5> Similarities:</h5>
              <ul>
                {spellComparison.similarities.map((item, index) => (
                  <li key={index}>{similarity}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Preparation Validation */}
      {preparationValidation && (
        <div className={`preparation-validation ${preparationValidation.isValid ? 'valid' : 'invalid'}`}>
          <h3> Preparation Status</h3>
          <div className="validation-summary">
            <p>
              <strong> Total Levels:</strong>
              {' '}
              {preparationValidation.totalLevels}
              /
              {preparationValidation.maxLevels}
            </p>
            <p>
              <strong> Cantrips:</strong>
              {' '}
              {preparationValidation.cantripsCount}
            </p>
            <p>
              <strong> Leveled Spells:</strong>
              {' '}
              {preparationValidation.leveledSpellsCount}
            </p>
          </div>

          {preparationValidation.errors.length > 0 && (
            <div className="validation-errors">
              <h4> Errors:</h4>
              <ul>
                {preparationValidation.errors.map((item, index) => (
                  <li key={index} className="error">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {preparationValidation.warnings.length > 0 && (
            <div className="validation-warnings">
              <h4> Warnings:</h4>
              <ul>
                {preparationValidation.warnings.map((item, index) => (
                  <li key={index} className="warning">{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Spell Grid */}
      <motion.div className={`spell-grid ${state.viewMode}`} variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
        {sortedSpells.map(spell => (
          <motion.div
            key={spell.id}
            className={`spell-card ${state.selectedSpells.includes(spell.id) ? 'selected' : ''}`}
            onClick={() => handleSpellSelect(spell)}
            variants={itemFadeIn}
            whileHover={prefersReduced ? undefined : { scale: 1.01 }}
          >
            <div className="spell-header">
              <h3 className="spell-name">{spell.name}</h3>
              <div className="spell-meta">
                <span className="spell-level">{getSpellLevelLabel(spell.level)}</span>
                <span className="spell-school">{getSpellSchoolLabel(spell.school)}</span>
                <span className="spell-class">{spell.category}</span>
              </div>
            </div>

            <div className="spell-content">
              <p className="spell-description">{spell.description}</p>
              <p className="spell-effect">
                <strong> Effect:</strong>
                {' '}
                {spell.effect}
              </p>

              <div className="spell-details">
                {spell.range && (
                  <span>
                    <strong> Range:</strong>
                    {' '}
                    {spell.range}
                  </span>
                )}
                {spell.duration && (
                  <span>
                    <strong> Duration:</strong>
                    {' '}
                    {spell.duration}
                  </span>
                )}
              </div>

              <div className="spell-tags">
                {spell.tags.map(tag => (
                  <span key={tag} className="spell-tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="spell-actions">
              {showPreparationTools && (
                <motion.button
                  className={`select-spell ${state.selectedSpells.includes(spell.id) ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSpellToggle(spell.id)
                  }}
                  whileHover={prefersReduced ? undefined : { scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                >
                  {state.selectedSpells.includes(spell.id) ? 'Selected' : 'Select'}
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* No Results */}
      {sortedSpells.length === 0 && (
        <motion.div className="no-results" variants={itemFadeIn} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
          <p> No spells found matching your criteria.</p>
          <motion.button onClick={clearFilters} whileHover={prefersReduced ? undefined : { scale: 1.02 }} whileTap={prefersReduced ? undefined : { scale: 0.98 }}>Clear Filters</motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default SpellCompendium
