/**
 * Condition and status effect models for Dungeon World
 */

// Condition duration types
export type ConditionDuration =
  | 'instant'    // Applied and removed immediately
  | 'scene'      // Until end of current scene
  | 'session'    // Until end of game session
  | 'permanent'  // Until removed by specific means
  | 'custom';    // Custom duration logic

// Condition categories
export type ConditionCategory =
  | 'physical'   // Physical ailments
  | 'mental'     // Mental conditions
  | 'magical'    // Magical effects
  | 'divine'     // Divine influences
  | 'environmental' // Environmental hazards
  | 'social';    // Social conditions

// Main condition interface
export interface Condition {
  id: string;
  name: string;
  category: ConditionCategory;
  description: string;
  mechanicalEffect?: string; // Game mechanics description
  narrativeEffect?: string; // Story / roleplay description
  duration: ConditionDuration;

  // Visual indicators
  icon?: string;
  color?: string;

  // Mechanical modifiers
  modifiers?: {
    attributes?: Partial < Record<string, number>>;
    armor?: number;
    damage?: string;
    ongoing?: number;
    forward?: number;
  };

  // Triggers
  triggers?: {
    onGain?: string; // What happens when condition is gained
    onLose?: string; // What happens when condition is removed
    perTurn?: string; // What happens each turn / action
  };

  // Stacking behavior
  stackable: boolean;
  maxStacks?: number;

  // Removal conditions
  removalConditions?: string[];
}

// Character's active condition
export interface ActiveCondition {
  conditionId: string;
  characterId: string;
  startTime: Date;
  stacks: number;
  customData?: unknown; // For tracking condition-specific data
  active: boolean;
}

// Common conditions in Dungeon World
export const COMMON_CONDITIONS: Partial < Condition>[] = [
  // Physical Conditions
  {
    name: 'Bleeding',
    category: 'physical',
    description: 'You are losing blood from your wounds.',
    mechanicalEffect: 'Take 1 damage at the start of each scene until treated.',
    duration: 'permanent',
    triggers: {
      perTurn: 'Take 1 damage',
    },
    removalConditions: ['Receive medical treatment', 'Magical healing'],
    stackable: true,
  },
  {
    name: 'Stunned',
    category: 'physical',
    description: 'You are dazed and unable to act effectively.',
    mechanicalEffect: 'You can only speak and perform basic movement.',
    duration: 'scene',
    modifiers: {
      ongoing: -2,
    },
    stackable: false,
  },
  {
    name: 'Poisoned',
    category: 'physical',
    description: 'Poison courses through your veins.',
    mechanicalEffect: 'Take-1 ongoing to all rolls.',
    duration: 'permanent',
    modifiers: {
      ongoing: -1,
    },
    removalConditions: ['Antidote', 'Cure spell', 'Wait 24 hours'],
    stackable: false,
  },

  // Mental Conditions
  {
    name: 'Frightened',
    category: 'mental',
    description: 'Fear grips your heart.',
    mechanicalEffect: 'Take-1 ongoing when acting against the source of your fear.',
    duration: 'scene',
    modifiers: {
      ongoing: -1,
    },
    stackable: false,
  },
  {
    name: 'Confused',
    category: 'mental',
    description: 'Your mind is clouded and unclear.',
    mechanicalEffect: 'The GM may ask you to act against your interests.',
    duration: 'scene',
    stackable: false,
  },
  {
    name: 'Charmed',
    category: 'mental',
    description: 'You view someone as a trusted friend.',
    mechanicalEffect: 'You cannot act directly against the charmer.',
    duration: 'scene',
    removalConditions: ['Take damage from charmer', 'See charmer harm an ally'],
    stackable: false,
  },

  // Magical Conditions
  {
    name: 'Blessed',
    category: 'magical',
    description: 'Divine favor shines upon you.',
    mechanicalEffect: 'Take + 1 ongoing.',
    duration: 'scene',
    modifiers: {
      ongoing: 1,
    },
    stackable: false,
  },
  {
    name: 'Cursed',
    category: 'divine',
    description: 'You are under a terrible curse.',
    mechanicalEffect: 'Roll twice and take the worse result on all rolls.',
    duration: 'permanent',
    removalConditions: ['Remove curse spell', 'Complete quest', 'Divine intervention'],
    stackable: false,
  },
  {
    name: 'Invisible',
    category: 'magical',
    description: 'You cannot be seen by normal means.',
    mechanicalEffect: 'Enemies cannot target you directly unless they can detect you.',
    duration: 'scene',
    triggers: {
      onLose: 'Become visible in a dramatic fashion',
    },
    stackable: false,
  },

  // Environmental Conditions
  {
    name: 'On Fire',
    category: 'environmental',
    description: 'You are literally on fire!',
    mechanicalEffect: 'Take 1d4 damage at the start of your turn.',
    duration: 'custom',
    triggers: {
      perTurn: 'Roll 1d4 damage',
      onGain: 'Panic or act calmly (player choice)',
    },
    removalConditions: ['Stop, drop, and roll', 'Douse with water', 'Smother flames'],
    stackable: false,
  },
  {
    name: 'Frozen',
    category: 'environmental',
    description: 'Ice encases your body.',
    mechanicalEffect: 'You cannot move or act, but gain + 1 armor.',
    duration: 'custom',
    modifiers: {
      armor: 1,
    },
    removalConditions: ['Take fire damage', 'Break free (STR roll)', 'Thaw naturally'],
    stackable: false,
  },

  // Social Conditions
  {
    name: 'Inspired',
    category: 'social',
    description: 'Words or deeds have filled you with courage.',
    mechanicalEffect: 'Take + 1 forward to act on the inspiration.',
    duration: 'instant',
    modifiers: {
      forward: 1,
    },
    stackable: true,
    maxStacks: 3,
  },
  {
    name: 'Demoralized',
    category: 'social',
    description: 'Your spirit is broken.',
    mechanicalEffect: 'Take-1 ongoing to aggressive actions.',
    duration: 'scene',
    modifiers: {
      ongoing: -1,
    },
    removalConditions: ['Succeed at a difficult task', 'Receive encouragement'],
    stackable: false,
  },
];

// Utility functions

/**
 * Apply condition to character
 */
export function applyCondition(
  characterId: string,
  condition: Condition,
  activeConditions: ActiveCondition[],
): ActiveCondition[] {
  const existing = activeConditions.find(
    ac => ac.characterId === characterId && ac.conditionId === condition.id,
  );

  if (existing) {
    if (condition.stackable) {
      // Add a stack
      const maxStacks = condition.maxStacks || Infinity;
      return activeConditions.map(ac =>
        ac === existing
          ? { ...ac, stacks: Math.min(ac.stacks + 1, maxStacks) }
          : ac,
      );
    }
    // Already has non-stackable condition
    return activeConditions;
  }

  // Add new condition
  const newCondition: ActiveCondition = {
    conditionId: condition.id,
    characterId,
    startTime: new Date(),
    stacks: 1,
    active: true,
  };

  return [...activeConditions, newCondition];
}

/**
 * Remove condition from character
 */
export function removeCondition(
  characterId: string,
  conditionId: string,
  activeConditions: ActiveCondition[],
): ActiveCondition[] {
  return activeConditions.filter(
    ac => !(ac.characterId === characterId && ac.conditionId === conditionId),
  );
}

/**
 * Get character's active conditions
 */
export function getCharacterConditions(
  characterId: string,
  activeConditions: ActiveCondition[],
  conditionDefinitions: Condition[],
): Condition[] {
  const charConditions = activeConditions.filter(
    ac => ac.characterId === characterId && ac.active,
  );

  return charConditions
    .map(ac => conditionDefinitions.find(c => c.id === ac.conditionId))
    .filter((c): c is Condition => c !== undefined);
}

/**
 * Process end of scene
 */
export function endSceneConditions(
  activeConditions: ActiveCondition[],
): ActiveCondition[] {
  return activeConditions.map(ac => {
    const condition = COMMON_CONDITIONS.find(c => c.id === ac.conditionId);
    if (condition?.duration === 'scene') {
      return { ...ac, active: false };
    }
    return ac;
  });
}

/**
 * Process end of session
 */
export function endSessionConditions(
  activeConditions: ActiveCondition[],
): ActiveCondition[] {
  return activeConditions.map(ac => {
    const condition = COMMON_CONDITIONS.find(c => c.id === ac.conditionId);
    if (condition?.duration === 'scene' || condition?.duration === 'session') {
      return { ...ac, active: false };
    }
    return ac;
  });
}

/**
 * Get total condition modifiers
 */
export function getConditionModifiers(
  conditions: Condition[],
  activeConditions: ActiveCondition[],
): {
  ongoing: number;
  forward: number;
  armor: number;
} {
  let ongoing = 0;
  let forward = 0;
  let armor = 0;

  for (const condition of conditions) {
    const active = activeConditions.find(ac => ac.conditionId === condition.id);
    if (!active || !active.active) continue;

    const stacks = active.stacks || 1;

    if (condition.modifiers) {
      ongoing += (condition.modifiers.ongoing || 0) * stacks;
      forward += (condition.modifiers.forward || 0) * stacks;
      armor += (condition.modifiers.armor || 0) * stacks;
    }
  }

  return { ongoing, forward, armor };
}
