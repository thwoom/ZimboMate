import { beforeEach, describe, expect, it } from 'vitest'

import { useChronicleStore } from '@/stores/chronicleStore'
import { logLevelUpEvent } from '../LevelUpLogger'

const basePayload = {
  characterId: 'char-test',
  characterName: 'Aveline Storm',
  characterClass: 'Fighter' as const,
  levelBefore: 4,
  levelAfter: 5,
  xpSpent: 7,
  xpBefore: 12,
  xpAfter: 5,
  hpIncrease: 3,
  hpBefore: 22,
  hpAfter: 25,
  loadIncrease: 1,
  loadBefore: 12,
  loadAfter: 13,
  statIncreaseName: 'Increase STR',
  moveNames: ['Merciless'],
  spellNames: [] as string[],
}

describe('logLevelUpEvent', () => {
  beforeEach(() => {
    const store = useChronicleStore.getState()
    store.clearAll()
  })

  it('records a detailed chronicle entry when narrative logging is enabled', async () => {
    const entryId = await logLevelUpEvent(basePayload, {
      includeNarrative: true,
    })

    expect(entryId).toBeTruthy()

    const entry = entryId
      ? useChronicleStore.getState().getEntry(entryId)
      : null

    expect(entry?.rawText).toContain('advanced from level 4 to level 5')
    expect(entry?.rawText).toContain('Raised STR')
    expect(entry?.tags).toContain('chronicle:detailed')
    expect(entry?.tags).toContain('level-up')
    expect(entry?.parsedEntities?.[0]?.entityId).toBeTruthy()

    const chronicleState = useChronicleStore.getState()
    const entity = chronicleState.findEntityByName?.(
      basePayload.characterName,
      'character',
    )
    expect(entity).toBeTruthy()
    if (entry?.parsedEntities?.[0]?.entityId) {
      expect(entry.parsedEntities[0].entityId).toBe(entity?.id)
    }

    const xpHistory =
      chronicleState.resourceHistory.xp[basePayload.characterId] ?? []
    expect(xpHistory[0]?.amount).toBe(-basePayload.xpSpent)
    expect(xpHistory[0]?.next).toBe(basePayload.xpAfter)

    const hpHistory =
      chronicleState.resourceHistory.hp[basePayload.characterId] ?? []
    expect(hpHistory[0]?.delta).toBe(
      basePayload.hpAfter - basePayload.hpBefore,
    )
    expect(hpHistory[0]?.next).toBe(basePayload.hpAfter)

    const loadHistory =
      chronicleState.resourceHistory.load[basePayload.characterId] ?? []
    expect(loadHistory[0]?.delta).toBe(
      basePayload.loadAfter - basePayload.loadBefore,
    )
    expect(loadHistory[0]?.next).toBe(basePayload.loadAfter)
  })

  it('records a concise timeline entry when narrative logging is disabled', async () => {
    const entryId = await logLevelUpEvent(
      {
        ...basePayload,
        statIncreaseName: undefined,
        moveNames: [],
      },
      { includeNarrative: false },
    )

    expect(entryId).toBeTruthy()

    const entry = entryId
      ? useChronicleStore.getState().getEntry(entryId)
      : null

    expect(entry?.rawText).toContain('advanced from level 4 to level 5')
    expect(entry?.tags).toContain('chronicle:summary')
    expect(entry?.tags).toContain('level-up')
    expect(entry?.rawText).toContain('XP spent: 7')
    const chronicleState = useChronicleStore.getState()
    const xpHistory =
      chronicleState.resourceHistory.xp[basePayload.characterId] ?? []
    expect(xpHistory[0]?.amount).toBe(-basePayload.xpSpent)
    const hpHistory =
      chronicleState.resourceHistory.hp[basePayload.characterId] ?? []
    expect(hpHistory[0]?.delta).toBe(
      basePayload.hpAfter - basePayload.hpBefore,
    )
    const loadHistory =
      chronicleState.resourceHistory.load[basePayload.characterId] ?? []
    expect(loadHistory[0]?.delta).toBe(
      basePayload.loadAfter - basePayload.loadBefore,
    )
  })
})
