export type EncumbranceTier = 'ok' | 'encumbered'

export function getEncumbranceTier(load: number, maxLoad: number): EncumbranceTier {
  return load > maxLoad ? 'encumbered' : 'ok'
}

export function getSpellBudgetProgress(preparedLevels: number, budget: number): number {
  if (budget <= 0) return 0
  const pct = (preparedLevels / budget) * 100
  return Math.max(0, Math.min(100, pct))
}

export function getXpToNext(level: number, xp: number): number {
  const threshold = level + 7
  return Math.max(0, threshold - xp)
}

export function getAttributeTooltip(attr: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'): string {
  const map: Record<string, string> = {
    STR: 'Melee power, load capacity, feats of strength',
    DEX: 'Agility, finesse, ranged accuracy',
    CON: 'Durability, HP, resisting harm',
    INT: 'Knowledge, arcane power, analysis',
    WIS: 'Perception, divine power, instinct',
    CHA: 'Presence, leadership, social sway',
  }
  return map[attr] || 'Attribute'
}


