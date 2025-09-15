/**
 * Command Palette Hook
 * Manages command palette state and keyboard shortcuts
 */

import { useState, useEffect, useCallback } from 'react'
import { commandBus } from '../commands/CommandBus'
import { coreCommands } from '../commands/coreCommands'

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  // Register core commands on mount
  useEffect(() => {
    for (const command of coreCommands) {
      commandBus.register(command)
    }

    return () => {
      // Cleanup commands on unmount
      for (const command of coreCommands) {
        commandBus.unregister(command.id)
      }
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command palette toggle (Cmd/Ctrl + K)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen(prev => !prev)
        return
      }

      // Close on Escape
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        return
      }

      // Don't process other shortcuts when command palette is open
      if (isOpen) return

      // Check for registered command shortcuts
      const commands = commandBus.getAllCommands()
      for (const command of commands) {
        if (!command.shortcut) continue

        const shortcut = command.shortcut
        const isModKey = shortcut.includes('mod')
        const hasModifier = event.metaKey || event.ctrlKey
        const key = shortcut[shortcut.length - 1] // Last item is the key

        if (isModKey && hasModifier && event.key.toLowerCase() === key.toLowerCase()) {
          event.preventDefault()
          commandBus.execute(command.id).catch(console.error)
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const openCommandPalette = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCommandPalette = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggleCommandPalette = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    isOpen,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
    setIsOpen
  }
}