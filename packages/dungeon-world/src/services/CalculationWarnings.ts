/**
 * Enhanced calculation warnings with detailed suggestions
 */

export interface CalculationWarning {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  category: 'hp' | 'load' | 'equipment' | 'xp' | 'attributes' | 'general';
  title: string;
  message: string;
  suggestion?: string;
  actionable?: {
    label: string;
    action: () => void;
  };
  details?: Record < string, unknown>;
}

export class CalculationWarningsService {
  generateWarnings(context: {
    hp: { current: number; max: number };
    armor: number;
    load: { current: number; max: number };
    encumbranceStatus: 'normal' | 'encumbered' | 'overloaded';
    xp: { current: number; threshold: number };
    level: number;
    bonds: number;
    debilities: Record < string, boolean>;
    equippedItems: Array<{ name: string; category: string; tags?: Array<{ name: string }> }>;
  }): CalculationWarning[] {
    const warnings: CalculationWarning[] = [];

    // HP Warnings
    if (context.hp.current <= 0) {
      warnings.push({
        id: 'hp-zero',
        type: 'critical',
        category: 'hp',
        title: "Death's Door",
        message: 'Your HP has reached 0. You must immediately make the Last Breath move.',
        suggestion: 'Roll + nothing (just 2d6). On 10+, you\'re stable. On 7-9, Death offers a bargain. On 6-, you meet your fate.',
        details: { currentHP: context.hp.current },
      });
    } else if (context.hp.current <= context.hp.max * 0.25) {
      warnings.push({
        id: 'hp-critical',
        type: 'warning',
        category: 'hp',
        title: 'Critically Wounded',
        message: `You have only ${context.hp.current} HP remaining (${Math.round(context.hp.current / context.hp.max * 100)}% of max).`,
        suggestion: 'Consider healing, retreating, or using defensive moves like Defend.',
        details: { currentHP: context.hp.current, maxHP: context.hp.max },
      });
    } else if (context.hp.current <= context.hp.max * 0.5) {
      warnings.push({
        id: 'hp-low',
        type: 'info',
        category: 'hp',
        title: 'Wounded',
        message: `You\'re at ${Math.round(context.hp.current / context.hp.max * 100)}% health.`,
        suggestion: 'Keep an eye on your HP and have healing options ready.',
        details: { currentHP: context.hp.current, maxHP: context.hp.max },
      });
    }

    if (context.hp.current > context.hp.max) {
      warnings.push({
        id: 'hp-overflow',
        type: 'error',
        category: 'hp',
        title: 'HP Exceeds Maximum',
        message: `Current HP (${context.hp.current}) exceeds your maximum HP (${context.hp.max}).`,
        suggestion: 'Adjust your current HP to not exceed the maximum.',
        details: { currentHP: context.hp.current, maxHP: context.hp.max },
      });
    }

    // Load / Encumbrance Warnings
    if (context.encumbranceStatus === 'overloaded') {
      warnings.push({
        id: 'load-overloaded',
        type: 'critical',
        category: 'load',
        title: 'Overloaded!',
        message: `You're carrying ${context.load.current} weight (max: ${context.load.max}). You can barely move!`,
        suggestion: `Drop at least ${context.load.current-context.load.max} weight worth of items immediately.`,
        details: {
          currentLoad: context.load.current,
          maxLoad: context.load.max,
          excess: context.load.current-context.load.max,
        },
      });
    } else if (context.encumbranceStatus === 'encumbered') {
      warnings.push({
        id: 'load-encumbered',
        type: 'warning',
        category: 'load',
        title: 'Encumbered',
        message: `Carrying ${context.load.current}/${context.load.max} weight. You have-1 ongoing to all rolls.`,
        suggestion: `Drop ${context.load.current-context.load.max + 1} weight to remove the penalty.`,
        details: {
          currentLoad: context.load.current,
          maxLoad: context.load.max,
          penalty: -1,
        },
      });
    } else if (context.load.current >= context.load.max * 0.8) {
      warnings.push({
        id: 'load-near - max',
        type: 'info',
        category: 'load',
        title: 'Near Load Limit',
        message: `You're at ${Math.round(context.load.current / context.load.max * 100)}% of your load capacity.`,
        suggestion: 'Consider dropping non-essential items before picking up more.',
        details: {
          currentLoad: context.load.current,
          maxLoad: context.load.max,
          remaining: context.load.max-context.load.current,
        },
      });
    }

    // Equipment Warnings
    const equippedArmor = context.equippedItems.filter(item => item.category === 'armor');
    if (equippedArmor.length > 1) {
      warnings.push({
        id: 'equipment-multiple-armor',
        type: 'error',
        category: 'equipment',
        title: 'Multiple Armor Equipped',
        message: 'You can only wear one suit of armor at a time.',
        suggestion: `Unequip ${equippedArmor.slice(1).map(a => a.name).join(' or ')}.`,
        details: { equippedArmor: equippedArmor.map(a => a.name) },
      });
    }

    const clumsyArmor = context.equippedItems.find(item =>
      item.tags?.some(tag => tag.name === 'clumsy'),
    );
    if (clumsyArmor) {
      warnings.push({
        id: 'equipment-clumsy',
        type: 'warning',
        category: 'equipment',
        title: 'Clumsy Armor Equipped',
        message: `${clumsyArmor.name} gives-1 ongoing to DEX-based moves.`,
        suggestion: 'Consider switching to lighter armor if you rely on DEX.',
        details: { armor: clumsyArmor.name },
      });
    }

    const twoHandedWeapons = context.equippedItems.filter(item =>
      item.category === 'weapon' && item.tags?.some(tag => tag.name === 'two-handed'),
    );
    const allWeapons = context.equippedItems.filter(item => item.category === 'weapon');
    if (twoHandedWeapons.length > 0 && allWeapons.length > 1) {
      warnings.push({
        id: 'equipment-two-handed-conflict',
        type: 'warning',
        category: 'equipment',
        title: 'Two-Handed Weapon Conflict',
        message: `${twoHandedWeapons[0].name} requires both hands.`,
        suggestion: 'Unequip other weapons or switch to a one-handed weapon.',
        details: {
          twoHanded: twoHandedWeapons[0].name,
          otherWeapons: allWeapons.filter(w => w !== twoHandedWeapons[0]).map(w => w.name),
        },
      });
    }

    // XP / Level Warnings
    if (context.xp.current >= context.xp.threshold) {
      warnings.push({
        id: 'xp-level-up',
        type: 'info',
        category: 'xp',
        title: 'Level Up Available!',
        message: `You have ${context.xp.current}/${context.xp.threshold} XP.`,
        suggestion: 'Use the Level Up move to advance your character.',
        details: {
          currentXP: context.xp.current,
          threshold: context.xp.threshold,
          nextLevel: context.level + 1,
        },
      });
    } else if (context.xp.current >= context.xp.threshold * 0.8) {
      warnings.push({
        id: 'xp-near-level',
        type: 'info',
        category: 'xp',
        title: 'Close to Level Up',
        message: `Only ${context.xp.threshold-context.xp.current} XP until level ${context.level + 1}.`,
        suggestion: 'Look for opportunities to gain XP through failed rolls and end-of - session moves.',
        details: {
          currentXP: context.xp.current,
          threshold: context.xp.threshold,
          remaining: context.xp.threshold-context.xp.current,
        },
      });
    }

    // Attribute / Debility Warnings
    const activeDebilities = Object.entries(context.debilities)
      .filter(([, active]) => active)
      .map(([name]) => name);

    if (activeDebilities.length > 0) {
      warnings.push({
        id: 'attributes-debilities',
        type: 'warning',
        category: 'attributes',
        title: 'Active Debilities',
        message: `You have ${activeDebilities.length} debilities affecting your modifiers.`,
        suggestion: 'Seek healing or rest to recover from debilities.',
        details: { debilities: activeDebilities },
      });
    }

    // General Warnings
    if (context.bonds === 0) {
      warnings.push({
        id: 'general-no-bonds',
        type: 'info',
        category: 'general',
        title: 'No Bonds',
        message: 'You have no bonds with other characters.',
        suggestion: 'Create bonds with party members for better roleplay and XP opportunities.',
        details: { bondCount: 0 },
      });
    }

    if (context.armor === 0) {
      warnings.push({
        id: 'general-no-armor',
        type: 'info',
        category: 'general',
        title: 'Unarmored',
        message: 'You have no armor protection.',
        suggestion: 'Consider equipping armor to reduce damage taken.',
        details: { armor: 0 },
      });
    }

    return warnings;
  }

  /**
   * Get optimization suggestions based on current state
   */
  getOptimizationSuggestions(warnings: CalculationWarning[]): string[] {
    const suggestions: string[] = [];
    const warningsByCategory = this.groupByCategory(warnings);

    // Load optimization
    if (warningsByCategory.load?.some(w => w.type === 'warning' || w.type === 'critical')) {
      suggestions.push('Consider organizing your inventory: keep essentials, store or sell excess items.');
      suggestions.push('Look for bags of holding or similar magical storage.');
      suggestions.push('Distribute heavy items among party members.');
    }

    // Combat readiness
    if (warningsByCategory.hp?.some(w => w.type === 'warning') ||
        warningsByCategory.general?.some(w => w.id === 'general-no-armor')) {
      suggestions.push('Stock up on healing potions and bandages.');
      suggestions.push('Learn or prepare healing spells if available.');
      suggestions.push('Consider defensive equipment upgrades.');
    }

    // Character development
    if (warningsByCategory.xp?.some(w => w.id === 'xp-level-up')) {
      suggestions.push('Plan your advancement: choose moves that complement your playstyle.');
      suggestions.push('Consider multiclass moves for versatility.');
    }

    return suggestions;
  }

  private groupByCategory(warnings: CalculationWarning[]): Record < string, CalculationWarning[]> {
    return warnings.reduce((groups, warning) => {
      if (!groups[warning.category]) {
        groups[warning.category] = [];
      }
      groups[warning.category].push(warning);
      return groups;
    }, {} as Record < string, CalculationWarning[]>);
  }
}

export const calculationWarnings = new CalculationWarningsService();



