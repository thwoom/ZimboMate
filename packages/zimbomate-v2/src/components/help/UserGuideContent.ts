export const userGuideContent = [
  {
    type: 'heading',
    title: '📖 Complete User Guide',
    content: 'Master every feature of ZimboMate V2'
  },
  {
    type: 'paragraph',
    content: 'This comprehensive guide covers all features and functionality in ZimboMate V2. Whether you\'re a player or Game Master, this guide will help you make the most of your Dungeon World adventures.'
  },
  {
    type: 'subheading',
    title: '🧙 Character Management',
    content: 'Creating and managing your Dungeon World characters'
  },
  {
    type: 'subheading',
    title: 'Creating Your Character',
    content: 'Step-by-step character creation'
  },
  {
    type: 'list',
    items: [
      'Navigate to the Character tab (first tab)',
      'Enter your character\'s name and choose a class',
      'Set your six attributes (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma)',
      'Your modifiers and derived stats are calculated automatically',
      'Add your starting equipment and spells (if applicable)',
      'Set your character\'s bonds with other party members'
    ]
  },
  {
    type: 'subheading',
    title: 'Managing Health and Resources',
    content: 'Track your character\'s condition'
  },
  {
    type: 'list',
    items: [
      'HP is tracked automatically - click to adjust manually',
      'Load system prevents overencumbrance - watch the load bar',
      'Debilities affect your dice rolls - manage them carefully',
      'XP is awarded automatically for failures and milestone achievements'
    ]
  },
  {
    type: 'subheading',
    title: '🎲 Dice Rolling System',
    content: 'Master the 3D dice mechanics'
  },
  {
    type: 'subheading',
    title: 'Basic Rolling',
    content: 'Understanding Dungeon World dice mechanics'
  },
  {
    type: 'table',
    headers: ['Roll Result', 'Outcome', 'Description'],
    rows: [
      ['10+', 'Success', 'You achieve what you set out to do'],
      ['7-9', 'Partial Success', 'You succeed, but with complications'],
      ['6-', 'Failure', 'The GM makes a move, and you gain XP']
    ]
  },
  {
    type: 'subheading',
    title: 'Advanced Rolling Features',
    content: 'Power user dice features'
  },
  {
    type: 'list',
    items: [
      'Use number keys (1-6) to quickly set stat modifiers',
      'Spacebar for instant 2d6 rolls',
      '3D physics simulation with realistic dice behavior',
      'Automatic result calculation and success level display',
      'Roll history tracking for session review'
    ]
  },
  {
    type: 'subheading',
    title: '⚔️ Moves and Actions',
    content: 'Execute Dungeon World moves effectively'
  },
  {
    type: 'subheading',
    title: 'Basic Moves',
    content: 'Core moves available to all characters'
  },
  {
    type: 'list',
    items: [
      'Hack and Slash - Attack in melee combat',
      'Volley - Attack at range',
      'Defend - Protect yourself or others',
      'Defy Danger - Overcome obstacles and threats',
      'Aid or Interfere - Help or hinder other characters',
      'Discern Realities - Study your surroundings'
    ]
  },
  {
    type: 'subheading',
    title: 'Class-Specific Moves',
    content: 'Unique abilities for each class'
  },
  {
    type: 'list',
    items: [
      'Each class has unique starting moves and advanced moves',
      'Moves are organized by class and level requirements',
      'Click any move to see its full description and requirements',
      'Some moves trigger automatically based on context'
    ]
  },
  {
    type: 'subheading',
    title: '🎒 Equipment Management',
    content: 'Organize your gear and treasures'
  },
  {
    type: 'subheading',
    title: 'Inventory System',
    content: 'Managing your character\'s possessions'
  },
  {
    type: 'list',
    items: [
      'Drag and drop items to reorganize your inventory',
      'Equipment slots show what you have equipped',
      'Load tracking prevents overencumbrance',
      '3D item previews for weapons and armor',
      'Item tags provide mechanical information'
    ]
  },
  {
    type: 'subheading',
    title: 'Equipment Categories',
    content: 'Understanding item types'
  },
  {
    type: 'table',
    headers: ['Category', 'Examples', 'Notes'],
    rows: [
      ['Weapons', 'Sword, Bow, Staff', 'Provide damage and tags'],
      ['Armor', 'Leather, Chain, Plate', 'Reduce damage taken'],
      ['Gear', 'Rope, Torches, Rations', 'Utility items for adventures'],
      ['Treasure', 'Coins, Gems, Art', 'Valuable items and currency']
    ]
  },
  {
    type: 'subheading',
    title: '📝 Session Tools',
    content: 'Enhance your gaming sessions'
  },
  {
    type: 'subheading',
    title: 'Note Taking',
    content: 'Capture important information'
  },
  {
    type: 'list',
    items: [
      'Create notes during play with Ctrl+N',
      'Organize notes by category (NPCs, Locations, Plot)',
      'Search through all your notes quickly',
      'Notes are automatically saved and synced'
    ]
  },
  {
    type: 'subheading',
    title: 'Trackers and Timers',
    content: 'Manage session resources'
  },
  {
    type: 'list',
    items: [
      'Create custom trackers for anything (torches, rations, spell slots)',
      'Set timers for timed challenges or breaks',
      'Track initiative order during combat',
      'Monitor party resources and conditions'
    ]
  },
  {
    type: 'subheading',
    title: '🗺️ Campaign Management',
    content: 'For Game Masters and long-term play'
  },
  {
    type: 'subheading',
    title: 'Campaign Creation',
    content: 'Setting up your world'
  },
  {
    type: 'list',
    items: [
      'Create campaigns to organize multiple characters and sessions',
      'Add NPCs with relationships and motivations',
      'Track locations and their connections',
      'Maintain a campaign journal of major events'
    ]
  },
  {
    type: 'subheading',
    title: 'Session History',
    content: 'Track your adventures over time'
  },
  {
    type: 'list',
    items: [
      'Each session is automatically recorded',
      'Review XP gained and milestones achieved',
      'See character progression over time',
      'Export session summaries for sharing'
    ]
  },
  {
    type: 'subheading',
    title: '⌨️ Keyboard Shortcuts',
    content: 'Work faster with keyboard commands'
  },
  {
    type: 'subheading',
    title: 'Essential Shortcuts',
    content: 'Most important shortcuts to learn'
  },
  {
    type: 'table',
    headers: ['Shortcut', 'Action', 'Context'],
    rows: [
      ['**Ctrl+K**', 'Open Command Palette', 'Global'],
      ['**Spacebar**', 'Quick 2d6 Roll', 'Dice/Character'],
      ['**Ctrl+1-6**', 'Navigate Tabs', 'Global'],
      ['**1-6**', 'Set Stat Modifier', 'Dice Tab'],
      ['**Ctrl+N**', 'New Note', 'Session Tools']
    ]
  },
  {
    type: 'subheading',
    title: '📁 File Management',
    content: 'Backup and organize your data'
  },
  {
    type: 'subheading',
    title: 'Backup System',
    content: 'Protect your characters and campaigns'
  },
  {
    type: 'list',
    items: [
      'Automatic daily backups keep your data safe',
      'Manual backups before important sessions',
      'Export individual characters or entire campaigns',
      'Import data from other sources or previous versions'
    ]
  },
  {
    type: 'subheading',
    title: 'Data Formats',
    content: 'Supported file types'
  },
  {
    type: 'table',
    headers: ['Format', 'Use Case', 'Features'],
    rows: [
      ['JSON', 'Full data export', 'Complete character/campaign data'],
      ['CSV', 'Spreadsheet import', 'Character stats and equipment'],
      ['PDF', 'Printable sheets', 'Character sheets for offline play']
    ]
  },
  {
    type: 'subheading',
    title: '🎮 Multiplayer Features',
    content: 'Play with friends online'
  },
  {
    type: 'subheading',
    title: 'Session Sharing',
    content: 'Collaborative gameplay'
  },
  {
    type: 'list',
    items: [
      'Share dice rolls in real-time with your party',
      'Synchronized session state across all players',
      'GM can manage the session flow for everyone',
      'Chat and communication features built-in'
    ]
  },
  {
    type: 'callout',
    variant: 'success',
    content: '🎉 You\'re now ready to master ZimboMate V2! Use this guide as a reference during play, and don\'t forget to explore the keyboard shortcuts for maximum efficiency.'
  }
]