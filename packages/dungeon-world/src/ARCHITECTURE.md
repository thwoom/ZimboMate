# Dungeon World App - Architecture & Design System

## 🎯 VISION: Modern Game Master's Command Center

Transform the Dungeon World app into a unified, context-aware workspace that feels like a premium desktop application - combining Notion's flexibility, Figma's polish, and gaming aesthetics.

## 🏗️ ADAPTIVE WORKSPACE ARCHITECTURE

### Layout Philosophy: Context-Driven Design
```
┌─────────────────────────────────────────────────────┐
│ [Global Header] [Context Tabs] [Quick Actions] [⚙️] │
├─────────────────────────────────────────────────────┤
│ [Sidebar]  │ [Main Content Area]    │ [Inspector]    │
│ - Panels   │ - Active Panel        │ - Details      │
│ - Favs     │ - Context-aware       │ - Actions      │
│ - Recent   │ - Responsive grid     │ - Quick edit   │
└─────────────────────────────────────────────────────┘
```

### Context System Design
```typescript
type Context = 'play' | 'prep' | 'build' | 'reference'

interface ContextConfig {
  id: Context
  label: string
  description: string
  primaryPanels: string[]
  secondaryPanels: string[]
  quickActions: Command[]
  layout: 'grid' | 'sidebar' | 'fullscreen'
}

const CONTEXTS: Record<Context, ContextConfig> = {
  play: {
    id: 'play',
    label: 'Play',
    description: 'Runtime actions and quick data',
    primaryPanels: ['character-stats', 'moves', 'inventory'],
    secondaryPanels: ['session-tools', 'conditions'],
    quickActions: ['roll-move', 'add-hp', 'use-item'],
    layout: 'grid'
  },
  prep: {
    id: 'prep',
    label: 'Prep',
    description: 'Session planning and preparation',
    primaryPanels: ['campaign', 'session-tools', 'content-studio'],
    secondaryPanels: ['move-library', 'equipment-compendium'],
    quickActions: ['create-npc', 'add-location', 'plan-encounter'],
    layout: 'sidebar'
  },
  // ... other contexts
}
```

## 🎨 DESIGN SYSTEM: "Cinematic Gaming"

### Visual Language
```css
/* Color Palette: Deep Space with Warm Accents */
:root {
  /* Base Colors - Deep Blues/Purples */
  --color-background: #0a0b14;
  --color-surface: #12141f;
  --color-surface-elevated: #1a1d2e;
  
  /* Accent Colors - Gold/Amber Gaming */
  --color-primary: #f7b731;      /* Gold */
  --color-secondary: #5f27cd;    /* Purple */
  --color-accent: #ff6b6b;       /* Coral */
  
  /* Semantic Colors */
  --color-success: #2ed573;      /* Green */
  --color-warning: #ffa502;      /* Orange */
  --color-danger: #ff3742;       /* Red */
  --color-info: #3742fa;         /* Blue */
  
  /* Text Hierarchy */
  --color-text-primary: #ffffff;
  --color-text-secondary: #a4b0be;
  --color-text-tertiary: #747d8c;
  --color-text-muted: #57606f;
}

/* Typography Scale */
:root {
  --font-family-primary: 'Inter', -apple-system, sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;
  
  /* Fluid Typography */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.3rem + 1vw, 1.875rem);
  --text-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem);
}

/* Spacing System - 8px Grid */
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Component Architecture
```typescript
// Unified Design System Components
interface ComponentLibrary {
  // Layout
  AppShell: React.FC<AppShellProps>
  GlobalHeader: React.FC<HeaderProps>
  Sidebar: React.FC<SidebarProps>
  ContextTabs: React.FC<ContextTabsProps>
  Inspector: React.FC<InspectorProps>
  
  // Content
  Card: React.FC<CardProps>
  Panel: React.FC<PanelProps>
  Section: React.FC<SectionProps>
  DataGrid: React.FC<DataGridProps>
  
  // Interactive
  Button: React.FC<ButtonProps>
  Input: React.FC<InputProps>
  Select: React.FC<SelectProps>
  Modal: React.FC<ModalProps>
  
  // Gaming-Specific
  StatBlock: React.FC<StatBlockProps>
  DiceRoller: React.FC<DiceRollerProps>
  HealthBar: React.FC<HealthBarProps>
  MoveCard: React.FC<MoveCardProps>
}
```

## ⌨️ COMMAND SYSTEM ARCHITECTURE

### Expanded Command Categories
```typescript
interface CommandRegistry {
  // Navigation
  'nav:*': NavigationCommands
  
  // Panel Management
  'panel:*': PanelCommands
  
  // Character Actions
  'char:*': CharacterCommands
  
  // Game Mechanics
  'game:*': GameMechanicCommands
  
  // Content Creation
  'create:*': ContentCommands
  
  // System
  'sys:*': SystemCommands
}

// Example: Character Commands
const characterCommands: Command[] = [
  {
    id: 'char:add-hp',
    label: 'Add Hit Points',
    description: 'Increase character HP',
    keywords: ['hp', 'health', 'heal', 'add'],
    category: 'character',
    shortcut: ['mod', 'h', '+'],
    execute: () => characterStore.modifyHP(1)
  },
  {
    id: 'char:roll-stat',
    label: 'Roll Stat',
    description: 'Roll 2d6 + stat modifier',
    keywords: ['roll', 'stat', 'dice', '2d6'],
    category: 'character',
    shortcut: ['mod', 'r'],
    execute: () => openStatRollModal()
  }
  // ... more character commands
]
```

## 🗂️ PANEL SYSTEM ARCHITECTURE

### Current Panel Inventory
```typescript
interface PanelInventory {
  // Character Management (4 panels)
  character: {
    'character-stats': CharacterStatsPanel
    'character-creation': CharacterCreationPanel
    'bond-tracker': BondTrackerPanel
    'alignment-xp': AlignmentXPTrackerPanel
  }
  
  // Game Mechanics (5 panels)
  mechanics: {
    'moves': MovesPanel
    'move-library': MoveLibraryPanel
    'special-moves': SpecialMovesPanel
    'spells': SpellPanel
    'conditions': ConditionTrackerPanel
  }
  
  // Equipment & Inventory (3 panels)
  equipment: {
    'equipment': EquipmentPanel
    'inventory': InventoryPanel
    'equipment-compendium': EquipmentCompendiumPanel
  }
  
  // Campaign Management (3 panels)
  campaign: {
    'campaign': CampaignPanel
    'session-tools': SessionToolsPanel
    'content-studio': ContentStudioPanel
  }
}
```

### Panel Modernization Strategy
```typescript
interface PanelMigrationPlan {
  phase1: {
    priority: 'high'
    panels: ['character-stats', 'moves', 'inventory']
    focus: 'Core gameplay functionality'
    timeline: '1 week'
  }
  
  phase2: {
    priority: 'medium'
    panels: ['session-tools', 'campaign', 'equipment']
    focus: 'Campaign management'
    timeline: '1 week'
  }
  
  phase3: {
    priority: 'low'
    panels: ['content-studio', 'compendiums', 'trackers']
    focus: 'Advanced features'
    timeline: '1 week'
  }
}
```

## 🎯 UX PRINCIPLES

### 1. Context Awareness
- UI adapts based on current activity (Play/Prep/Build/Reference)
- Relevant tools surface automatically
- Hide complexity until needed

### 2. Progressive Disclosure
```typescript
interface ProgressiveDisclosure {
  level1: 'Essential info always visible'
  level2: 'Secondary info on hover/focus'
  level3: 'Advanced options in expandable sections'
  level4: 'Expert features in dedicated modes'
}
```

### 3. Keyboard-First Design
- Every action has a keyboard shortcut
- Tab navigation throughout
- Command palette for everything
- Vim-like navigation patterns where appropriate

### 4. Visual Hierarchy
```css
/* Information Hierarchy */
.critical-info { 
  font-size: var(--text-xl);
  color: var(--color-text-primary);
  font-weight: 600;
}

.primary-info {
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.secondary-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.tertiary-info {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
```

## 🛠️ TECHNICAL STACK

### Core Technologies ✅
- **React 19** - Latest features and performance
- **TypeScript** - Type safety for complex app
- **Tailwind v4** - Modern utility-first CSS
- **Radix UI** - Accessible component primitives
- **cmdk** - Command palette functionality

### Recommended Additions
```json
{
  "state-management": {
    "global": "zustand",
    "server": "@tanstack/react-query",
    "forms": "react-hook-form + zod"
  },
  "interactions": {
    "animations": "framer-motion",
    "drag-drop": "@dnd-kit/core",
    "tables": "@tanstack/react-table"
  },
  "gaming-specific": {
    "dice": "custom dice roller",
    "charts": "recharts",
    "export": "custom PDF generation"
  }
}
```

## 📋 IMPLEMENTATION PHASES

### Phase 1: Design System Foundation (3-5 days)
1. Create comprehensive component library
2. Build adaptive workspace layout
3. Implement context switching system
4. Establish consistent spacing and typography

### Phase 2: Core Panel Migration (1-2 weeks)
1. Character Stats Panel - Modern card-based design
2. Moves Panel - Enhanced search and categorization
3. Inventory Panel - Drag-and-drop interface
4. Session Tools - Real-time campaign management

### Phase 3: Advanced Features (1-2 weeks)
1. Content Studio - Modern creation interface
2. Reference Library - Unified search system
3. Campaign Dashboard - Overview and metrics
4. Export/Import - Data portability

### Phase 4: Polish & Optimization (1 week)
1. Performance optimization
2. Accessibility improvements
3. Advanced keyboard shortcuts
4. Final UX polish

## 🎯 SUCCESS METRICS

### Technical Goals
- [ ] Sub-second response times for all interactions
- [ ] 100% keyboard accessibility
- [ ] Consistent design system across 15+ panels
- [ ] Context-aware UI adaptation

### User Experience Goals
- [ ] Intuitive navigation between all panels
- [ ] Progressive disclosure - complexity hidden until needed
- [ ] Professional tool that Game Masters love to use
- [ ] Seamless workflow across Play/Prep/Build/Reference contexts

---
*Architecture designed for cohesive, modern Game Master's Command Center*