import type { CharacterClass } from '../models/Character'
import type { Entity, EntityMention } from '../types/chronicle'

export interface LevelUpLogPayload {
  characterId: string
  characterName: string
  characterClass: CharacterClass
  levelBefore: number
  levelAfter: number
  xpSpent: number
  xpBefore: number
  xpAfter: number
  hpIncrease: number
  hpBefore: number
  hpAfter: number
  loadIncrease: number
  loadBefore: number
  loadAfter: number
  statIncreaseName?: string
  moveNames: string[]
  spellNames: string[]
}

export interface LevelUpLogOptions {
  includeNarrative?: boolean
}

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

/**
 * Record a level-up chronicle entry so it appears on the timeline.
 * This uses a dynamic import to avoid a circular dependency between stores.
 */
export async function logLevelUpEvent(
  payload: LevelUpLogPayload,
  options: LevelUpLogOptions = {},
): Promise<string | null> {
  try {
    const { useChronicleStore } = await import('../stores/chronicleStore')
    const chronicleStore = useChronicleStore.getState()

    const includeNarrative = options.includeNarrative ?? true

    const sessionId =
      chronicleStore.currentSessionId ?? 'solo-session--auto-generated'
    const campaignId = chronicleStore.currentCampaignId ?? undefined

    const baseSentence = `${payload.characterName} advanced from level ${payload.levelBefore} to level ${payload.levelAfter}.`

    const parts: string[] = [baseSentence]

    if (includeNarrative) {
      if (payload.statIncreaseName) {
        parts.push(
          `Raised ${payload.statIncreaseName.replace('Increase ', '')}.`,
        )
      }

      if (payload.moveNames.length > 0) {
        const moves = payload.moveNames.map((name) => `'${name}'`).join(', ')
        parts.push(
          `Learned new move${payload.moveNames.length > 1 ? 's' : ''} ${moves}.`,
        )
      }

      if (payload.spellNames.length > 0) {
        const spellList = payload.spellNames.map((name) => `'${name}'`).join(', ')
        parts.push(
          `Added spell${payload.spellNames.length > 1 ? 's' : ''} ${spellList}.`,
        )
      }

      parts.push(`Spent ${payload.xpSpent} XP (new total: ${payload.xpAfter}).`)

      if (payload.hpIncrease > 0) {
        parts.push(`Max HP increased by ${payload.hpIncrease}.`)
      }

      if (payload.loadIncrease > 0) {
        parts.push(`Max Load increased by ${payload.loadIncrease}.`)
      }
    } else {
      const summarySegments: string[] = []
      if (payload.statIncreaseName) {
        summarySegments.push(
          `Stat +${payload.statIncreaseName.replace('Increase ', '')}`,
        )
      }
      if (payload.moveNames.length > 0) {
        summarySegments.push(
          `Move${payload.moveNames.length > 1 ? 's' : ''}: ${payload.moveNames.join(', ')}`,
        )
      }
      if (payload.spellNames.length > 0) {
        summarySegments.push(
          `Spell${payload.spellNames.length > 1 ? 's' : ''}: ${payload.spellNames.join(', ')}`,
        )
      }

      summarySegments.push(
        `XP spent: ${payload.xpSpent} (to ${payload.xpAfter}).`,
      )

      if (summarySegments.length > 0) {
        parts.push(summarySegments.join(' '))
      }
    }

    const rawText = parts.join(' ').trim()

    const tags = [
      'level-up',
      `class:${payload.characterClass.toLowerCase()}`,
      `character:${payload.characterId}`,
      includeNarrative ? 'chronicle:detailed' : 'chronicle:summary',
    ]

    const ensureCharacterEntity = (): Entity | null => {
      const existing =
        chronicleStore.findEntityByName?.(
          payload.characterName,
          'character',
        ) ?? null

      if (existing) {
        return existing
      }

      if (!chronicleStore.addEntity) {
        return null
      }

      const entityId = chronicleStore.addEntity({
        name: payload.characterName,
        type: 'character',
        description: `${payload.characterClass} created from level-up`,
        firstMention: '',
        lastMention: '',
        appearances: [],
        relationships: [],
        aliases: [],
        status: 'active',
        tags: ['player'],
        importance: 1,
      })

      return chronicleStore.getEntity?.(entityId) ?? null
    }

    const characterEntity = ensureCharacterEntity()

    const mentionContext = rawText.slice(0, 160)
    const parsedEntities: EntityMention[] =
      characterEntity !== null
        ? [
            {
              entityId: characterEntity.id,
              mentionText: payload.characterName,
              startIndex: 0,
              endIndex: payload.characterName.length,
              confidence: 1,
              context: mentionContext,
            },
          ]
        : []

    const entryId = chronicleStore.addEntry({
      sessionId,
      campaignId,
      rawText,
      parsedEntities,
      tags,
      isSceneBreak: false,
    })

    if (characterEntity && chronicleStore.updateEntity) {
      const latestEntity = chronicleStore.getEntity?.(characterEntity.id)
      const appearances = Array.isArray(latestEntity?.appearances)
        ? [entryId, ...latestEntity!.appearances.filter((id) => id !== entryId)]
        : [entryId]
      chronicleStore.updateEntity(characterEntity.id, {
        firstMention: latestEntity?.firstMention ?? entryId,
        lastMention: entryId,
        appearances,
      })
    }

    if (chronicleStore.logResourceChange) {
      const timestamp = new Date().toISOString()
      chronicleStore.logResourceChange({
        id: generateId('resource-xp'),
        type: 'xp',
        bundleId: entryId,
        entryId,
        createdAt: timestamp,
        characterId: payload.characterId,
        amount: -payload.xpSpent,
        previous: payload.xpBefore,
        next: payload.xpAfter,
        reason: `Level up to ${payload.levelAfter}`,
      })

      if (
        payload.hpIncrease !== 0 &&
        Number.isFinite(payload.hpBefore) &&
        Number.isFinite(payload.hpAfter)
      ) {
        chronicleStore.logResourceChange({
          id: generateId('resource-hp'),
          type: 'hp',
          bundleId: entryId,
          entryId,
          createdAt: timestamp,
          characterId: payload.characterId,
          delta: payload.hpAfter - payload.hpBefore,
          previous: payload.hpBefore,
          next: payload.hpAfter,
          reason: `Level up to ${payload.levelAfter}`,
        })
      }

      if (
        payload.loadIncrease !== 0 &&
        Number.isFinite(payload.loadBefore) &&
        Number.isFinite(payload.loadAfter)
      ) {
        chronicleStore.logResourceChange({
          id: generateId('resource-load'),
          type: 'load',
          bundleId: entryId,
          entryId,
          createdAt: timestamp,
          characterId: payload.characterId,
          delta: payload.loadAfter - payload.loadBefore,
          previous: payload.loadBefore,
          next: payload.loadAfter,
          reason: `Level up to ${payload.levelAfter}`,
        })
      }
    }

    return entryId
  } catch (error) {
    console.error('Failed to record level-up chronicle entry', error)
    return null
  }
}
