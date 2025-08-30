import { lazy } from 'react';
import { LazyPanel } from './PanelRegistry';

/**
 * Helper function to create a lazy-loaded panel from a panel config module
 */
export function createLazyPanelFromConfig(
  importPath: string
): LazyPanel {
  // Lazy load the entire panel config
  const lazyModule = lazy(async () => {
    const module = await import(importPath);
    const panelConfig = module.default;
    
    // Return a wrapper component that matches the expected shape
    return {
      default: panelConfig.component
    };
  });

  // We need to extract metadata synchronously, so we'll define it here
  // This is a temporary solution - in production, you'd want to extract metadata at build time
  const metadata = {
    id: '',
    name: '',
    icon: '',
    priority: 0,
  };

  return {
    metadata,
    component: lazyModule,
  };
}

/**
 * Create lazy-loaded panel configurations with proper metadata
 */
export const createLazyPanels = () => {
  // Define metadata for each panel
  const panelMetadata = {
    characterStats: {
      id: 'character-stats',
      name: 'Character Stats',
      icon: '👤',
      priority: 1,
    },
    equipment: {
      id: 'equipment',
      name: 'Equipment',
      icon: '⚔️',
      priority: 2,
    },
    moves: {
      id: 'moves',
      name: 'Moves',
      icon: '📜',
      priority: 3,
    },
    characterCreation: {
      id: 'character-creation',
      name: 'Character Creation',
      icon: '✨',
      priority: 0,
    },
    testPlayground: {
      id: 'test-playground',
      name: 'Test Playground',
      icon: '🧪',
      priority: 999,
    },
  };

  return {
    characterStats: {
      metadata: panelMetadata.characterStats,
      component: lazy(async () => {
        const module = await import('../panels/CharacterStatsPanel');
        return { default: module.default.component };
      }),
    },
    equipment: {
      metadata: panelMetadata.equipment,
      component: lazy(async () => {
        const module = await import('../panels/EquipmentPanel');
        return { default: module.default.component };
      }),
    },
    moves: {
      metadata: panelMetadata.moves,
      component: lazy(async () => {
        const module = await import('../panels/MovesPanel');
        return { default: module.default.component };
      }),
    },
    characterCreation: {
      metadata: panelMetadata.characterCreation,
      component: lazy(async () => {
        const module = await import('../panels/CharacterCreationPanel');
        return { default: module.default.component };
      }),
    },
    testPlayground: {
      metadata: panelMetadata.testPlayground,
      component: lazy(async () => {
        const module = await import('../panels/TestPlayground');
        return { default: module.default.component };
      }),
    },
  };
};

export const lazyPanels = createLazyPanels();