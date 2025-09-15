/**
 * Command System Types
 * Type definitions for the command bus and command palette
 */

export type CommandCategory = 'character' | 'combat' | 'navigation' | 'system' | 'equipment'

export interface Command {
  id: string
  label: string
  description?: string
  keywords: string[]
  category: CommandCategory
  shortcut?: string[]
  icon?: React.ComponentType<{ className?: string }>
  execute: () => void | Promise<void>
  isEnabled?: () => boolean
  isVisible?: () => boolean
}

export interface CommandGroup {
  id: string
  label: string
  commands: Command[]
}

export interface CommandBusEvents {
  'command:executed': { commandId: string; timestamp: number }
  'command:registered': { commandId: string }
  'command:unregistered': { commandId: string }
}

export interface CommandSearchResult {
  command: Command
  score: number
  matchedKeywords: string[]
}

export interface CommandBus {
  register(command: Command): void
  unregister(id: string): void
  execute(id: string): Promise<void>
  search(query: string): CommandSearchResult[]
  getByCategory(category: CommandCategory): Command[]
  getAllCommands(): Command[]
  getCommand(id: string): Command | undefined
  addListener<K extends keyof CommandBusEvents>(
    event: K,
    listener: (data: CommandBusEvents[K]) => void
  ): () => void
}