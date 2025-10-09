import type {
  ChronicleDeltaLog,
  Entity,
  Relationship,
} from '../../types/chronicle'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  MAX_AUDIT_LOG_ENTRIES,
  MAX_DELTA_HISTORY,
  MAX_RESOURCE_HISTORY,
  useChronicleStore,
} from '../chronicleStore'
import { useCharacterStore } from '../characterStore'
import { useHoldStore } from '../holdStore'
import { useInventoryStore } from '../inventoryStore'

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

function makeEntity(
  id: string,
  overrides: Partial<Entity> = {},
): Entity {
  const timestamp = new Date('2025-10-08T00:00:00.000Z')
  return {
    id,
    name: `Entity ${id}`,
    type: 'character',
    description: '',
    firstMention: 'entry-0',
    lastMention: 'entry-0',
    appearances: [],
    relationships: [],
    aliases: [],
    status: 'active',
    tags: [],
    importance: 0,
    createdAt: timestamp,
    lastUpdated: timestamp,
    userNotes: '',
    ...overrides,
  }
}

function makeRelationship(
  id: string,
  fromEntityId: string,
  toEntityId: string,
  type: Relationship['type'],
  overrides: Partial<Relationship> = {},
): Relationship {
  const timestamp = new Date('2025-10-08T00:00:00.000Z')
  return {
    id,
    fromEntityId,
    toEntityId,
    type,
    strength: 1,
    description: '',
    history: [],
    currentStatus: 'active',
    confidence: 1,
    createdAt: timestamp,
    lastUpdated: timestamp,
    ...overrides,
  }
}

beforeEach(() => {
  useChronicleStore.setState({
    deltaHistory: [],
    auditLog: [],
    pendingDeltaBundle: null,
    bundleSnapshots: [],
    resourceHistory: {
      xp: {},
      bonds: {},
      hold: {},
      debilities: {},
      hp: {},
      coin: {},
    },
    entities: [],
    relationships: [],
  })

  useCharacterStore.setState({
    characters: [],
    activeCharacterId: null,
  })
  useInventoryStore.setState({ inventory: null })
  useHoldStore.setState({ characterHolds: {} })
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
    expect(firstEntry.status).toBe('applied')
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

  it('finishBundleApply records history and audit entries', () => {
    const store = useChronicleStore.getState()

    store.beginBundleApply({
      entryId: 'entry-apply',
      requestedAt: '2025-10-09T10:00:00.000Z',
      autoApply: false,
      actor: 'manual',
      bundleId: 'bundle-provisional',
      startedAt: '2025-10-09T10:00:00.000Z',
    })

    store.finishBundleApply({
      bundleId: 'bundle-final',
      entryId: 'entry-apply',
      appliedOps: [],
      skippedOps: [],
      actor: 'manual',
      undoHandle: { bundleId: 'bundle-final', issuedAt: '2025-10-09T10:00:01.000Z' },
      requestedAt: '2025-10-09T10:00:00.000Z',
      completedAt: '2025-10-09T10:00:01.500Z',
      autoApply: false,
      durationMs: 1500,
    })

    const state = useChronicleStore.getState()
    expect(state.pendingDeltaBundle).toBeNull()
    const [firstHistory] = state.deltaHistory
    expect(firstHistory).toMatchObject({
      bundleId: 'bundle-final',
      entryId: 'entry-apply',
      status: 'applied',
      requestedAt: '2025-10-09T10:00:00.000Z',
      autoApply: false,
      durationMs: 1500,
    })
    expect(firstHistory.undoHandle?.bundleId).toBe('bundle-final')
    const [firstAudit] = state.auditLog
    expect(firstAudit).toMatchObject({
      bundleId: 'bundle-final',
      entryId: 'entry-apply',
      action: 'applied',
      actor: 'manual',
    })

    expect(state.bundleSnapshots.length).toBeGreaterThanOrEqual(2)
    const snapshotStages = state.bundleSnapshots.map((snapshot) => snapshot.stage)
    expect(snapshotStages).toContain('before')
    expect(snapshotStages).toContain('after')
    expect(
      state.bundleSnapshots.every(
        (snapshot) => snapshot.bundleId === 'bundle-final',
      ),
    ).toBe(true)
  })

  it('markBundleUndo updates history status and prepends audit entry', () => {
    const store = useChronicleStore.getState()

    store.logDeltaResult(makeLog({ bundleId: 'bundle-a', entryId: 'entry-a' }))
    store.logDeltaResult(
      makeLog({
        bundleId: 'bundle-b',
        entryId: 'entry-b',
        createdAt: '2025-10-09T09:59:59.000Z',
      }),
    )

    store.markBundleUndo({
      bundleId: 'bundle-a',
      entryId: 'entry-a',
      actor: 'user',
      timestamp: '2025-10-09T10:05:00.000Z',
      appliedOps: [],
      skippedOps: [],
    })

    const [firstHistory] = useChronicleStore.getState().deltaHistory
    expect(firstHistory.bundleId).toBe('bundle-a')
    expect(firstHistory.status).toBe('undone')
    expect(firstHistory.undoActor).toBe('user')
    expect(firstHistory.undoneAt).toBe('2025-10-09T10:05:00.000Z')

    const [firstAudit] = useChronicleStore.getState().auditLog
    expect(firstAudit).toMatchObject({
      bundleId: 'bundle-a',
      entryId: 'entry-a',
      action: 'undone',
      actor: 'user',
    })
  })

  it('clearDeltaLog removes associated bundle snapshots', () => {
    const store = useChronicleStore.getState()

    store.beginBundleApply({
      entryId: 'entry-clear',
      requestedAt: '2025-10-09T11:00:00.000Z',
      autoApply: false,
      actor: 'manual',
    })

    store.finishBundleApply({
      bundleId: 'bundle-clear',
      entryId: 'entry-clear',
      appliedOps: [],
      skippedOps: [],
      actor: 'manual',
      undoHandle: { bundleId: 'bundle-clear', issuedAt: '2025-10-09T11:00:01.000Z' },
      requestedAt: '2025-10-09T11:00:00.000Z',
      completedAt: '2025-10-09T11:00:01.000Z',
      autoApply: false,
      durationMs: 1000,
    })

    expect(useChronicleStore.getState().bundleSnapshots).not.toHaveLength(0)

    store.clearDeltaLog('bundle-clear')
    expect(useChronicleStore.getState().bundleSnapshots).toHaveLength(0)
  })

  it('endBundleApply removes pending snapshots when no bundle is applied', () => {
    const store = useChronicleStore.getState()

    store.beginBundleApply({
      entryId: 'entry-fail',
      requestedAt: '2025-10-09T12:00:00.000Z',
      autoApply: false,
      actor: 'manual',
    })

    expect(useChronicleStore.getState().bundleSnapshots).toHaveLength(1)

    store.endBundleApply()

    expect(useChronicleStore.getState().bundleSnapshots).toHaveLength(0)
  })
})
