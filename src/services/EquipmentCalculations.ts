/**
 * Equipment calculation service for automatic stat updates
 */

import { Item, isWeapon, isArmor, hasTag, getTagValue } from '../models/Equipment';
import { Character, Attributes } from '../models/Character';

export interface EquipmentStats {
  totalArmor: number;
  totalWeight: number;
  damageBonus: number;
  damageDice: string[];
  encumbranceStatus: 'normal' | 'encumbered' | 'overloaded';
  specialEffects: EquipmentEffect[];
}

export interface EquipmentEffect {
  id: string;
  name: string;
  description: string;
  type: 'bonus' | 'penalty' | 'special';
  affects: string[]; // What it affects (e.g., ['STR', 'damage', 'armor'])
  value?: number;
}

export interface WeaponInfo {
  name: string;
  damage: string;
  tags: string[];
  range: 'hand' | 'close' | 'reach' | 'near' | 'far';
  properties: string[];
}

export interface ArmorInfo {
  name: string;
  armorValue: number;
  tags: string[];
  penalties: string[];
}

class EquipmentCalculationService {
  
  /**
   * Calculate all equipment-related stats for a character
   */
  calculateEquipmentStats(character: Character): EquipmentStats {
    const inventory = character.inventory || [];
    const equippedItems = inventory.filter(item => item.equipped);

    const totalArmor = this.calculateTotalArmor(equippedItems);
    const totalWeight = this.calculateTotalWeight(inventory);
    const damageBonus = this.calculateDamageBonus(equippedItems);
    const damageDice = this.getDamageDice(equippedItems);
    const encumbranceStatus = this.calculateEncumbrance(totalWeight, character);
    const specialEffects = this.getSpecialEffects(equippedItems);

    return {
      totalArmor,
      totalWeight,
      damageBonus,
      damageDice,
      encumbranceStatus,
      specialEffects
    };
  }

  /**
   * Calculate total armor value from equipped armor
   */
  calculateTotalArmor(equippedItems: Item[]): number {
    let totalArmor = 0;

    for (const item of equippedItems) {
      if (isArmor(item)) {
        totalArmor += item.armorValue || 0;
      } else {
        // Check for armor tags on non-armor items
        const armorValue = getTagValue(item, 'armor');
        if (typeof armorValue === 'number') {
          totalArmor += armorValue;
        } else if (typeof armorValue === 'string') {
          const match = armorValue.match(/\+?(\d+)/);
          if (match) {
            totalArmor += parseInt(match[1]);
          }
        }
      }
    }

    return totalArmor;
  }

  /**
   * Calculate total weight of all items
   */
  calculateTotalWeight(inventory: Item[]): number {
    return inventory.reduce((total, item) => {
      return total + (item.weight * item.quantity);
    }, 0);
  }

  /**
   * Calculate damage bonus from equipped weapons and items
   */
  calculateDamageBonus(equippedItems: Item[]): number {
    let damageBonus = 0;

    for (const item of equippedItems) {
      // Check for damage bonus tags
      const damageValue = getTagValue(item, 'damage');
      if (typeof damageValue === 'number') {
        damageBonus += damageValue;
      } else if (typeof damageValue === 'string') {
        const match = damageValue.match(/\+(\d+)/);
        if (match) {
          damageBonus += parseInt(match[1]);
        }
      }

      // Check weapon enhancement
      if (isWeapon(item) && item.enhancement) {
        damageBonus += item.enhancement;
      }
    }

    return damageBonus;
  }

  /**
   * Get damage dice from equipped weapons
   */
  getDamageDice(equippedItems: Item[]): string[] {
    const damageDice: string[] = [];

    for (const item of equippedItems) {
      if (isWeapon(item) && item.damage) {
        damageDice.push(item.damage);
      } else {
        // Check for damage tags
        const damageValue = getTagValue(item, 'damage');
        if (typeof damageValue === 'string' && damageValue.includes('d')) {
          damageDice.push(damageValue);
        }
      }
    }

    return damageDice;
  }

  /**
   * Calculate encumbrance status
   */
  calculateEncumbrance(totalWeight: number, character: Character): 'normal' | 'encumbered' | 'overloaded' {
    const maxLoad = character.load?.max || this.calculateMaxLoad(character);
    
    if (totalWeight <= maxLoad) {
      return 'normal';
    } else if (totalWeight <= maxLoad + 2) {
      return 'encumbered';
    } else {
      return 'overloaded';
    }
  }

  /**
   * Calculate maximum load capacity
   */
  calculateMaxLoad(character: Character): number {
    const baseLoad = character.baseLoad || 10;
    const strModifier = Math.floor((character.attributes.STR - 10) / 2);
    return baseLoad + strModifier;
  }

  /**
   * Get special effects from equipped items
   */
  getSpecialEffects(equippedItems: Item[]): EquipmentEffect[] {
    const effects: EquipmentEffect[] = [];

    for (const item of equippedItems) {
      // Check for clumsy armor
      if (hasTag(item, 'clumsy')) {
        effects.push({
          id: `${item.id}-clumsy`,
          name: 'Clumsy Armor',
          description: '-1 ongoing to DEX-based moves',
          type: 'penalty',
          affects: ['DEX'],
          value: -1
        });
      }

      // Check for magical bonuses
      if (hasTag(item, 'magical')) {
        const enhancement = isWeapon(item) ? item.enhancement : 
                          isArmor(item) ? item.enhancement : 
                          getTagValue(item, 'enhancement');
        
        if (enhancement && typeof enhancement === 'number') {
          effects.push({
            id: `${item.id}-magical`,
            name: `Magical ${item.name}`,
            description: `+${enhancement} magical bonus`,
            type: 'bonus',
            affects: isWeapon(item) ? ['damage'] : isArmor(item) ? ['armor'] : ['special'],
            value: enhancement
          });
        }
      }

      // Check for other special tags
      if (hasTag(item, 'forceful')) {
        effects.push({
          id: `${item.id}-forceful`,
          name: 'Forceful Weapon',
          description: 'Can knock enemies back or down',
          type: 'special',
          affects: ['combat']
        });
      }

      if (hasTag(item, 'precise')) {
        effects.push({
          id: `${item.id}-precise`,
          name: 'Precise Weapon',
          description: 'Use DEX instead of STR for damage',
          type: 'special',
          affects: ['damage', 'DEX']
        });
      }

      if (hasTag(item, 'messy')) {
        effects.push({
          id: `${item.id}-messy`,
          name: 'Messy Weapon',
          description: '+1d4 damage but creates mess',
          type: 'bonus',
          affects: ['damage'],
          value: 1
        });
      }

      // Custom moves from magical items
      if (item.customMove) {
        effects.push({
          id: `${item.id}-custom`,
          name: `${item.name} Special`,
          description: item.customMove,
          type: 'special',
          affects: ['special']
        });
      }
    }

    return effects;
  }

  /**
   * Get detailed weapon information
   */
  getWeaponInfo(item: Item): WeaponInfo | null {
    if (!isWeapon(item)) return null;

    const tags = item.tags.map(tag => tag.name);
    const range = this.determineWeaponRange(tags);
    const properties = this.getWeaponProperties(tags);

    return {
      name: item.name,
      damage: item.damage || 'No damage specified',
      tags,
      range,
      properties
    };
  }

  /**
   * Get detailed armor information
   */
  getArmorInfo(item: Item): ArmorInfo | null {
    if (!isArmor(item)) return null;

    const tags = item.tags.map(tag => tag.name);
    const penalties = this.getArmorPenalties(tags);

    return {
      name: item.name,
      armorValue: item.armorValue || 0,
      tags,
      penalties
    };
  }

  /**
   * Determine weapon range from tags
   */
  private determineWeaponRange(tags: string[]): 'hand' | 'close' | 'reach' | 'near' | 'far' {
    if (tags.includes('far')) return 'far';
    if (tags.includes('near')) return 'near';
    if (tags.includes('reach')) return 'reach';
    if (tags.includes('close')) return 'close';
    return 'hand';
  }

  /**
   * Get weapon properties from tags
   */
  private getWeaponProperties(tags: string[]): string[] {
    const properties: string[] = [];
    
    const propertyTags = [
      'forceful', 'messy', 'piercing', 'precise', 'reload', 
      'stun', 'thrown', 'two-handed', 'awkward', 'dangerous'
    ];

    for (const tag of tags) {
      if (propertyTags.includes(tag)) {
        properties.push(tag);
      }
    }

    return properties;
  }

  /**
   * Get armor penalties from tags
   */
  private getArmorPenalties(tags: string[]): string[] {
    const penalties: string[] = [];

    if (tags.includes('clumsy')) {
      penalties.push('-1 ongoing to DEX-based moves');
    }

    if (tags.includes('awkward')) {
      penalties.push('Unwieldy and hard to use');
    }

    return penalties;
  }

  /**
   * Check if character meets weapon requirements
   */
  checkWeaponRequirements(weapon: Item, character: Character): {
    canUse: boolean;
    requirements: string[];
    warnings: string[];
  } {
    const requirements: string[] = [];
    const warnings: string[] = [];
    let canUse = true;

    // Check STR requirements for heavy weapons
    if (hasTag(weapon, 'two-handed') && character.attributes.STR < 13) {
      warnings.push('Low STR may make two-handed weapons less effective');
    }

    // Check DEX requirements for precise weapons
    if (hasTag(weapon, 'precise') && character.attributes.DEX < 13) {
      warnings.push('Low DEX reduces effectiveness of precise weapons');
    }

    // Check class restrictions (if any)
    const classRestrictions = this.getClassWeaponRestrictions(character.class);
    if (classRestrictions.length > 0) {
      const weaponType = this.getWeaponType(weapon);
      if (classRestrictions.includes(weaponType)) {
        canUse = false;
        requirements.push(`${character.class}s cannot use ${weaponType} weapons`);
      }
    }

    return { canUse, requirements, warnings };
  }

  /**
   * Get class weapon restrictions
   */
  private getClassWeaponRestrictions(characterClass: string): string[] {
    const restrictions: Record<string, string[]> = {
      'Wizard': ['heavy', 'martial'],
      'Thief': ['heavy'],
      'Druid': ['metal'] // No metal weapons/armor
    };

    return restrictions[characterClass] || [];
  }

  /**
   * Determine weapon type
   */
  private getWeaponType(weapon: Item): string {
    if (hasTag(weapon, 'two-handed')) return 'heavy';
    if (hasTag(weapon, 'close') || hasTag(weapon, 'reach')) return 'martial';
    return 'simple';
  }

  /**
   * Auto-equip optimal gear for a character
   */
  autoEquipOptimalGear(character: Character): Item[] {
    const inventory = character.inventory || [];
    const equipped: Item[] = [];

    // Find best weapon
    const weapons = inventory.filter(isWeapon);
    const bestWeapon = this.findBestWeapon(weapons, character);
    if (bestWeapon) {
      equipped.push({ ...bestWeapon, equipped: true });
    }

    // Find best armor
    const armors = inventory.filter(isArmor);
    const bestArmor = this.findBestArmor(armors, character);
    if (bestArmor) {
      equipped.push({ ...bestArmor, equipped: true });
    }

    // Equip essential items
    const essentials = inventory.filter(item => 
      hasTag(item, 'ration') || 
      hasTag(item, 'adventuring-gear') ||
      item.name.toLowerCase().includes('rope') ||
      item.name.toLowerCase().includes('torch')
    );

    for (const item of essentials) {
      equipped.push({ ...item, equipped: true });
    }

    return equipped;
  }

  /**
   * Find the best weapon for a character
   */
  private findBestWeapon(weapons: Item[], character: Character): Item | null {
    if (weapons.length === 0) return null;

    return weapons.reduce((best, current) => {
      const bestScore = this.scoreWeapon(best, character);
      const currentScore = this.scoreWeapon(current, character);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Find the best armor for a character
   */
  private findBestArmor(armors: Item[], character: Character): Item | null {
    if (armors.length === 0) return null;

    return armors.reduce((best, current) => {
      const bestScore = this.scoreArmor(best, character);
      const currentScore = this.scoreArmor(current, character);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * Score a weapon for a character
   */
  private scoreWeapon(weapon: Item, character: Character): number {
    let score = 0;

    // Base damage score
    if (isWeapon(weapon) && weapon.damage) {
      const damageMatch = weapon.damage.match(/(\d+)d(\d+)/);
      if (damageMatch) {
        const dice = parseInt(damageMatch[1]);
        const sides = parseInt(damageMatch[2]);
        score += dice * sides;
      }
    }

    // Enhancement bonus
    if (isWeapon(weapon) && weapon.enhancement) {
      score += weapon.enhancement * 5;
    }

    // Class synergy
    const classBonuses: Record<string, string[]> = {
      'Fighter': ['forceful', 'two-handed'],
      'Thief': ['precise', 'thrown'],
      'Ranger': ['close', 'near'],
      'Wizard': ['precise', 'thrown']
    };

    const preferredTags = classBonuses[character.class] || [];
    for (const tag of weapon.tags) {
      if (preferredTags.includes(tag.name)) {
        score += 3;
      }
    }

    // Attribute synergy
    if (hasTag(weapon, 'precise') && character.attributes.DEX > character.attributes.STR) {
      score += 5;
    }

    return score;
  }

  /**
   * Score armor for a character
   */
  private scoreArmor(armor: Item, character: Character): number {
    let score = 0;

    if (isArmor(armor)) {
      // Base armor value
      score += armor.armorValue * 10;

      // Enhancement bonus
      if (armor.enhancement) {
        score += armor.enhancement * 5;
      }

      // Penalty for clumsy if high DEX
      if (hasTag(armor, 'clumsy') && character.attributes.DEX > 13) {
        score -= 10;
      }
    }

    return score;
  }
}

export const equipmentCalculationService = new EquipmentCalculationService();
