import { describe, it, expect } from 'vitest'
import { weightOptimizationService } from '../../src/services/WeightOptimizationService'

// Minimal stubs shaped like our models
const character: any = {
  id: 'char-1',
  name: 'Test',
  class: 'Fighter',
  race: 'Human',
  level: 1,
  alignment: 'Neutral',
  attributes: { STR: 12, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  debilities: { weak: false, shaky: false, sick: false, stunned: false, confused: false, scarred: false },
  hp: { current: 10, max: 10 },
  armor: 0,
  damageDie: 'd10',
  xp: 0,
  load: { current: 0, max: 12 },
  baseLoad: 12,
  coin: 0,
  bonds: [],
}

const inventory: any = {
  items: {},
  containers: [],
}

describe('WeightOptimizationService', () => {
  it('returns a summary and suggestions without throwing', () => {
    const result = weightOptimizationService.getOptimization(character, inventory)
    expect(result).toBeDefined()
    expect(result.summary).toBeDefined()
    expect(result.suggestions).toBeDefined()
  })
})


