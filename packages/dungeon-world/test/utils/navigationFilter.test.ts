import { describe, it, expect } from 'vitest'
import { filterPanelsForCharacter } from '../../src/utils/navigationFilter'

const panels = [
  { id: 'character-stats', name: 'Character Stats', icon: '👤', priority: 1 },
  { id: 'equipment', name: 'Equipment', icon: '⚔️', priority: 2 },
  { id: 'moves', name: 'Moves', icon: '📜', priority: 3 },
  { id: 'spells', name: 'Spells', icon: '✨', priority: 4 },
] as any

function baseState(): any {
  return {
    characters: {
      c1: {
        id: 'c1', name: 'Aria', class: 'Wizard', attributes: { STR: 8, DEX: 12, CON: 9, INT: 16, WIS: 13, CHA: 10 },
        debilities: { weak: false, shaky: false, sick: false, stunned: false, confused: false, scarred: false },
        hp: { current: 7, max: 7 }, armor: 0, damageDie: 'd4', xp: 0,
        load: { current: 0, max: 7 }, baseLoad: 7, coin: 0, bonds: [], advancements: [], knownMoves: [], conditions: [],
        createdAt: new Date(), updatedAt: new Date()
      }
    },
    activeCharacterId: 'c1',
    settings: {
      theme: 'light', autoSave: true, autoSaveInterval: 5, showRollAnimations: true, confirmDangerousActions: true, keyboardShortcuts: {},
      conditionalContent: {
        global: { preferClassRelevant: true, showAllMoves: false, showAllEquipment: false, showSpellsForNonCasters: false },
        perPanel: { moves: { overrideEnabled: false, showAll: false }, equipment: { overrideEnabled: false, showAll: false }, stats: { overrideEnabled: false, showSpells: false } }
      }
    }
  }
}

describe('navigationFilter', () => {
  it('shows spells panel for casters when effective spells are visible', () => {
    const state = baseState()
    const filtered = filterPanelsForCharacter(panels, state)
    expect(filtered.some((p: any) => p.id === 'spells')).toBe(true)
  })

  it('hides spells panel for non-casters when not overridden', () => {
    const state = baseState()
    state.characters.c1.class = 'Fighter'
    const filtered = filterPanelsForCharacter(panels, state)
    expect(filtered.some((p: any) => p.id === 'spells')).toBe(false)
  })
})


