import type { CommandItem } from '../components/ui/CommandPalette'

export type CommandHandler = () => void | Promise<void>

export interface Command {
  id: string
  label: string
  description?: string
  keywords?: string[]
  icon?: React.ReactNode
  shortcut?: string[]
  section: string
  handler: CommandHandler
  disabled?: boolean
  condition?: () => boolean
}

class CommandBus {
  private commands = new Map<string, Command>()
  private listeners = new Set<() => void>()

  register(command: Command) {
    this.commands.set(command.id, command)
    this.notifyListeners()
  }

  unregister(commandId: string) {
    this.commands.delete(commandId)
    this.notifyListeners()
  }

  execute(commandId: string) {
    const command = this.commands.get(commandId)
    if (!command) {
      console.warn(`Command ${commandId} not found`)
      return
    }

    if (command.condition && !command.condition()) {
      console.warn(`Command ${commandId} condition not met`)
      return
    }

    if (command.disabled) {
      console.warn(`Command ${commandId} is disabled`)
      return
    }

    try {
      command.handler()
    } catch (error) {
      console.error(`Error executing command ${commandId}:`, error)
    }
  }

  getCommands(): CommandItem[] {
    return Array.from(this.commands.values())
      .filter(command => !command.condition || command.condition())
      .map(command => ({
        id: command.id,
        label: command.label,
        description: command.description,
        keywords: command.keywords,
        icon: command.icon,
        shortcut: command.shortcut,
        section: command.section,
        onSelect: () => this.execute(command.id),
        disabled: command.disabled,
      }))
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  clear() {
    this.commands.clear()
    this.notifyListeners()
  }
}

export const commandBus = new CommandBus()

// Keyboard shortcut handler
export function setupKeyboardShortcuts() {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't handle shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.contentEditable === 'true'
    ) {
      return
    }

    const commands = Array.from(commandBus['commands'].values())
    
    for (const command of commands) {
      if (!command.shortcut || command.disabled) continue
      if (command.condition && !command.condition()) continue

      const shortcut = command.shortcut
      const matches = shortcut.every((key, index) => {
        switch (key.toLowerCase()) {
          case 'ctrl':
          case 'cmd':
          case 'meta':
            return event.ctrlKey || event.metaKey
          case 'alt':
            return event.altKey
          case 'shift':
            return event.shiftKey
          default:
            return event.key.toLowerCase() === key.toLowerCase()
        }
      })

      if (matches) {
        event.preventDefault()
        commandBus.execute(command.id)
        break
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}