/**
 * Pre-indexed Command Search System
 * High-performance search for command palette with fuzzy matching and ranking
 */

import type { Command } from '../components/ui/CommandPalette'

interface SearchIndex {
  id: string
  tokens: string[]
  normalizedTitle: string
  normalizedDescription: string
  category: string
  keywords: string[]
  weight: number // Higher weight = higher priority in results
}

class CommandSearchEngine {
  private indexes: Map<string, SearchIndex> = new Map()
  private categoryWeights: Record<string, number> = {
    dice: 10,
    character: 9,
    moves: 8,
    equipment: 7,
    navigation: 6,
    system: 5,
  }

  /**
   * Build search index from commands
   */
  buildIndex(commands: Command[]): void {
    this.indexes.clear()

    commands.forEach((command) => {
      const tokens = this.tokenize(`${command.title} ${command.description || ''}`)
      const keywords = [
        ...this.extractKeywords(command.title),
        ...this.extractKeywords(command.description || ''),
        ...(command.shortcut ? [command.shortcut] : []),
      ]

      const index: SearchIndex = {
        id: command.id,
        tokens,
        normalizedTitle: this.normalize(command.title),
        normalizedDescription: this.normalize(command.description || ''),
        category: command.category,
        keywords,
        weight: this.calculateWeight(command),
      }

      this.indexes.set(command.id, index)
    })

    console.log(`[Search] Built index for ${this.indexes.size} commands`)
  }

  /**
   * Fast fuzzy search with ranking
   */
  search(query: string, maxResults: number = 10): string[] {
    if (!query.trim())
      return []

    const normalizedQuery = this.normalize(query)
    const queryTokens = this.tokenize(query)
    const results: Array<{ id: string, score: number }> = []

    this.indexes.forEach((index, id) => {
      const score = this.calculateScore(normalizedQuery, queryTokens, index)
      if (score > 0) {
        results.push({ id, score })
      }
    })

    // Sort by score (highest first) and return IDs
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(result => result.id)
  }

  private calculateScore(query: string, queryTokens: string[], index: SearchIndex): number {
    let score = 0

    // Exact title match gets highest score
    if (index.normalizedTitle === query) {
      score += 1000
    }

    // Title starts with query
    if (index.normalizedTitle.startsWith(query)) {
      score += 500
    }

    // Title contains query
    if (index.normalizedTitle.includes(query)) {
      score += 200
    }

    // Description contains query
    if (index.normalizedDescription.includes(query)) {
      score += 100
    }

    // Fuzzy token matching
    let tokenMatches = 0
    queryTokens.forEach((queryToken) => {
      index.tokens.forEach((indexToken) => {
        if (indexToken.includes(queryToken)) {
          tokenMatches++
          score += 50
        }
        // Fuzzy match (allows for typos)
        else if (this.fuzzyMatch(queryToken, indexToken)) {
          tokenMatches++
          score += 25
        }
      })
    })

    // Keyword matches
    index.keywords.forEach((keyword) => {
      if (keyword.includes(query)) {
        score += 75
      }
    })

    // Category weight bonus
    const categoryWeight = this.categoryWeights[index.category] || 1
    score *= (1 + categoryWeight * 0.1)

    // Base weight bonus
    score += index.weight

    // Penalize if no token matches for multi-token queries
    if (queryTokens.length > 1 && tokenMatches === 0) {
      score *= 0.1
    }

    return score
  }

  private calculateWeight(command: Command): number {
    let weight = 10 // Base weight

    // Higher weight for common actions
    if (command.title.toLowerCase().includes('roll'))
      weight += 20
    if (command.title.toLowerCase().includes('character'))
      weight += 15
    if (command.title.toLowerCase().includes('equipment'))
      weight += 10

    // Shortcut commands get priority
    if (command.shortcut)
      weight += 25

    return weight
  }

  private tokenize(text: string): string[] {
    return this.normalize(text)
      .split(/[\s\-_./]+/)
      .filter(token => token.length > 0)
  }

  private normalize(text: string): string {
    return text.toLowerCase().trim()
  }

  private extractKeywords(text: string): string[] {
    const keywords = new Set<string>()

    // Extract acronyms (STR, DEX, etc)
    const acronyms = text.match(/\b[A-Z]{2,}\b/g)
    if (acronyms) {
      acronyms.forEach(acronym => keywords.add(acronym.toLowerCase()))
    }

    // Extract numbers
    const numbers = text.match(/\d+/g)
    if (numbers) {
      numbers.forEach(num => keywords.add(num))
    }

    // Common synonyms
    const synonymMap: Record<string, string[]> = {
      roll: ['dice', 'check', 'test'],
      character: ['char', 'pc', 'hero'],
      equipment: ['gear', 'items', 'inventory'],
      moves: ['actions', 'abilities'],
      stats: ['attributes', 'abilities'],
    }

    Object.entries(synonymMap).forEach(([key, synonyms]) => {
      if (text.toLowerCase().includes(key)) {
        synonyms.forEach(synonym => keywords.add(synonym))
      }
    })

    return Array.from(keywords)
  }

  private fuzzyMatch(query: string, target: string): boolean {
    if (query.length > target.length)
      return false

    let queryIndex = 0

    for (let i = 0; i < target.length && queryIndex < query.length; i++) {
      if (target[i] === query[queryIndex]) {
        queryIndex++
      }
    }

    return queryIndex === query.length
  }

  /**
   * Get search suggestions based on partial input
   */
  getSuggestions(partialQuery: string, maxSuggestions: number = 5): string[] {
    if (partialQuery.length < 2)
      return []

    const suggestions = new Set<string>()
    const normalized = this.normalize(partialQuery)

    this.indexes.forEach((index) => {
      // Suggest tokens that start with the query
      index.tokens.forEach((token) => {
        if (token.startsWith(normalized) && token.length > normalized.length) {
          suggestions.add(token)
        }
      })

      // Suggest from keywords
      index.keywords.forEach((keyword) => {
        if (keyword.startsWith(normalized) && keyword.length > normalized.length) {
          suggestions.add(keyword)
        }
      })
    })

    return Array.from(suggestions)
      .sort((a, b) => a.length - b.length) // Shorter suggestions first
      .slice(0, maxSuggestions)
  }

  /**
   * Clear the search index
   */
  clearIndex(): void {
    this.indexes.clear()
  }

  /**
   * Get index statistics
   */
  getStats(): {
    totalCommands: number
    totalTokens: number
    averageTokensPerCommand: number
    categories: Record<string, number>
  } {
    const categories: Record<string, number> = {}
    let totalTokens = 0

    this.indexes.forEach((index) => {
      categories[index.category] = (categories[index.category] || 0) + 1
      totalTokens += index.tokens.length
    })

    return {
      totalCommands: this.indexes.size,
      totalTokens,
      averageTokensPerCommand: totalTokens / this.indexes.size,
      categories,
    }
  }
}

// Singleton instance for global use
export const commandSearchEngine = new CommandSearchEngine()

// Utility functions
export function buildSearchIndex(commands: Command[]) {
  commandSearchEngine.buildIndex(commands)
}

export function searchCommands(query: string, maxResults?: number) {
  return commandSearchEngine.search(query, maxResults)
}

export function getSearchSuggestions(partialQuery: string, maxSuggestions?: number) {
  return commandSearchEngine.getSuggestions(partialQuery, maxSuggestions)
}

export function getSearchStats() {
  return commandSearchEngine.getStats()
}
