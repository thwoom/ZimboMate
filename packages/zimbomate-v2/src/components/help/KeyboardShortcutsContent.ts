export const keyboardShortcutsContent = [
  {
    type: 'heading',
    title: '⌨️ Keyboard Shortcuts Reference',
    content: 'Master ZimboMate with lightning-fast keyboard commands'
  },
  {
    type: 'paragraph',
    content: 'ZimboMate V2 is designed for keyboard efficiency. Learn these shortcuts to dramatically speed up your gameplay and become a power user.'
  },
  {
    type: 'subheading',
    title: '🌍 Global Shortcuts',
    content: 'Work from anywhere in the application'
  },
  {
    type: 'table',
    headers: ['Shortcut', 'Action', 'Description'],
    rows: [
      ['**Ctrl+K**', 'Command Palette', 'Open the universal command search'],
      ['**Ctrl+Shift+T**', 'Toggle Theme', 'Switch between light/dark/fantasy themes'],
      ['**Ctrl+S**', 'Save Character', 'Save current character data'],
      ['**Ctrl+/**', 'Show Shortcuts', 'Display this shortcuts panel']
    ]
  },
  {
    type: 'subheading',
    title: '🧭 Navigation Shortcuts',
    content: 'Jump between tabs instantly'
  },
  {
    type: 'table',
    headers: ['Shortcut', 'Tab', 'Description'],
    rows: [
      ['**Ctrl+1**', 'Character', 'Character sheet and stats'],
      ['**Ctrl+2**', 'Dice', '3D dice rolling system'],
      ['**Ctrl+3**', 'Moves', 'Dungeon World moves and actions'],
      ['**Ctrl+4**', 'Equipment', 'Inventory and gear management'],
      ['**Ctrl+5**', 'Session Tools', 'Notes, timers, and trackers'],
      ['**Ctrl+6**', 'Campaign', 'Campaign and world management']
    ]
  },
  {
    type: 'callout',
    variant: 'info',
    content: '💡 Pro Tip: Tab navigation works from anywhere in the app - you don\'t need to be in a specific context!'
  },
  {
    type: 'subheading',
    title: '🎲 Dice Rolling Shortcuts',
    content: 'Roll dice with lightning speed'
  },
  {
    type: 'subheading',
    title: 'Universal Dice Shortcuts',
    content: 'Available in Character and Dice tabs'
  },
  {
    type: 'table',
    headers: ['Shortcut', 'Action', 'Context'],
    rows: [
      ['**Spacebar**', 'Quick 2d6 Roll', 'Character or Dice tab'],
      ['**Enter**', 'Confirm Roll', 'After setting modifiers'],
      ['**Escape**', 'Cancel Roll', 'During roll animation']
    ]
  },
  {
    type: 'subheading',
    title: 'Stat Modifier Shortcuts (Dice Tab Only)',
    content: 'Set modifiers instantly with number keys'
  },
  {
    type: 'table',
    headers: ['Key', 'Stat', 'Modifier Applied'],
    rows: [
      ['**1**', 'Strength', 'STR modifier + 2d6'],
      ['**2**', 'Dexterity', 'DEX modifier + 2d6'],
      ['**3**', 'Constitution', 'CON modifier + 2d6'],
      ['**4**', 'Intelligence', 'INT modifier + 2d6'],
      ['**5**', 'Wisdom', 'WIS modifier + 2d6'],
      ['**6**', 'Charisma', 'CHA modifier + 2d6']
    ]
  },
  {
    type: 'callout',
    variant: 'warning',
    content: '⚠️ Number key shortcuts only work in the Dice tab to avoid conflicts with text input.'
  },
  {
    type: 'subheading',
    title: '📝 Session Tools Shortcuts',
    content: 'Manage your session efficiently'
  },
  {
    type: 'table',
    headers: ['Shortcut', 'Action', 'Context'],
    rows: [
      ['**Ctrl+N**', 'New Note', 'Session Tools tab'],
      ['**Ctrl+F**', 'Search Notes', 'Session Tools tab'],
      ['**Ctrl+T**', 'Start Timer', 'Session Tools tab'],
      ['**Ctrl+R**', 'Add Tracker', 'Session Tools tab']
    ]
  },
  {
    type: 'subheading',
    title: '🎮 Character Management',
    content: 'Quick character actions'
  },
  {
    type: 'table',
    headers: ['Action', 'How To Access', 'Description'],
    rows: [
      ['Heal Character', '**Ctrl+K** → "heal"', 'Restore HP to maximum'],
      ['Take Rest', '**Ctrl+K** → "rest"', 'Character takes a rest'],
      ['Level Up', '**Ctrl+K** → "level"', 'Advance to next level'],
      ['Add XP', '**Ctrl+K** → "xp"', 'Manually add experience points']
    ]
  },
  {
    type: 'subheading',
    title: '🔍 Command Palette Power',
    content: 'Master the universal search'
  },
  {
    type: 'subheading',
    title: 'Command Palette Navigation',
    content: 'Navigate the command palette efficiently'
  },
  {
    type: 'table',
    headers: ['Key', 'Action', 'Description'],
    rows: [
      ['**↑/↓**', 'Navigate', 'Move between command options'],
      ['**Enter**', 'Execute', 'Run the selected command'],
      ['**Escape**', 'Close', 'Close the command palette'],
      ['**Tab**', 'Autocomplete', 'Complete partial command names']
    ]
  },
  {
    type: 'subheading',
    title: 'Command Categories',
    content: 'Types of commands available'
  },
  {
    type: 'list',
    items: [
      '**Navigation**: Jump to any tab or section',
      '**Dice**: Quick roll commands with modifiers',
      '**Character**: Heal, rest, level up, manage stats',
      '**Session**: Create notes, start timers, add trackers',
      '**Global**: Theme changes, settings, help'
    ]
  },
  {
    type: 'subheading',
    title: '⚡ Power User Tips',
    content: 'Advanced keyboard techniques'
  },
  {
    type: 'subheading',
    title: 'Workflow Optimization',
    content: 'Combine shortcuts for maximum efficiency'
  },
  {
    type: 'list',
    items: [
      '**Quick Combat**: Ctrl+2 → Spacebar → repeat for fast combat rolls',
      '**Note Taking**: Ctrl+5 → Ctrl+N → type → Enter for rapid notes',
      '**Character Review**: Ctrl+1 → review stats → number key → Ctrl+2 → Spacebar',
      '**Session Flow**: Use Ctrl+K to quickly access any command without remembering specific shortcuts'
    ]
  },
  {
    type: 'subheading',
    title: 'Context Awareness',
    content: 'Shortcuts adapt to your current location'
  },
  {
    type: 'list',
    items: [
      'Some shortcuts only work in specific tabs for safety',
      'The command palette shows context-relevant commands first',
      'Number keys behave differently in Dice tab vs other tabs',
      'Text input fields disable most shortcuts to prevent conflicts'
    ]
  },
  {
    type: 'subheading',
    title: '🎯 Shortcut Learning Strategy',
    content: 'How to master the shortcuts'
  },
  {
    type: 'subheading',
    title: 'Learning Path',
    content: 'Recommended order for learning shortcuts'
  },
  {
    type: 'table',
    headers: ['Priority', 'Shortcuts to Learn', 'Impact'],
    rows: [
      ['Essential', '**Ctrl+K**, **Spacebar**', 'Command palette and quick rolling'],
      ['High', '**Ctrl+1-6**', 'Tab navigation for workflow'],
      ['Medium', '**1-6** (in Dice tab)', 'Stat-specific rolling'],
      ['Advanced', '**Ctrl+N**, **Ctrl+F**', 'Session management efficiency']
    ]
  },
  {
    type: 'callout',
    variant: 'success',
    content: '🚀 Master these shortcuts and you\'ll be rolling dice and managing characters faster than ever! Start with Ctrl+K and Spacebar, then gradually add more shortcuts to your workflow.'
  },
  {
    type: 'subheading',
    title: '🔧 Customization',
    content: 'Personalizing your shortcuts'
  },
  {
    type: 'paragraph',
    content: 'While ZimboMate V2 comes with carefully chosen default shortcuts, future versions will allow customization. The current shortcuts are designed based on common patterns and user research for optimal efficiency.'
  },
  {
    type: 'callout',
    variant: 'info',
    content: '💡 Remember: You can always press Ctrl+K and type what you want to do - the command palette is your safety net when you forget a shortcut!'
  }
]