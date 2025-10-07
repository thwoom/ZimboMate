import type { ChronicleDeltaLog } from '../../types/chronicle'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_AUDIT_LOG_ENTRIES,
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
    auditLog: [],
    pendingDeltaBundle: null,
    resourceHistory: {
      xp: {},
      bonds: {},
      hold: {},
      debilities: {},
      hp: {},
      coin: {},
    },
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
      type: 'hp',
      id: 'hp-remove',
      bundleId: 'bundle-remove',
      entryId: 'entry-remove',
      createdAt: '2025-10-02T02:00:04.000Z',
      characterId: 'hero',
      delta: -2,
      previous: 10,
      next: 8,
      reason: 'harm',
    })
    store.logResourceChange({
      type: 'coin',
      id: 'coin-remove',
      bundleId: 'bundle-remove',
      entryId: 'entry-remove',
      createdAt: '2025-10-02T02:00:05.000Z',
      characterId: 'hero',
      amount: -5,
      previous: 20,
      next: 15,
    })
    store.logResourceChange({
      type: 'coin',
      id: 'coin-keep',
      bundleId: 'bundle-keep',
      entryId: 'entry-keep',
      createdAt: '2025-10-02T03:00:01.000Z',
      characterId: 'hero',
      amount: 3,
      previous: 15,
      next: 18,
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

    const updatedState = useChronicleStore.getState()
    expect(updatedState.resourceHistory.hp.hero).toBeUndefined()
    expect(updatedState.resourceHistory.coin.hero).toEqual([
      expect.objectContaining({ bundleId: 'bundle-keep' }),
    ])
  })
})

describe('chronicleStore pending bundle and audit log', () => {
  it('sets, updates, and clears pending bundle state', () => {
    const store = useChronicleStore.getState()

    store.setPendingDeltaBundle({
      entryId: 'entry-42',
      requestedAt: '2025-10-07T10:00:00.000Z',
      autoApply: true,
    })

    expect(useChronicleStore.getState().pendingDeltaBundle).toEqual({
      entryId: 'entry-42',
      requestedAt: '2025-10-07T10:00:00.000Z',
      autoApply: true,
    })

    store.setPendingDeltaBundle({
      entryId: 'entry-42',
      requestedAt: '2025-10-07T10:00:00.000Z',
      autoApply: true,
      bundleId: 'bundle-final',
    })

    expect(useChronicleStore.getState().pendingDeltaBundle).toEqual({
      entryId: 'entry-42',
      requestedAt: '2025-10-07T10:00:00.000Z',
      autoApply: true,
      bundleId: 'bundle-final',
    })

    store.setPendingDeltaBundle(null)
    expect(useChronicleStore.getState().pendingDeltaBundle).toBeNull()
  })

  it('records audit events with most recent first and trims to max size', () => {
    const { recordAuditEvent } = useChronicleStore.getState()

    recordAuditEvent({
      id: 'audit-duplicate',
      bundleId: 'bundle-x',
      entryId: 'entry-x',
      action: 'applied',
      timestamp: '2025-10-07T12:00:00.000Z',
    })

    recordAuditEvent({
      id: 'audit-duplicate',
      bundleId: 'bundle-x',
      entryId: 'entry-x',
      action: 'applied',
      timestamp: '2025-10-07T12:01:00.000Z',
      reason: 'overwritten',
    })

    const [latestDuplicate] = useChronicleStore.getState().auditLog
    expect(latestDuplicate.reason).toBe('overwritten')

    for (let index = 0; index < MAX_AUDIT_LOG_ENTRIES + 5; index += 1) {
      recordAuditEvent({
        id: `audit-${index}`,
        bundleId: `bundle-${index}`,
        entryId: `entry-${index}`,
        action: index % 2 === 0 ? 'applied' : 'undone',
        timestamp: new Date(
          Date.UTC(2025, 9, 7, 0, 0, 0) + index * 1000,
        ).toISOString(),
      })
    }

    const auditLog = useChronicleStore.getState().auditLog
    expect(auditLog).toHaveLength(MAX_AUDIT_LOG_ENTRIES)
    expect(auditLog[0].id).toBe(`audit-${MAX_AUDIT_LOG_ENTRIES + 4}`)
    expect(auditLog.some((entry) => entry.id === 'audit-duplicate')).toBe(false)
  })

  it('clears audit log by bundle id or entirely', () => {
    const store = useChronicleStore.getState()

    store.recordAuditEvent({
      id: 'audit-a',
      bundleId: 'bundle-a',
      entryId: 'entry-a',
      action: 'applied',
      timestamp: '2025-10-07T12:10:00.000Z',
    })
    store.recordAuditEvent({
      id: 'audit-b',
      bundleId: 'bundle-b',
      entryId: 'entry-b',
      action: 'undone',
      timestamp: '2025-10-07T12:11:00.000Z',
    })

    store.clearAuditLog('bundle-a')
    expect(useChronicleStore.getState().auditLog.map((entry) => entry.id)).toEqual([
      'audit-b',
    ])

    store.clearAuditLog()
    expect(useChronicleStore.getState().auditLog).toHaveLength(0)
  })
})
