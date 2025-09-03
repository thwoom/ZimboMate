import { describe, it, expect } from 'vitest'
import type { Character } from '../../src/models/Character'
import { canUseTag, filterMovesByClass, hasArmorTraining, isCaster } from '../../src/utils/conditionalContent'

const mkChar = (cls: Character['class']): Character => ({
  id: 'c1',
  name: 'Test',
  class: cls,
  race: 'Human',
  level: 1,
  alignment: 'Neutral',
  attributes: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  debilities: { weak: false, shaky: false, sick: false, stunned: false, confused: false, scarred: false },
  hp: { current: 10, max: 10 },
  armor: 0,
  damageDie: 'd6',
  xp: 0,
  load: { current: 0, max: 9 },
  baseLoad: 9,
  coin: 0,
  bonds: [],
  advancements: [],
  knownMoves: [],
  conditions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
})

describe('conditionalContent', () => {
  it('detects casters correctly', () => {
    expect(isCaster(mkChar('Wizard'))).toBe(true)
    expect(isCaster(mkChar('Cleric'))).toBe(true)
    expect(isCaster(mkChar('Immolator'))).toBe(true)
    expect(isCaster(mkChar('Fighter'))).toBe(false)
  })

  it('checks armor training for classes', () => {
    expect(hasArmorTraining(mkChar('Cleric'))).toBe(true)
    expect(hasArmorTraining(mkChar('Fighter'))).toBe(true)
    expect(hasArmorTraining(mkChar('Wizard'))).toBe(false)
  })

  it('filters moves by preferred categories', () => {
    const fighter = mkChar('Fighter')
    const moves = [
      { id: 'm1', category: 'basic' },
      { id: 'm2', category: 'class' },
      { id: 'm3', category: 'special' },
    ]
    const result = filterMovesByClass(fighter, moves)
    expect(result[0].id).toBe('m1')
    expect(result[1].id).toBe('m2')
  })

  it('applies equipment tag rules', () => {
    const druid = mkChar('Druid')
    expect(canUseTag(druid, 'metal')).toBe(false)
    const ranger = mkChar('Ranger')
    expect(canUseTag(ranger, 'far')).toBe(true)
  })
})
