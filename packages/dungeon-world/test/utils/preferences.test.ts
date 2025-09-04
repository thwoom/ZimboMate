import { describe, it, expect } from 'vitest'
import { getEffectivePrefs } from '../../src/utils/preferences'
import type { AppSettings } from '../../src/models/GameState'

function baseSettings(): AppSettings {
  return {
    theme: 'light',
    autoSave: true,
    autoSaveInterval: 5,
    showRollAnimations: true,
    confirmDangerousActions: true,
    keyboardShortcuts: {},
    conditionalContent: {
      global: {
        preferClassRelevant: true,
        showAllMoves: false,
        showAllEquipment: false,
        showSpellsForNonCasters: false,
      },
      perPanel: {
        moves: { overrideEnabled: false, showAll: false },
        equipment: { overrideEnabled: false, showAll: false },
        stats: { overrideEnabled: false, showSpells: false },
      }
    }
  }
}

describe('getEffectivePrefs', () => {
  it('prefers class relevant by default', () => {
    const ef = getEffectivePrefs(baseSettings(), false)
    expect(ef.movesShowAll).toBe(false)
    expect(ef.equipmentShowAll).toBe(false)
    expect(ef.statsShowSpells).toBe(false)
  })

  it('global toggles are applied', () => {
    const s = baseSettings()
    s.conditionalContent!.global.showAllMoves = true
    s.conditionalContent!.global.showAllEquipment = true
    s.conditionalContent!.global.showSpellsForNonCasters = true
    const ef = getEffectivePrefs(s, false)
    expect(ef.movesShowAll).toBe(true)
    expect(ef.equipmentShowAll).toBe(true)
    expect(ef.statsShowSpells).toBe(true)
  })

  it('panel override wins', () => {
    const s = baseSettings()
    s.conditionalContent!.perPanel.moves = { overrideEnabled: true, showAll: true }
    s.conditionalContent!.perPanel.equipment = { overrideEnabled: true, showAll: true }
    s.conditionalContent!.perPanel.stats = { overrideEnabled: true, showSpells: true }
    const ef = getEffectivePrefs(s, false)
    expect(ef.movesShowAll).toBe(true)
    expect(ef.equipmentShowAll).toBe(true)
    expect(ef.statsShowSpells).toBe(true)
  })
})


