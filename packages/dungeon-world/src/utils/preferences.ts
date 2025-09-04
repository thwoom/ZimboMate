import type { AppSettings } from '../models/GameState'

export interface EffectivePrefs {
  movesShowAll: boolean
  equipmentShowAll: boolean
  statsShowSpells: boolean
}

export function getEffectivePrefs(settings: AppSettings, isCaster: boolean): EffectivePrefs {
  const cc = settings.conditionalContent
  if (!cc) {
    return {
      movesShowAll: false,
      equipmentShowAll: false,
      statsShowSpells: isCaster,
    }
  }
  const { global, perPanel } = cc

  const movesShowAll = perPanel.moves.overrideEnabled
    ? perPanel.moves.showAll
    : (!global.preferClassRelevant || global.showAllMoves)

  const equipmentShowAll = perPanel.equipment.overrideEnabled
    ? perPanel.equipment.showAll
    : (!global.preferClassRelevant || global.showAllEquipment)

  const statsShowSpells = perPanel.stats.overrideEnabled
    ? perPanel.stats.showSpells
    : (!global.preferClassRelevant ? true : (global.showSpellsForNonCasters ? true : isCaster))

  return { movesShowAll, equipmentShowAll, statsShowSpells }
}

export function togglePanelOverride(settings: AppSettings, panel: 'moves' | 'equipment' | 'stats'): AppSettings {
  const next = { ...settings, conditionalContent: { ...settings.conditionalContent! } }
  next.conditionalContent!.perPanel = { ...next.conditionalContent!.perPanel }
  // @ts-expect-error index panel
  const p = { ...next.conditionalContent!.perPanel[panel] }
  p.overrideEnabled = !p.overrideEnabled
  // @ts-expect-error index panel
  next.conditionalContent!.perPanel[panel] = p
  return next
}

export function setPanelShowAll(settings: AppSettings, panel: 'moves' | 'equipment', showAll: boolean): AppSettings {
  const next = { ...settings, conditionalContent: { ...settings.conditionalContent! } }
  next.conditionalContent!.perPanel = { ...next.conditionalContent!.perPanel }
  // @ts-expect-error index panel
  const p = { ...next.conditionalContent!.perPanel[panel], showAll }
  // @ts-expect-error index panel
  next.conditionalContent!.perPanel[panel] = p
  return next
}

export function setStatsShowSpells(settings: AppSettings, show: boolean): AppSettings {
  const next = { ...settings, conditionalContent: { ...settings.conditionalContent! } }
  next.conditionalContent!.perPanel = { ...next.conditionalContent!.perPanel }
  const p = { ...next.conditionalContent!.perPanel.stats, showSpells: show }
  next.conditionalContent!.perPanel.stats = p
  return next
}


