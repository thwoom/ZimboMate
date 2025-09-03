import { describe, it, expect } from 'vitest'
import { MoveCompendiumService } from '../../src/services/MoveCompendiumService'

describe('MoveCompendiumService', () => {
  const svc = new MoveCompendiumService()

  it('returns available moves for a class and level', () => {
    const wizard = svc.getAvailableMoves('Wizard' as any, 1)
    expect(wizard.length).toBeGreaterThan(0)
    expect(wizard.some(m => m.category === 'basic')).toBe(true)
  })

  it('filters by query and class', () => {
    const results = svc.searchMoves({ query: 'Hack', characterClass: 'Fighter' as any })
    expect(results.some(m => m.name.toLowerCase().includes('hack'))).toBe(true)
  })
})


