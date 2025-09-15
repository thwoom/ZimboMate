import React from 'react'
import { commandBus, type Command } from './commandBus'
import { CommandIcons } from '../components/ui/CommandPalette'
import { useGameStore } from '../store/GameStore'
// import { useNavigate } from 'react-router-dom'

// Command registration function
export function registerCoreCommands() {
  // Character Actions
  commandBus.register({
    id: 'add-hp',
    label: 'Add HP',
    description: 'Increase hit points by 1',
    keywords: ['health', 'heal', 'restore'],
    icon: <CommandIcons.hp className="w-4 h-4" />,
    shortcut: ['ArrowUp'],
    section: 'Character',
    handler: () => {
      // This will be connected to the game store
      window.dispatchEvent(new CustomEvent('command:add-hp'))
    },
  })

  commandBus.register({
    id: 'remove-hp',
    label: 'Remove HP',
    description: 'Decrease hit points by 1',
    keywords: ['damage', 'hurt', 'wound'],
    icon: <CommandIcons.damage className="w-4 h-4" />,
    shortcut: ['ArrowDown'],
    section: 'Character',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:remove-hp'))
    },
  })

  commandBus.register({
    id: 'add-xp',
    label: 'Add XP',
    description: 'Gain 1 experience point',
    keywords: ['experience', 'level', 'advance'],
    icon: <CommandIcons.xp className="w-4 h-4" />,
    shortcut: ['x'],
    section: 'Character',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:add-xp'))
    },
  })

  commandBus.register({
    id: 'rest',
    label: 'Rest',
    description: 'Restore HP to maximum',
    keywords: ['heal', 'recover', 'sleep'],
    icon: <CommandIcons.hp className="w-4 h-4" />,
    shortcut: ['r'],
    section: 'Character',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:rest'))
    },
  })

  // Dice Rolling
  commandBus.register({
    id: 'roll-2d6',
    label: 'Roll 2d6',
    description: 'Roll two six-sided dice',
    keywords: ['dice', 'random', 'check'],
    icon: <CommandIcons.roll className="w-4 h-4" />,
    shortcut: [' '],
    section: 'Dice',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:roll-2d6'))
    },
  })

  // Attribute Rolls
  const attributes = [
    { id: 'str', label: 'STR', key: '1' },
    { id: 'dex', label: 'DEX', key: '2' },
    { id: 'con', label: 'CON', key: '3' },
    { id: 'int', label: 'INT', key: '4' },
    { id: 'wis', label: 'WIS', key: '5' },
    { id: 'cha', label: 'CHA', key: '6' },
  ]

  attributes.forEach(attr => {
    commandBus.register({
      id: `roll-${attr.id}`,
      label: `Roll ${attr.label}`,
      description: `Roll 2d6 + ${attr.label} modifier`,
      keywords: ['roll', 'attribute', 'stat', attr.label.toLowerCase()],
      icon: <CommandIcons.roll className="w-4 h-4" />,
      shortcut: [attr.key],
      section: 'Dice',
      handler: () => {
        window.dispatchEvent(new CustomEvent('command:roll-attribute', { 
          detail: { attribute: attr.id.toUpperCase() } 
        }))
      },
    })
  })

  // Debilities
  const debilities = [
    { id: 'weak', label: 'Weak', description: 'Toggle weak debility (-1 STR)' },
    { id: 'shaky', label: 'Shaky', description: 'Toggle shaky debility (-1 DEX)' },
    { id: 'sick', label: 'Sick', description: 'Toggle sick debility (-1 CON)' },
    { id: 'confused', label: 'Confused', description: 'Toggle confused debility (-1 INT)' },
    { id: 'scarred', label: 'Scarred', description: 'Toggle scarred debility (-1 WIS)' },
    { id: 'stunned', label: 'Stunned', description: 'Toggle stunned debility (-1 CHA)' },
  ]

  debilities.forEach(debility => {
    commandBus.register({
      id: `toggle-${debility.id}`,
      label: `Toggle ${debility.label}`,
      description: debility.description,
      keywords: ['debility', 'condition', 'status', debility.id],
      icon: <CommandIcons.armor className="w-4 h-4" />,
      section: 'Character',
      handler: () => {
        window.dispatchEvent(new CustomEvent('command:toggle-debility', { 
          detail: { debility: debility.id } 
        }))
      },
    })
  })

  // Navigation
  const panels = [
    { id: 'character-stats', label: 'Character Stats', icon: CommandIcons.hp },
    { id: 'moves', label: 'Moves', icon: CommandIcons.moves },
    { id: 'inventory', label: 'Inventory', icon: CommandIcons.inventory },
    { id: 'spells', label: 'Spells', icon: CommandIcons.spells },
    { id: 'equipment', label: 'Equipment', icon: CommandIcons.inventory },
  ]

  panels.forEach(panel => {
    commandBus.register({
      id: `open-${panel.id}`,
      label: `Open ${panel.label}`,
      description: `Navigate to ${panel.label} panel`,
      keywords: ['open', 'navigate', 'panel', panel.id],
      icon: <panel.icon className="w-4 h-4" />,
      section: 'Navigation',
      handler: () => {
        window.dispatchEvent(new CustomEvent('command:navigate', { 
          detail: { panelId: panel.id } 
        }))
      },
    })
  })

  // Equipment Actions
  commandBus.register({
    id: 'equip-item',
    label: 'Equip Item',
    description: 'Equip an item from inventory',
    keywords: ['equip', 'wear', 'use', 'gear'],
    icon: <CommandIcons.inventory className="w-4 h-4" />,
    section: 'Equipment',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:equip-item'))
    },
  })

  commandBus.register({
    id: 'unequip-item',
    label: 'Unequip Item',
    description: 'Unequip an equipped item',
    keywords: ['unequip', 'remove', 'doff', 'gear'],
    icon: <CommandIcons.inventory className="w-4 h-4" />,
    section: 'Equipment',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:unequip-item'))
    },
  })

  // Inspector
  commandBus.register({
    id: 'toggle-inspector',
    label: 'Toggle Inspector',
    description: 'Show/hide the inspector pane',
    keywords: ['inspector', 'details', 'sidebar'],
    icon: <CommandIcons.search className="w-4 h-4" />,
    shortcut: ['i'],
    section: 'Interface',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:toggle-inspector'))
    },
  })

  // Theme switching
  commandBus.register({
    id: 'theme-arcane-slate',
    label: 'Arcane Slate Theme',
    description: 'Switch to Arcane Slate theme',
    keywords: ['theme', 'dark', 'arcane', 'slate'],
    icon: <CommandIcons.settings className="w-4 h-4" />,
    section: 'Settings',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:set-theme', { 
        detail: { theme: 'arcane-slate' } 
      }))
    },
  })

  commandBus.register({
    id: 'theme-cinder-black',
    label: 'Cinder Black Theme',
    description: 'Switch to Cinder Black theme',
    keywords: ['theme', 'dark', 'cinder', 'black'],
    icon: <CommandIcons.settings className="w-4 h-4" />,
    section: 'Settings',
    handler: () => {
      window.dispatchEvent(new CustomEvent('command:set-theme', { 
        detail: { theme: 'cinder-black' } 
      }))
    },
  })
}

// Hook to connect commands to game store
export function useCommandHandlers() {
  const { updateCharacter, state } = useGameStore()
  // const navigate = useNavigate()
  const character = state.activeCharacterId ? state.characters[state.activeCharacterId] : null

  React.useEffect(() => {
    const handlers = [
      // HP Commands
      ['command:add-hp', () => {
        if (character) {
          const newHp = Math.min(character.hp.max, character.hp.current + 1)
          updateCharacter(character.id, { hp: { ...character.hp, current: newHp } })
        }
      }],
      
      ['command:remove-hp', () => {
        if (character) {
          const newHp = Math.max(0, character.hp.current - 1)
          updateCharacter(character.id, { hp: { ...character.hp, current: newHp } })
        }
      }],

      ['command:add-xp', () => {
        if (character) {
          updateCharacter(character.id, { xp: character.xp + 1 })
        }
      }],

      ['command:rest', () => {
        if (character) {
          updateCharacter(character.id, { hp: { ...character.hp, current: character.hp.max } })
        }
      }],

      // Navigation
      ['command:navigate', (event: CustomEvent) => {
        const { panelId } = event.detail
        console.log(`Navigate to: ${panelId}`)
        // navigate(`/${panelId}`)
      }],

      // Theme
      ['command:set-theme', (event: CustomEvent) => {
        const { theme } = event.detail
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('dw-theme', theme)
      }],

      // Dice Rolling
      ['command:roll-2d6', () => {
        const roll1 = Math.floor(Math.random() * 6) + 1
        const roll2 = Math.floor(Math.random() * 6) + 1
        const total = roll1 + roll2
        console.log(`Rolled 2d6: ${roll1} + ${roll2} = ${total}`)
        // TODO: Show in UI
      }],

      ['command:roll-attribute', (event: CustomEvent) => {
        if (!character) return
        const { attribute } = event.detail
        const roll1 = Math.floor(Math.random() * 6) + 1
        const roll2 = Math.floor(Math.random() * 6) + 1
        const modifier = Math.floor((character.attributes[attribute] - 10) / 2)
        const total = roll1 + roll2 + modifier
        console.log(`Rolled ${attribute}: ${roll1} + ${roll2} + ${modifier} = ${total}`)
        // TODO: Show in UI
      }],

      // Debilities
      ['command:toggle-debility', (event: CustomEvent) => {
        if (!character) return
        const { debility } = event.detail
        updateCharacter(character.id, {
          debilities: {
            ...character.debilities,
            [debility]: !character.debilities?.[debility]
          }
        })
      }],
    ] as const

    handlers.forEach(([event, handler]) => {
      window.addEventListener(event, handler as EventListener)
    })

    return () => {
      handlers.forEach(([event, handler]) => {
        window.removeEventListener(event, handler as EventListener)
      })
    }
  }, [character, updateCharacter])
}