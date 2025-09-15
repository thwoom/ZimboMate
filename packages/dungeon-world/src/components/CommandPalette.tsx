/**
 * Command Palette Component
 * Keyboard-first command interface using cmdk
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from './ui/Dialog'
import { 
  MagnifyingGlassIcon,
  CommandLineIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { cn } from '../lib/utils'
import { commandBus } from '../lib/commands/CommandBus'
import type { CommandSearchResult } from '../lib/commands/types'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<CommandSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // Search commands when query changes
  useEffect(() => {
    if (!open) return

    setLoading(true)
    console.log('Searching for:', search)
    const searchResults = search.trim()
      ? commandBus.search(search)
      : commandBus.getAllCommands().map(cmd => ({ command: cmd, score: 1, matchedKeywords: ['all'] }))
    console.log('Search results:', searchResults.length, searchResults.map(r => r.command.label))
    setResults(searchResults)
    setLoading(false)
  }, [search, open])

  // Handle command execution
  const handleSelect = useCallback(async (commandId: string) => {
    try {
      await commandBus.execute(commandId)
      onOpenChange(false)
      setSearch('')
    } catch (error) {
      console.error('Failed to execute command:', error)
      // TODO: Show error toast
    }
  }, [onOpenChange])

  // Reset search when closed
  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  // Group results by category
  const groupedResults = results.reduce((groups, result) => {
    const category = result.command.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(result)
    return groups
  }, {} as Record<string, CommandSearchResult[]>)

  const categoryLabels = {
    character: 'Character',
    combat: 'Combat',
    navigation: 'Navigation',
    system: 'System',
    equipment: 'Equipment'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-modal w-full max-w-2xl overflow-hidden">
        <h2 id="cmdk-title" className="sr-only">Command Palette</h2>
        <p id="cmdk-desc" className="sr-only">Search and execute application commands</p>
          <Command shouldFilter={false} className="bg-transparent">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search commands..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
              />
              {loading && (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              )}
            </div>

            {/* Results */}
            <Command.List className="max-h-96 overflow-y-auto p-2">
              {results.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <CommandLineIcon className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {search ? 'No commands found' : 'Start typing to search commands'}
                  </p>
                  <p className="text-sm mt-1">
                    {search ? 'Try different keywords' : 'Or browse recent commands below'}
                  </p>
                </div>
              )}

              {Object.entries(groupedResults).map(([category, categoryResults]) => (
                <Command.Group key={category} heading={categoryLabels[category as keyof typeof categoryLabels]}>
                  {categoryResults.map(({ command, matchedKeywords }) => (
                    <Command.Item
                      key={command.id}
                      value={command.id}
                      onSelect={() => handleSelect(command.id)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
                        "hover:bg-white/10 data-[selected=true]:bg-white/10",
                        "transition-colors duration-150"
                      )}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        {command.icon ? (
                          <command.icon className="w-5 h-5 text-gray-300" />
                        ) : (
                          <div className="w-5 h-5 rounded bg-gray-600" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate">
                            {command.label}
                          </span>
                          {matchedKeywords.includes('recent') && (
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {command.description && (
                          <p className="text-sm text-gray-400 truncate">
                            {command.description}
                          </p>
                        )}
                      </div>

                      {/* Shortcut */}
                      {command.shortcut && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          {command.shortcut.map((key, index) => (
                            <React.Fragment key={key}>
                              {index > 0 && <span>+</span>}
                              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                                {key === 'mod' ? (navigator.platform.includes('Mac') ? '⌘' : 'Ctrl') : key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-700 rounded">⌘K</kbd>
                <span>to open</span>
              </div>
            </div>
          </Command>
      </DialogContent>
    </Dialog>
  )
}