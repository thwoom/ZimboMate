import React, { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from './Dialog'
import { cn } from '../../lib/utils'
import { 
  MagnifyingGlassIcon,
  HeartIcon,
  PlusIcon,
  MinusIcon,
  CubeIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
  BookOpenIcon,
  SparklesIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

export interface CommandItem {
  id: string
  label: string
  description?: string
  keywords?: string[]
  icon?: React.ReactNode
  shortcut?: string[]
  section: string
  onSelect: () => void
  disabled?: boolean
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commands: CommandItem[]
}

export function CommandPalette({ open, onOpenChange, commands }: CommandPaletteProps) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('')
    }
  }, [open])

  // Group commands by section
  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.section]) {
      acc[command.section] = []
    }
    acc[command.section].push(command)
    return acc
  }, {} as Record<string, CommandItem[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl" onClose={() => onOpenChange(false)}>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-secondary [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b border-border px-3" cmdk-input-wrapper="">
            <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm text-text-secondary">
              No commands found.
            </Command.Empty>
            
            {Object.entries(groupedCommands).map(([section, sectionCommands]) => (
              <Command.Group key={section} heading={section}>
                {sectionCommands.map((command) => (
                  <Command.Item
                    key={command.id}
                    value={`${command.label} ${command.description} ${command.keywords?.join(' ')}`}
                    onSelect={() => {
                      command.onSelect()
                      onOpenChange(false)
                    }}
                    disabled={command.disabled}
                    className={cn(
                      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-surface-hover aria-selected:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                      command.disabled && 'opacity-50'
                    )}
                  >
                    {command.icon && (
                      <div className="mr-2 flex h-4 w-4 items-center justify-center">
                        {command.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{command.label}</div>
                      {command.description && (
                        <div className="text-xs text-text-secondary">{command.description}</div>
                      )}
                    </div>
                    {command.shortcut && (
                      <div className="ml-auto flex gap-1">
                        {command.shortcut.map((key, index) => (
                          <kbd
                            key={index}
                            className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-surface px-1.5 font-mono text-xs font-medium text-text-secondary opacity-100"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

// Default command icons
export const CommandIcons = {
  hp: HeartIcon,
  xp: PlusIcon,
  damage: MinusIcon,
  roll: CubeIcon,
  armor: ShieldCheckIcon,
  inventory: ArchiveBoxIcon,
  moves: BookOpenIcon,
  spells: SparklesIcon,
  settings: Cog6ToothIcon,
  search: MagnifyingGlassIcon,
}