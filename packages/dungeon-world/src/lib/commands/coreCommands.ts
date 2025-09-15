/**
 * Core Application Commands
 * Essential commands for navigation and system functions
 */

import { 
  HomeIcon,
  Cog6ToothIcon,
  MoonIcon,
  SunIcon,
  QuestionMarkCircleIcon,
  CommandLineIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import type { Command } from './types'
import { themeService } from '../../services/ThemeService'

/**
 * Navigation Commands
 */
export const navigationCommands: Command[] = [
  {
    id: 'nav:home',
    label: 'Go to Dashboard',
    description: 'Navigate to the main dashboard',
    keywords: ['home', 'dashboard', 'main', 'start'],
    category: 'navigation',
    shortcut: ['mod', 'h'],
    icon: HomeIcon,
    execute: () => {
      // TODO: Navigate to dashboard when router is set up
      console.log('Navigate to dashboard')
    }
  },
  {
    id: 'nav:settings',
    label: 'Open Settings',
    description: 'Open application settings',
    keywords: ['settings', 'preferences', 'config', 'options'],
    category: 'navigation',
    shortcut: ['mod', ','],
    icon: Cog6ToothIcon,
    execute: () => {
      // TODO: Navigate to settings when router is set up
      console.log('Navigate to settings')
    }
  },
  {
    id: 'nav:help',
    label: 'Show Help',
    description: 'Open help documentation',
    keywords: ['help', 'docs', 'documentation', 'guide'],
    category: 'navigation',
    shortcut: ['mod', '?'],
    icon: QuestionMarkCircleIcon,
    execute: () => {
      // TODO: Open help modal or navigate to help
      console.log('Show help')
    }
  }
]

/**
 * System Commands
 */
export const systemCommands: Command[] = [
  {
    id: 'system:toggle-theme',
    label: 'Toggle Theme',
    description: 'Switch between Arcane Slate and Cinder Black themes',
    keywords: ['theme', 'dark', 'light', 'appearance', 'toggle'],
    category: 'system',
    shortcut: ['mod', 't'],
    icon: MoonIcon,
    execute: () => {
      themeService.toggleTheme()
    }
  },
  {
    id: 'system:theme-arcane',
    label: 'Set Arcane Slate Theme',
    description: 'Switch to Arcane Slate theme',
    keywords: ['theme', 'arcane', 'slate', 'blue', 'purple'],
    category: 'system',
    icon: MoonIcon,
    execute: () => {
      themeService.setTheme('arcane-slate')
    }
  },
  {
    id: 'system:theme-cinder',
    label: 'Set Cinder Black Theme',
    description: 'Switch to Cinder Black theme',
    keywords: ['theme', 'cinder', 'black', 'orange'],
    category: 'system',
    icon: SunIcon,
    execute: () => {
      themeService.setTheme('cinder-black')
    }
  },
  {
    id: 'system:theme-contrast',
    label: 'Set High Contrast Theme',
    description: 'Switch to high contrast theme for accessibility',
    keywords: ['theme', 'contrast', 'accessibility', 'a11y'],
    category: 'system',
    execute: () => {
      themeService.setTheme('high-contrast')
    }
  },
  {
    id: 'system:reload',
    label: 'Reload Application',
    description: 'Reload the entire application',
    keywords: ['reload', 'refresh', 'restart'],
    category: 'system',
    shortcut: ['mod', 'r'],
    icon: ArrowPathIcon,
    execute: () => {
      window.location.reload()
    }
  },
  {
    id: 'system:command-palette',
    label: 'Open Command Palette',
    description: 'Open the command palette',
    keywords: ['command', 'palette', 'search', 'commands'],
    category: 'system',
    shortcut: ['mod', 'k'],
    icon: CommandLineIcon,
    execute: () => {
      // This will be handled by the CommandPalette component itself
      console.log('Command palette toggle')
    }
  }
]

/**
 * All core commands
 */
export const coreCommands: Command[] = [
  ...navigationCommands,
  ...systemCommands
]