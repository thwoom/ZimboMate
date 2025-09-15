/**
 * Command Bus Implementation
 * Central dispatcher for all application commands
 */

import type { 
  Command, 
  CommandCategory, 
  CommandBus as ICommandBus,
  CommandBusEvents,
  CommandSearchResult 
} from './types'

export class CommandBus implements ICommandBus {
  private static instance: CommandBus
  private commands = new Map<string, Command>()
  private listeners = new Map<keyof CommandBusEvents, Set<Function>>()
  private recentCommands: string[] = []
  private maxRecentCommands = 10

  private constructor() {}

  static getInstance(): CommandBus {
    if (!CommandBus.instance) {
      CommandBus.instance = new CommandBus()
    }
    return CommandBus.instance
  }

  /**
   * Register a command
   */
  register(command: Command): void {
    this.commands.set(command.id, command)
    this.emit('command:registered', { commandId: command.id })
  }

  /**
   * Unregister a command
   */
  unregister(id: string): void {
    if (this.commands.delete(id)) {
      this.emit('command:unregistered', { commandId: id })
    }
  }

  /**
   * Execute a command by ID
   */
  async execute(id: string): Promise<void> {
    const command = this.commands.get(id)
    if (!command) {
      throw new Error(`Command not found: ${id}`)
    }

    if (command.isEnabled && !command.isEnabled()) {
      throw new Error(`Command is disabled: ${id}`)
    }

    try {
      await command.execute()
      this.addToRecentCommands(id)
      this.emit('command:executed', { commandId: id, timestamp: Date.now() })
    } catch (error) {
      console.error(`Error executing command ${id}:`, error)
      throw error
    }
  }

  /**
   * Search commands with fuzzy matching
   */
  search(query: string): CommandSearchResult[] {
    if (!query.trim()) {
      return this.getRecentCommands()
    }

    const results: CommandSearchResult[] = []
    const queryLower = query.toLowerCase()

    for (const command of this.commands.values()) {
      if (command.isVisible && !command.isVisible()) {
        continue
      }

      const score = this.calculateScore(command, queryLower)
      if (score > 0) {
        const matchedKeywords = this.getMatchedKeywords(command, queryLower)
        results.push({ command, score, matchedKeywords })
      }
    }

    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * Get commands by category
   */
  getByCategory(category: CommandCategory): Command[] {
    return Array.from(this.commands.values())
      .filter(cmd => cmd.category === category)
      .filter(cmd => !cmd.isVisible || cmd.isVisible())
  }

  /**
   * Get all commands
   */
  getAllCommands(): Command[] {
    return Array.from(this.commands.values())
      .filter(cmd => !cmd.isVisible || cmd.isVisible())
  }

  /**
   * Get specific command
   */
  getCommand(id: string): Command | undefined {
    return this.commands.get(id)
  }

  /**
   * Add event listener
   */
  addListener<K extends keyof CommandBusEvents>(
    event: K,
    listener: (data: CommandBusEvents[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    
    this.listeners.get(event)!.add(listener)
    
    return () => {
      this.listeners.get(event)?.delete(listener)
    }
  }

  /**
   * Get recent commands for empty search
   */
  private getRecentCommands(): CommandSearchResult[] {
    return this.recentCommands
      .map(id => this.commands.get(id))
      .filter((cmd): cmd is Command => cmd !== undefined)
      .filter(cmd => !cmd.isVisible || cmd.isVisible())
      .map(command => ({
        command,
        score: 1,
        matchedKeywords: ['recent']
      }))
  }

  /**
   * Calculate search score for a command
   */
  private calculateScore(command: Command, query: string): number {
    let score = 0

    // Exact label match
    if (command.label.toLowerCase() === query) {
      score += 100
    }
    // Label starts with query
    else if (command.label.toLowerCase().startsWith(query)) {
      score += 80
    }
    // Label contains query
    else if (command.label.toLowerCase().includes(query)) {
      score += 60
    }

    // Description matches
    if (command.description?.toLowerCase().includes(query)) {
      score += 40
    }

    // Keyword matches
    for (const keyword of command.keywords) {
      if (keyword.toLowerCase() === query) {
        score += 90
      } else if (keyword.toLowerCase().startsWith(query)) {
        score += 70
      } else if (keyword.toLowerCase().includes(query)) {
        score += 50
      }
    }

    // Recent command bonus
    if (this.recentCommands.includes(command.id)) {
      score += 10
    }

    return score
  }

  /**
   * Get matched keywords for highlighting
   */
  private getMatchedKeywords(command: Command, query: string): string[] {
    const matched: string[] = []

    if (command.label.toLowerCase().includes(query)) {
      matched.push('label')
    }

    if (command.description?.toLowerCase().includes(query)) {
      matched.push('description')
    }

    for (const keyword of command.keywords) {
      if (keyword.toLowerCase().includes(query)) {
        matched.push(keyword)
      }
    }

    return matched
  }

  /**
   * Add command to recent commands
   */
  private addToRecentCommands(commandId: string): void {
    // Remove if already exists
    this.recentCommands = this.recentCommands.filter(id => id !== commandId)
    
    // Add to front
    this.recentCommands.unshift(commandId)
    
    // Limit size
    if (this.recentCommands.length > this.maxRecentCommands) {
      this.recentCommands = this.recentCommands.slice(0, this.maxRecentCommands)
    }
  }

  /**
   * Emit event to listeners
   */
  private emit<K extends keyof CommandBusEvents>(
    event: K,
    data: CommandBusEvents[K]
  ): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      for (const listener of eventListeners) {
        listener(data)
      }
    }
  }
}

// Export singleton instance
export const commandBus = CommandBus.getInstance()