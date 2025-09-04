import type { PanelMetadata } from '../framework/Panel'
import type { GameState } from '../models/GameState'
import { isCaster } from './conditionalContent'
import { getEffectivePrefs } from './preferences'

export function filterPanelsForCharacter(panels: PanelMetadata[], state: GameState): PanelMetadata[] {
  const character = state.activeCharacterId ? state.characters[state.activeCharacterId] : null
  const caster = isCaster(character as any)
  const effective = getEffectivePrefs(state.settings, caster)

  // If user prefers class-relevant but not show-all, hide irrelevant panels
  const preferRelevant = state.settings.conditionalContent?.global.preferClassRelevant !== false
  if (!preferRelevant) return panels

  return panels.filter((p) => {
    // Simple heuristic rules; can expand to mapping later
    if (p.id === 'spells') {
      return effective.statsShowSpells // show spells if effective indicates spells section visible
    }
    return true
  })
}


