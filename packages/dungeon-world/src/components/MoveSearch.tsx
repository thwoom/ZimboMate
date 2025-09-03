/**
 * Move Search Component-Search and filter moves with advanced options
 */

import './MoveSearch.css';

import React, { useCallback,useEffect, useState } from 'react';

import {
  MoveIndexEntry,
  moveIndexService,
  MoveIndexStats,
  MoveSearchFilters,
  MoveSearchResult,
} from '../services/MoveIndexService';

interface MoveSearchProps {
  onMoveSelect?: (move: MoveIndexEntry) => void;
  className?: string;
  initialFilters?: MoveSearchFilters;
  showFilters?: boolean;
  showStats?: boolean;
}

export const MoveSearch: React.FC < MoveSearchProps> = ({
  onMoveSelect,
  className = '',
  initialFilters = {},
  showFilters = true,
  showStats = true,
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState < MoveSearchFilters>(initialFilters);
  const [results, setResults] = useState < MoveSearchResult | null>(null);
  const [stats, setStats] = useState < MoveIndexStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState < string[]>([]);
  const [availableSources, setAvailableSources] = useState < string[]>([]);
  const [selectedMove, setSelectedMove] = useState < MoveIndexEntry | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async(searchQuery: string, searchFilters: MoveSearchFilters) => {
      setIsLoading(true);
      try {
        const searchResults = await moveIndexService.searchMoves(searchQuery, searchFilters);
        setResults(searchResults);
      } catch {
        } finally {
        setIsLoading(false);
      }
    }, 300),
    [],
  );

  // Load initial data
  useEffect(() => {
    const loadInitialData = async() => {
      setIsLoading(true);
      try {
        // Load stats
        if (showStats) {
          const indexStats = await moveIndexService.getIndexStats();
          setStats(indexStats);
        }

        // Load available options for filters
        const tags = await moveIndexService.getAvailableTags();
        const sources = await moveIndexService.getAvailableSources();
        setAvailableTags(tags);
        setAvailableSources(sources);

        // Perform initial search
        const initialResults = await moveIndexService.searchMoves('', filters);
        setResults(initialResults);
      } catch {
        } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [showStats, filters]);

  // Handle search query changes
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  const handleQueryChange = (e: React.ChangeEvent < HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFilterChange = (filterType: keyof MoveSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleMoveClick = (move: MoveIndexEntry) => {
    setSelectedMove(move);
    onMoveSelect?.(move);
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
  };

  const getFilterCount = () => {
    let count = 0;
    if (query) count++;
    for (const value of Object.values(filters)) {
      if (Array.isArray(value) && value.length > 0) count++;
      if (typeof value === 'boolean') count++;
    }
    return count;
  };

  const renderMoveCard = (move: MoveIndexEntry) => {
    const isSelected = selectedMove?.id === move.id;

    return (
      <div
        key={move.id}
        className={`move-search-card ${isSelected ? 'selected' : ''}`}
        onClick={() => handleMoveClick(move)}
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
              <span className="move-level">Level {move.level}</span>
            )}
          </div>
        </div>

        <p className="move-description">
          {move.description.length > 150
            ? `${move.description.slice(0, 150)}...`
            : move.description
          }
        </p>

        <div className="move-tags">
          {move.rollStat && (
            <span className="tag stat">+{move.rollStat}</span>
          )}
          {move.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {move.tags.length > 3 && (
            <span className="tag more">+{move.tags.length-3}</span>
          )}
        </div>

        <div className="move-footer">
          <span className="move-source">{move.source}</span>
          {move.page && (
            <span className="move-page">p.{move.page}</span>
          )}
        </div>
      </div>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="move-search-filters">
        <div className="filter-section">
          <h4 > Quick Filters</h4>
          <div className="filter-row">
                         <div className="filter-group">
               <label htmlFor="category-filter">Category</label>
               <select
                 id="category-filter"
                 aria-label="Filter by move category"
                 value={filters.category?.[0] || ''}
                 onChange={(e) => handleFilterChange('category', e.target.value ? [e.target.value] : undefined)}
               >
                <option value="">All Categories</option>
                <option value="basic">Basic Moves</option>
                <option value="advanced">Advanced Moves</option>
                <option value="racial">Racial Moves</option>
                <option value="special">Special Moves</option>
              </select>
            </div>

                         <div className="filter-group">
               <label htmlFor="class-filter">Class</label>
               <select
                 id="class-filter"
                 aria-label="Filter by character class"
                 value={filters.class?.[0] || ''}
                 onChange={(e) => handleFilterChange('class', e.target.value ? [e.target.value] : undefined)}
               >
                <option value="">All Classes</option>
                <option value="Fighter">Fighter</option>
                <option value="Wizard">Wizard</option>
                <option value="Cleric">Cleric</option>
                <option value="Thief">Thief</option>
                <option value="Ranger">Ranger</option>
                <option value="Paladin">Paladin</option>
                <option value="Druid">Druid</option>
                <option value="Bard">Bard</option>
              </select>
            </div>

                         <div className="filter-group">
               <label htmlFor="roll-stat-filter">Roll Stat</label>
               <select
                 id="roll-stat-filter"
                 aria-label="Filter by roll stat"
                 value={filters.rollStat?.[0] || ''}
                 onChange={(e) => handleFilterChange('rollStat', e.target.value ? [e.target.value] : undefined)}
               >
                <option value="">Any Stat</option>
                <option value="STR">Strength</option>
                <option value="DEX">Dexterity</option>
                <option value="CON">Constitution</option>
                <option value="INT">Intelligence</option>
                <option value="WIS">Wisdom</option>
                <option value="CHA">Charisma</option>
              </select>
            </div>
          </div>
        </div>

        <button
          className="advanced-filters-toggle"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="filter-section">
              <h4 > Advanced Filters</h4>
              <div className="filter-row">
                <div className="filter-group">
                  <label > Level Range</label>
                  <div className="level-range">
                    <input
                      type="number"
                      placeholder="Min"
                      min="1"
                      max="10"
                      value={filters.level?.[0] || ''}
                      onChange={(e) => {
                        const min = e.target.value ? Number.parseInt(e.target.value) : undefined;
                        const max = filters.level?.[1];
                        handleFilterChange('level', min !== undefined ? [min, max].filter(Boolean) : undefined);
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
                        const min = filters.level?.[0];
                        const max = e.target.value ? Number.parseInt(e.target.value) : undefined;
                        handleFilterChange('level', [min, max].filter(Boolean));
                      }}
                    />
                  </div>
                </div>

                                 <div className="filter-group">
                   <label htmlFor="source-filter">Source</label>
                   <select
                     id="source-filter"
                     aria-label="Filter by source"
                     value={filters.source?.[0] || ''}
                     onChange={(e) => handleFilterChange('source', e.target.value ? [e.target.value] : undefined)}
                   >
                    <option value="">All Sources</option>
                    {availableSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-row">
                                 <div className="filter-group">
                   <label htmlFor="prerequisites-filter">Has Prerequisites</label>
                   <select
                     id="prerequisites-filter"
                     aria-label="Filter by prerequisites"
                     value={filters.hasPrerequisites?.toString() || ''}
                     onChange={(e) => handleFilterChange('hasPrerequisites', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                   >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                                 <div className="filter-group">
                   <label htmlFor="cross-references-filter">Has Cross-References</label>
                   <select
                     id="cross-references-filter"
                     aria-label="Filter by cross-references"
                     value={filters.hasCrossReferences?.toString() || ''}
                     onChange={(e) => handleFilterChange('hasCrossReferences', e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined)}
                   >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {getFilterCount() > 0 && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear All Filters ({getFilterCount()})
          </button>
        )}
      </div>
    );
  };

  const renderStats = () => {
    if (!showStats || !stats) return null;

    return (
      <div className="move-search-stats">
        <h4 > Move Library Stats</h4>
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
    );
  };

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
              {results.totalCount} moves found
            </span>
            {results.searchTime > 0 && (
              <span className="search-time">
                in {results.searchTime.toFixed(1)}ms
              </span>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p > Searching moves...</p>
          </div>
        ) : results?.entries.length === 0 ? (
          <div className="no-results">
            <p > No moves found matching your criteria.</p>
            <button onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="move-results-grid">
            {results?.entries.map(renderMoveCard)}
          </div>
        )}
      </div>
    </div>
  );
};

// Debounce utility function
function debounce < T extends(...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters < T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters < T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default MoveSearch;



