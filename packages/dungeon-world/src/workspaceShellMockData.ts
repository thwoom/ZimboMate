import { WorkspaceContext, PanelVisibility, InspectorState, SidebarState } from './types/workspace';

// Mock data for workspace shell state
export const mockStore = {
  workspace: {
    activeContext: WorkspaceContext.PLAY as const,
    sidebarState: SidebarState.EXPANDED as const,
    inspectorState: InspectorState.OPEN as const,
    activePanelId: 'character-stats' as const,
    favoritesPanelIds: ['character-stats', 'moves', 'equipment', 'spells'] as const,
    recentPanelIds: ['character-stats', 'moves', 'equipment', 'spells', 'inventory', 'session-tools'] as const
  },
  panels: {
    'character-stats': {
      id: 'character-stats' as const,
      title: 'Character Stats' as const,
      icon: '👤' as const,
      visibility: PanelVisibility.VISIBLE as const,
      gridPosition: { row: 1, col: 1, rowSpan: 2, colSpan: 3 }
    },
    'moves': {
      id: 'moves' as const,
      title: 'Moves' as const,
      icon: '⚔️' as const,
      visibility: PanelVisibility.VISIBLE as const, 
      gridPosition: { row: 1, col: 4, rowSpan: 3, colSpan: 4 }
    },
    'equipment': {
      id: 'equipment' as const,
      title: 'Equipment' as const,
      icon: '🛡️' as const,
      visibility: PanelVisibility.VISIBLE as const, 
      gridPosition: { row: 3, col: 1, rowSpan: 2, colSpan: 3 }
    },
    'inventory': {
      id: 'inventory' as const,
      title: 'Inventory' as const,
      icon: '🎒' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 1, col: 8, rowSpan: 2, colSpan: 4 }
    },
    'spells': {
      id: 'spells' as const,
      title: 'Spells' as const,
      icon: '✨' as const,
      visibility: PanelVisibility.VISIBLE as const,
      gridPosition: { row: 3, col: 4, rowSpan: 2, colSpan: 4 }
    },
    'campaign': {
      id: 'campaign' as const,
      title: 'Campaign' as const,
      icon: '📖' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 5, col: 1, rowSpan: 3, colSpan: 6 }
    },
    'session-tools': {
      id: 'session-tools' as const,
      title: 'Session Tools' as const,
      icon: '🎲' as const,
      visibility: PanelVisibility.VISIBLE as const,
      gridPosition: { row: 1, col: 8, rowSpan: 2, colSpan: 4 }
    },
    'bond-tracker': {
      id: 'bond-tracker' as const,
      title: 'Bond Tracker' as const,
      icon: '🤝' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 3, col: 8, rowSpan: 2, colSpan: 4 }
    },
    'alignment-xp-tracker': {
      id: 'alignment-xp-tracker' as const,
      title: 'Alignment XP Tracker' as const,
      icon: '⚖️' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 5, col: 7, rowSpan: 2, colSpan: 5 }
    },
    'condition-tracker': {
      id: 'condition-tracker' as const,
      title: 'Condition Tracker' as const,
      icon: '🩹' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 7, col: 1, rowSpan: 2, colSpan: 6 }
    },
    'move-library': {
      id: 'move-library' as const,
      title: 'Move Library' as const,
      icon: '📚' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 1, col: 1, rowSpan: 4, colSpan: 6 }
    },
    'equipment-compendium': {
      id: 'equipment-compendium' as const,
      title: 'Equipment Compendium' as const,
      icon: '📋' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 1, col: 7, rowSpan: 4, colSpan: 5 }
    },
    'content-studio': {
      id: 'content-studio' as const,
      title: 'Content Studio' as const,
      icon: '🎨' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 5, col: 1, rowSpan: 4, colSpan: 12 }
    },
    'character-creation': {
      id: 'character-creation' as const,
      title: 'Character Creation' as const,
      icon: '🧙' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 1, col: 1, rowSpan: 6, colSpan: 8 }
    },
    'special-moves': {
      id: 'special-moves' as const,
      title: 'Special Moves' as const,
      icon: '⭐' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 1, col: 9, rowSpan: 3, colSpan: 4 }
    },
    'settings': {
      id: 'settings' as const,
      title: 'Settings' as const,
      icon: '⚙️' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 7, col: 7, rowSpan: 2, colSpan: 5 }
    },
    'test-playground': {
      id: 'test-playground' as const,
      title: 'Test Playground' as const,
      icon: '🧪' as const,
      visibility: PanelVisibility.HIDDEN as const,
      gridPosition: { row: 9, col: 1, rowSpan: 3, colSpan: 12 }
    }
  },
  gameState: {
    activeCharacterId: 'char-1' as const,
    characters: {
      'char-1': {
        id: 'char-1' as const,
        name: 'Thorin Ironbeard' as const,
        class: 'Fighter' as const,
        level: 3,
        xp: 12,
        hp: { current: 18, max: 24 },
        attributes: { STR: 16, DEX: 13, CON: 15, INT: 8, WIS: 12, CHA: 9 },
        armor: 2,
        damageDie: 'd10' as const,
        load: { current: 8, max: 13 }
      }
    }
  }
};

// Mock data for context configurations
export const mockQuery = {
  contextConfigs: {
    [WorkspaceContext.PLAY]: {
      visiblePanels: ['character-stats', 'moves', 'equipment', 'session-tools'] as const,
      inspectorEnabled: true,
      gridLayout: 'compact' as const,
      primaryPanels: ['character-stats', 'moves'] as const,
      secondaryPanels: ['equipment', 'session-tools'] as const
    },
    [WorkspaceContext.PREP]: {
      visiblePanels: ['character-stats', 'spells', 'inventory', 'bond-tracker', 'alignment-xp-tracker'] as const,
      inspectorEnabled: true,
      gridLayout: 'detailed' as const,
      primaryPanels: ['character-stats', 'spells'] as const,
      secondaryPanels: ['inventory', 'bond-tracker', 'alignment-xp-tracker'] as const
    },
    [WorkspaceContext.BUILD]: {
      visiblePanels: ['character-creation', 'move-library', 'equipment-compendium'] as const,
      inspectorEnabled: false,
      gridLayout: 'wizard' as const,
      primaryPanels: ['character-creation'] as const,
      secondaryPanels: ['move-library', 'equipment-compendium'] as const
    },
    [WorkspaceContext.REFERENCE]: {
      visiblePanels: ['move-library', 'equipment-compendium', 'content-studio', 'special-moves'] as const,
      inspectorEnabled: true,
      gridLayout: 'reference' as const,
      primaryPanels: ['move-library', 'equipment-compendium'] as const,
      secondaryPanels: ['content-studio', 'special-moves'] as const
    }
  },
  panelRegistry: {
    totalPanels: 17,
    registeredPanels: [
      'character-stats', 'moves', 'equipment', 'inventory', 'spells', 'campaign', 
      'session-tools', 'bond-tracker', 'alignment-xp-tracker', 'condition-tracker',
      'move-library', 'equipment-compendium', 'content-studio', 'character-creation',
      'special-moves', 'settings', 'test-playground'
    ] as const
  }
};

// Root component props
export const mockRootProps = {
  initialContext: WorkspaceContext.PLAY as const,
  enableKeyboardShortcuts: true,
  enableContextSwitching: true,
  enableInspector: true,
  enableSidebar: true,
  enableCommandPalette: true,
  existingPanelRegistry: true,
  wrapExistingPanels: true
};