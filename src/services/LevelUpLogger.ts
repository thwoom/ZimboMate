import type { CharacterClass } from '../models/Character'
import type { EntityMention } from '../types/chronicle'

export interface LevelUpLogPayload {
  characterId: string
  characterName: string
  characterClass: CharacterClass
  levelBefore: number
  levelAfter: number
  xpSpent: number
  hpIncrease: number
  loadIncrease: number
  statIncreaseName?: string
  moveNames: string[]
  spellNames: string[]
}

/**
 * Attempt to persist a Chronicle entry describing the level-up.
 * This uses a dynamic import to avoid a circular dependency between stores.
 */
export async function logLevelUpEvent(
  payload: LevelUpLogPayload,
): Promise<void> {
  try {
    const { useChronicleStore } = await import('../stores/chronicleStore')
    const chronicleStore = useChronicleStore.getState()

    const sessionId =
      chronicleStore.currentSessionId ?? 'solo-session--auto-generated'
    const campaignId = chronicleStore.currentCampaignId ?? undefined

    const parts: string[] = [
      `${payload.characterName} advanced from level ${payload.levelBefore} to level ${payload.levelAfter}.`,
    ]

    if (payload.statIncreaseName) {
      parts.push(`Raised ${payload.statIncreaseName.replace('Increase ', '')}.`)
    }

    if (payload.moveNames.length > 0) {
      const moves = payload.moveNames.map((name) => `'${name}'`).join(', ')
      parts.push(`Learned new move${payload.moveNames.length > 1 ? 's' : ''} ${moves}.`)
    }

    if (payload.spellNames.length > 0) {
      const spellList = payload.spellNames.map((name) => `'${name}'`).join(', ')
      parts.push(`Added spell${payload.spellNames.length > 1 ? 's' : ''} ${spellList}.`)
    }

    parts.push(`Spent ${payload.xpSpent} XP.`);

    if (payload.hpIncrease > 0) {
      parts.push(`Max HP increased by ${payload.hpIncrease}.`)
    }

    if (payload.loadIncrease > 0) {
      parts.push(`Max Load increased by ${payload.loadIncrease}.`)
    }

    const parsedEntities: EntityMention[] = []

    chronicleStore.addEntry({
      sessionId,
      campaignId,
      rawText: parts.join(' '),
      parsedEntities,
      tags: ['level-up', payload.characterClass.toLowerCase()],
      isSceneBreak: false,
    })
  } catch (error) {
    console.error('Failed to record level-up chronicle entry', error)
  }
}
