import { describe, it, expect } from 'vitest'
import { getEncumbranceTier, getSpellBudgetProgress, getXpToNext, getAttributeTooltip } from '../../src/utils/statsPanelHelpers'

describe('statsPanelHelpers', () => {
  it('computes encumbrance tiers', () => {
    expect(getEncumbranceTier(5, 10)).toBe('ok')
    expect(getEncumbranceTier(11, 10)).toBe('encumbered')
  })

  it('caps spell budget progress 0..100', () => {
    expect(getSpellBudgetProgress(0, 0)).toBe(0)
    expect(getSpellBudgetProgress(2, 4)).toBe(50)
    expect(getSpellBudgetProgress(10, 4)).toBe(100)
  })

  it('computes XP to next', () => {
    expect(getXpToNext(1, 0)).toBe(8)
    expect(getXpToNext(3, 5)).toBe(5)
    expect(getXpToNext(5, 20)).toBe(0)
  })

  it('returns attribute tooltip text', () => {
    expect(getAttributeTooltip('STR')).toContain('Melee')
    expect(getAttributeTooltip('CHA')).toContain('Presence')
  })
})


