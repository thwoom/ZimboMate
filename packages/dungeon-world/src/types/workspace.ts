// Context types for workspace modes
export enum WorkspaceContext {
  PLAY = 'play',
  PREP = 'prep', 
  BUILD = 'build',
  REFERENCE = 'reference'
}

// Panel visibility states
export enum PanelVisibility {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  MINIMIZED = 'minimized'
}

// Inspector panel states
export enum InspectorState {
  OPEN = 'open',
  CLOSED = 'closed',
  COLLAPSED = 'collapsed'
}

// Sidebar states
export enum SidebarState {
  EXPANDED = 'expanded',
  COLLAPSED = 'collapsed',
  HIDDEN = 'hidden'
}

// Existing panel IDs
export enum PanelId {
  CHARACTER_STATS = 'character-stats',
  MOVES = 'moves',
  EQUIPMENT = 'equipment',
  INVENTORY = 'inventory',
  SPELLS = 'spells',
  CAMPAIGN = 'campaign',
  SESSION_TOOLS = 'session-tools',
  BOND_TRACKER = 'bond-tracker',
  ALIGNMENT_XP_TRACKER = 'alignment-xp-tracker',
  CONDITION_TRACKER = 'condition-tracker',
  MOVE_LIBRARY = 'move-library',
  EQUIPMENT_COMPENDIUM = 'equipment-compendium',
  CONTENT_STUDIO = 'content-studio',
  CHARACTER_CREATION = 'character-creation',
  SPECIAL_MOVES = 'special-moves',
  SETTINGS = 'settings',
  TEST_PLAYGROUND = 'test-playground'
}

export const formatContextLabel = (context: WorkspaceContext): string => {
  const labels = {
    [WorkspaceContext.PLAY]: 'Play',
    [WorkspaceContext.PREP]: 'Prep',
    [WorkspaceContext.BUILD]: 'Build', 
    [WorkspaceContext.REFERENCE]: 'Reference'
  };
  return labels[context] || 'Unknown';
};

export const formatContextDescription = (context: WorkspaceContext): string => {
  const descriptions = {
    [WorkspaceContext.PLAY]: 'Runtime actions and quick data',
    [WorkspaceContext.PREP]: 'Leveling, attributes, spells, notes',
    [WorkspaceContext.BUILD]: 'Character creation and editing',
    [WorkspaceContext.REFERENCE]: 'Moves, items, spells, rules'
  };
  return descriptions[context] || 'Unknown context';
};

export const formatKeyboardShortcut = (context: WorkspaceContext): string => {
  const shortcuts = {
    [WorkspaceContext.PLAY]: 'Alt+1',
    [WorkspaceContext.PREP]: 'Alt+2', 
    [WorkspaceContext.BUILD]: 'Alt+3',
    [WorkspaceContext.REFERENCE]: 'Alt+4'
  };
  return shortcuts[context] || '';
};

export const formatPanelName = (panelId: string): string => {
  const names = {
    'character-stats': 'Character Stats',
    'moves': 'Moves',
    'equipment': 'Equipment', 
    'inventory': 'Inventory',
    'spells': 'Spells',
    'campaign': 'Campaign',
    'session-tools': 'Session Tools',
    'bond-tracker': 'Bond Tracker',
    'alignment-xp-tracker': 'Alignment XP Tracker',
    'condition-tracker': 'Condition Tracker',
    'move-library': 'Move Library',
    'equipment-compendium': 'Equipment Compendium',
    'content-studio': 'Content Studio',
    'character-creation': 'Character Creation',
    'special-moves': 'Special Moves',
    'settings': 'Settings',
    'test-playground': 'Test Playground'
  };
  return names[panelId] || panelId;
};