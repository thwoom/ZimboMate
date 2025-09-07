/**
 * Move Search Component-Search and filter moves with advanced options
 */

import type {
  MoveIndexEntry,
  MoveIndexStats,
  MoveSearchFilters,
  MoveSearchResult,
} from '../services/MoveIndexService'

import React, { useCallback, useEffect, useState } from 'react'
import {
  moveIndexService,
} from '../services/MoveIndexService'

import './MoveSearch.css'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { motion, useReducedMotion } from 'framer-motion'
import { staggerContainer, itemFadeIn } from '../utils/motion'

interface MoveSearchProps {
  onMoveSelect?: (move: MoveIndexEntry) => void
  className?: string
  initialFilters?: MoveSearchFilters
  showFilters?: boolean
  showStats?: boolean
}

export const MoveSearch: React.FC <MoveSearchProps> = ({
  onMoveSelect,
  className = '',
  initialFilters = {},
  showFilters = true,
  showStats = true,
}) => {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState <MoveSearchFilters>(initialFilters)
  const [results, setResults] = useState <MoveSearchResult | null>(null)
  const [stats, setStats] = useState <MoveIndexStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState <string[]>([])
  const [availableSources, setAvailableSources] = useState <string[]>([])
  const [selectedMove, setSelectedMove] = useState <MoveIndexEntry | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: MoveSearchFilters) => {
      setIsLoading(true)
      try {
        const searchResults = await moveIndexService.searchMoves(searchQuery, searchFilters)
        setResults(searchResults)
      }
      catch {
      }
      finally {
        setIsLoading(false)
      }
    }, 300),
    [],
  )

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        // Load stats
        if (showStats) {
          const indexStats = await moveIndexService.getIndexStats()
          setStats(indexStats)
        }

        // Load available options for filters
        const tags = await moveIndexService.getAvailableTags()
        const sources = await moveIndexService.getAvailableSources()
        setAvailableTags(tags)
        setAvailableSources(sources)

        // Perform initial search
        const initialResults = await moveIndexService.searchMoves('', filters)
        setResults(initialResults)
      }
      catch {
      }
      finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [showStats, filters])

  // Handle search query changes
  useEffect(() => {
    debouncedSearch(query, filters)
  }, [query, filters, debouncedSearch])

  const handleQueryChange = (e: React.ChangeEvent <HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleFilterChange = (filterType: keyof MoveSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const handleMoveClick = (move: MoveIndexEntry) => {
    setSelectedMove(move)
    onMoveSelect?.(move)
  }

  const clearFilters = () => {
    setFilters({})
    setQuery('')
  }

  const getFilterCount = () => {
    let count = 0
    if (query)
      count++
    for (const value of Object.values(filters)) {
      if (Array.isArray(value) && value.length > 0)
        count++
      if (typeof value === 'boolean')
        count++
    }
    return count
  }

  const renderMoveCard = (move: MoveIndexEntry) => {
    const isSelected = selectedMove?.id === move.id

    return (
      <motion.div
        key={move.id}
        className={`move-search-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleMoveClick(move)}
        variants={itemFadeIn}
        whileHover={{ scale: 1.01 }}
      >
        <div className="move-header">
          <h4 className="move-name">{move.name}</h4>
          <div className="move-meta">
            <span className={`move-category ${move.category}`}>
              {move.category}
            </span>
            {move.class && (
              <span className="move-class">{move.class}</span>
            )}
            {move.level && (
              <span className="move-level">
                Level
                {move.level}
              </span>
            )}
          </div>
        </div>

        <p className="move-description">
          {move.description.length > 150
            ? `${move.description.slice(0, 150)}...`
            : move.description}
        </p>

        <div className="move-tags">
          {move.rollStat && (
            <span className="tag stat">
              +
              {move.rollStat}
            </span>
          )}
          {move.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {move.tags.length > 3 && (
            <span className="tag more">
              +
              {move.tags.length - 3}
            </span>
          )}
        </div>

        <div className="move-footer">
          <span className="move-source">{move.source}</span>
          {move.page && (
            <span className="move-page">
              p.
              {move.page}
            </span>
          )}
        </div>
      </motion.div>
    )
  }

  const renderFilters = () => {
    if (!showFilters)
      return null

    return (
      <div className="move-search-filters">
        <div className="filter-section">
          <h4> Quick Filters</h4>
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="category-filter">Category</label>
              <Select value={filters.category?.[0] || ''} onValueChange={(v) => handleFilterChange('category', v ? [v] : undefined)}>
                <SelectTrigger className="w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="basic">Basic Moves</SelectItem>
                  <SelectItem value="advanced">Advanced Moves</SelectItem>
                  <SelectItem value="racial">Racial Moves</SelectItem>
                  <SelectItem value="special">Special Moves</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="class-filter">Class</label>
              <Select value={filters.class?.[0] || ''} onValueChange={(v) => handleFilterChange('class', v ? [v] : undefined)}>
                <SelectTrigger className="w-48"><SelectValue placeholder="All Classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  <SelectItem value="Fighter">Fighter</SelectItem>
                  <SelectItem value="Wizard">Wizard</SelectItem>
                  <SelectItem value="Cleric">Cleric</SelectItem>
                  <SelectItem value="Thief">Thief</SelectItem>
                  <SelectItem value="Ranger">Ranger</SelectItem>
                  <SelectItem value="Paladin">Paladin</SelectItem>
                  <SelectItem value="Druid">Druid</SelectItem>
                  <SelectItem value="Bard">Bard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label htmlFor="roll-stat-filter">Roll Stat</label>
              <Select value={filters.rollStat?.[0] || ''} onValueChange={(v) => handleFilterChange('rollStat', v ? [v] : undefined)}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Any Stat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Stat</SelectItem>
                  <SelectItem value="STR">Strength</SelectItem>
                  <SelectItem value="DEX">Dexterity</SelectItem>
                  <SelectItem value="CON">Constitution</SelectItem>
                  <SelectItem value="INT">Intelligence</SelectItem>
                  <SelectItem value="WIS">Wisdom</SelectItem>
                  <SelectItem value="CHA">Charisma</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <motion.button
          className="advanced-filters-toggle"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {showAdvancedFilters ? 'Hide' : 'Show'}
          {' '}
          Advanced Filters
        </motion.button>

        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filter-section">
              <h4> Advanced Filters</h4>
              <div className="filter-row">
                <div className="filter-group">
                  <label> Level Range</label>
                  <div className="level-range">
                    <input
                      type="number"
                      placeholder="Min"
                      min="1"
                      max="10"
                      value={filters.level?.[0] || ''}
                      onChange={(e) => {
                        const min = e.target.value ? Number.parseInt(e.target.value) : undefined
                        const max = filters.level?.[1]
                        handleFilterChange('level', min !== undefined ? [min, max].filter(Boolean) : undefined)
                      }}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      min="1"
                      max="10"
                      value={filters.level?.[1] || ''}
                      onChange={(e) => {
                        const min = filters.level?.[0]
                        const max = e.target.value ? Number.parseInt(e.target.value) : undefined
                        handleFilterChange('level', [min, max].filter(Boolean))
                      }}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label htmlFor="source-filter">Source</label>
                  <Select value={filters.source?.[0] || ''} onValueChange={(v) => handleFilterChange('source', v ? [v] : undefined)}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="All Sources" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sources</SelectItem>
                      {availableSources.map(source => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="prerequisites-filter">Has Prerequisites</label>
                  <Select value={filters.hasPrerequisites?.toString() || ''} onValueChange={(v) => handleFilterChange('hasPrerequisites', v === 'true' ? true : v === 'false' ? false : undefined)}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="filter-group">
                  <label htmlFor="cross-references-filter">Has Cross-References</label>
                  <Select value={filters.hasCrossReferences?.toString() || ''} onValueChange={(v) => handleFilterChange('hasCrossReferences', v === 'true' ? true : v === 'false' ? false : undefined)}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {getFilterCount() > 0 && (
          <motion.button className="clear-filters" onClick={clearFilters} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Clear All Filters (
            {getFilterCount()}
            )
          </motion.button>
        )}
      </div>
    )
  }

  const renderStats = () => {
    if (!showStats || !stats)
      return null

    return (
      <div className="move-search-stats">
        <h4> Move Library Stats</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.totalMoves}</span>
            <span className="stat-label">Total Moves</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Object.keys(stats.byCategory).length}</span>
            <span className="stat-label">Categories</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Object.keys(stats.byClass).length}</span>
            <span className="stat-label">Classes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Object.keys(stats.bySource).length}</span>
            <span className="stat-label">Sources</span>
          </div>
        </div>
      </div>
    )
  }

  const prefersReduced = useReducedMotion()
  return (
    <div className={`move-search ${className}`}>
      <div className="move-search-header">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search moves by name, description, or tags..."
            value={query}
            onChange={handleQueryChange}
            className="search-input"
          />
          {isLoading && <div className="search-spinner" />}
        </div>
      </div>

      {renderStats()}
      {renderFilters()}

      <div className="move-search-results">
        {results && (
          <div className="results-header">
            <span className="results-count">
              {results.totalCount}
              {' '}
              moves found
            </span>
            {results.searchTime > 0 && (
              <span className="search-time">
                in
                {' '}
                {results.searchTime.toFixed(1)}
                ms
              </span>
            )}
          </div>
        )}

        {isLoading
          ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <p> Searching moves...</p>
              </div>
            )
          : results?.entries.length === 0
            ? (
                <motion.div className="no-results" variants={itemFadeIn} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
                  <p> No moves found matching your criteria.</p>
                  <motion.button onClick={clearFilters} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Clear filters</motion.button>
                </motion.div>
              )
            : (
                <motion.div className="move-results-grid" variants={staggerContainer} initial={prefersReduced ? false : 'hidden'} animate={prefersReduced ? undefined : 'visible'}>
                  {results?.entries.map(renderMoveCard)}
                </motion.div>
              )}
      </div>
    </div>
  )
}

// Debounce utility function
function debounce<T extends(...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters <T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters <T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default MoveSearch
