import type { ChronicleDeltaLog } from '../../types/chronicle'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_DELTA_HISTORY,
  MAX_RESOURCE_HISTORY,
  useChronicleStore,
} from '../chronicleStore'

function makeLog(
  overrides: Partial<ChronicleDeltaLog> = {},
): ChronicleDeltaLog {
  return {
    bundleId: 'bundle-0',
    entryId: 'entry-0',
    appliedOps: [],
    skippedOps: [],
    createdAt: new Date('2025-10-02T00:00:00.000Z').toISOString(),
    ...overrides,
  }
}

beforeEach(() => {
  useChronicleStore.setState({
    deltaHistory: [],
    resourceHistory: { xp: {}, bonds: {}, hold: {}, debilities: {} },
  })
})

describe('chronicleStore delta history', () => {
  it('deduplicates bundles and trims to max history', () => {
    const { logDeltaResult } = useChronicleStore.getState()

    for (let index = 0; index < MAX_DELTA_HISTORY + 5; index += 1) {
      logDeltaResult(
        makeLog({
          bundleId: `bundle-${index}`,
          entryId: `entry-${index}`,
          createdAt: new Date(
            Date.UTC(2025, 9, 2, 0, 0, 0) + index * 1000,
          ).toISOString(),
        }),
      )
    }

    const history = useChronicleStore.getState().deltaHistory
    expect(history).toHaveLength(MAX_DELTA_HISTORY)
    expect(history[0].bundleId).toBe(`bundle-${MAX_DELTA_HISTORY + 4}`)
    expect(history[history.length - 1].bundleId).toBe('bundle-5')

    logDeltaResult(
      makeLog({
        bundleId: 'bundle-repeat',
        entryId: 'entry-first',
        createdAt: '2025-10-02T01:00:00.000Z',
      }),
    )

    logDeltaResult(
      makeLog({
        bundleId: 'bundle-repeat',
        entryId: 'entry-second',
        createdAt: '2025-10-02T01:00:01.000Z',
      }),
    )

    const [firstEntry, ...rest] = useChronicleStore.getState().deltaHistory
    expect(firstEntry.entryId).toBe('entry-second')
    expect(rest.some((entry) => entry.bundleId === 'bundle-repeat')).toBe(false)
  })

  it('clears specific bundle and wipes all when no id provided', () => {
    const store = useChronicleStore.getState()
    store.logDeltaResult(makeLog({ bundleId: 'bundle-a', entryId: 'A' }))
    store.logDeltaResult(makeLog({ bundleId: 'bundle-b', entryId: 'B' }))

    store.clearDeltaLog('bundle-a')
    const afterSpecific = useChronicleStore.getState().deltaHistory
    expect(afterSpecific.map((entry) => entry.bundleId)).toEqual(['bundle-b'])

    store.clearDeltaLog()
    expect(useChronicleStore.getState().deltaHistory).toHaveLength(0)
  })
})

describe('chronicleStore resource history', () => {
  it('logs xp history and trims to max', () => {
    const store = useChronicleStore.getState()

    for (let index = 0; index < MAX_RESOURCE_HISTORY + 3; index += 1) {
      store.logResourceChange({
        type: 'xp',
        id: `xp-${index}`,
        bundleId: `bundle-${index}`,
        entryId: `entry-${index}`,
        createdAt: new Date(
          Date.UTC(2025, 9, 2, 0, 0, 0) + index * 1000,
        ).toISOString(),
        characterId: 'hero',
        amount: 1,
        previous: index,
        next: index + 1,
        reason: 'test',
      })
    }

    const history = store.getXpHistory('hero')
    expect(history).toHaveLength(MAX_RESOURCE_HISTORY)
    expect(history[0].bundleId).toBe(`bundle-${MAX_RESOURCE_HISTORY + 2}`)
    expect(history[history.length - 1].bundleId).toBe('bundle-3')
  })

  it('removes entries for bundle across resource types', () => {
    const store = useChronicleStore.getState()

    store.logResourceChange({
      type: 'xp',
      id: 'xp-remove',
      bundleId: 'bundle-remove',
      entryId: 'entry-remove',
      createdAt: '2025-10-02T02:00:00.000Z',
      characterId: 'hero',
      amount: 2,
      previous: 5,
      next: 7,
      reason: 'bond_resolution',
    })
    store.logResourceChange({
      type: 'bond',
      id: 'bond-remove',
      bundleId: 'bundle-remove',
      entryId: 'entry-remove',
      createdAt: '2025-10-02T02:00:01.000Z',
      characterId: 'hero',
      bondId: 'bond-1',
      targetId: 'ally',
      text: 'I owe Ally everything.',
      action: 'resolve',
      resolved: true,
    })
    store.logResourceChange({
      type: 'hold',
      id: 'hold-remove',
      bundleId: 'bundle-remove',
      entryId: 'entry-remove',
      createdAt: '2025-10-02T02:00:02.000Z',
      characterId: 'hero',
      holdId: 'hold-1',
      moveId: 'defend',
      moveName: 'Defend',
      change: -1,
      remaining: 0,
    })
    store.logResourceChange({
      type: 'debility',
      id: 'debility-remove',
      bundleId: 'bundle-remove',
      entryId: 'entry-remove',
      createdAt: '2025-10-02T02:00:03.000Z',
      characterId: 'hero',
      debility: 'Shaky',
      action: 'add',
    })
    store.logResourceChange({
      type: 'xp',
      id: 'xp-keep',
      bundleId: 'bundle-keep',
      entryId: 'entry-keep',
      createdAt: '2025-10-02T03:00:00.000Z',
      characterId: 'hero',
      amount: 3,
      previous: 7,
      next: 10,
      reason: 'test',
    })

    store.removeResourceHistoryForBundle('bundle-remove')

    expect(store.getXpHistory('hero')).toEqual([
      expect.objectContaining({ bundleId: 'bundle-keep' }),
    ])
    expect(store.getBondHistory('hero')).toHaveLength(0)
    expect(store.getHoldHistory('hero')).toHaveLength(0)
    expect(store.getDebilityHistory('hero')).toHaveLength(0)
  })
})
