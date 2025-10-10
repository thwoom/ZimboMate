import type {
  ChronicleBundleSnapshot,
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
    sessionCostCents: 0,
    lastCostEventAt: null,
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

    expect(useChronicleStore.getState().deltaHistory[0]).toMatchObject({
      bundleId: 'bundle-provisional',
      status: 'pending',
      autoApply: false,
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
      error: undefined,
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

  it('recordBundleFailure converts pending entry to failed log with audit trail', () => {
    const store = useChronicleStore.getState()
    store.beginBundleApply({
      entryId: 'entry-failure',
      autoApply: false,
      actor: 'auto',
      requestedAt: '2025-10-09T14:00:00.000Z',
      bundleId: 'bundle-failure-temp',
    })

    store.recordBundleFailure({
      bundleId: 'bundle-failure-temp',
      entryId: 'entry-failure',
      actor: 'auto',
      reason: 'Executor rejected operations',
      error: 'Test failure',
      occurredAt: '2025-10-09T14:00:01.000Z',
    })

    const [history] = useChronicleStore.getState().deltaHistory
    expect(history).toMatchObject({
      bundleId: 'bundle-failure-temp',
      entryId: 'entry-failure',
      status: 'failed',
      error: 'Test failure',
    })
    expect(useChronicleStore.getState().pendingDeltaBundle).toBeNull()
    const [audit] = useChronicleStore.getState().auditLog
    expect(audit).toMatchObject({
      bundleId: 'bundle-failure-temp',
      entryId: 'entry-failure',
      action: 'failed',
      reason: 'Executor rejected operations',
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
    store.recordAuditEvent({
      id: 'audit-bundle-clear',
      bundleId: 'bundle-clear',
      entryId: 'entry-clear',
      action: 'applied',
      actor: 'manual',
      timestamp: '2025-10-09T11:00:01.000Z',
      appliedOps: [],
      skippedOps: [],
    })

    store.logResourceChange({
      type: 'xp',
      id: 'xp-log-clear',
      bundleId: 'bundle-clear',
      entryId: 'entry-clear',
      createdAt: '2025-10-09T11:00:01.000Z',
      characterId: 'char-clear',
      amount: 1,
      previous: 0,
      next: 1,
      reason: 'test-clear',
    })

    expect(
      useChronicleStore
        .getState()
        .resourceHistory.xp['char-clear'],
    ).toHaveLength(1)
    expect(useChronicleStore.getState().auditLog[0]?.bundleId).toBe(
      'bundle-clear',
    )

    store.clearDeltaLog('bundle-clear')
    expect(useChronicleStore.getState().bundleSnapshots).toHaveLength(0)
    expect(
      useChronicleStore.getState().resourceHistory.xp['char-clear'],
    ).toBeUndefined()
    expect(
      useChronicleStore
        .getState()
        .auditLog.some((entry) => entry.bundleId === 'bundle-clear'),
    ).toBe(false)
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
    expect(useChronicleStore.getState().deltaHistory[0]).toMatchObject({
      entryId: 'entry-fail',
      status: 'pending',
    })

    store.endBundleApply()

    expect(useChronicleStore.getState().bundleSnapshots).toHaveLength(0)
    expect(useChronicleStore.getState().deltaHistory).toHaveLength(0)
  })

  it('clearAutomationHistory wipes all automation artifacts', () => {
    const store = useChronicleStore.getState()

    store.logDeltaResult(
      makeLog({
        bundleId: 'bundle-all',
        entryId: 'entry-all',
      }),
    )
    store.recordAuditEvent({
      id: 'audit-all',
      bundleId: 'bundle-all',
      entryId: 'entry-all',
      action: 'applied',
      actor: 'system',
      timestamp: '2025-10-09T12:00:00.000Z',
      appliedOps: [],
      skippedOps: [],
    })
    store.logResourceChange({
      type: 'coin',
      id: 'coin-log-all',
      bundleId: 'bundle-all',
      entryId: 'entry-all',
      createdAt: '2025-10-09T12:00:00.000Z',
      characterId: 'char-all',
      amount: 5,
      previous: 10,
      next: 15,
      reason: 'test',
    })
    store.recordBundleSnapshot({
      id: 'before-bundle-all',
      bundleId: 'bundle-all',
      entryId: 'entry-all',
      stage: 'before',
      capturedAt: '2025-10-09T11:59:59.000Z',
      actor: 'manual',
      autoApply: false,
      metrics: {
        totalCharacters: 0,
        characters: [],
        inventory: {
          totalItems: 0,
          totalEquipped: 0,
          totalQuickSlots: 0,
          equippedItemIds: [],
          quickSlotIds: [],
        },
        holds: [],
        totalHoldEntries: 0,
      },
    })

    expect(useChronicleStore.getState().deltaHistory).toHaveLength(1)
    expect(useChronicleStore.getState().auditLog).toHaveLength(1)
    expect(
      Object.keys(useChronicleStore.getState().resourceHistory.coin),
    ).toHaveLength(1)
    expect(useChronicleStore.getState().bundleSnapshots).toHaveLength(1)

    store.clearAutomationHistory()

    const state = useChronicleStore.getState()
    expect(state.deltaHistory).toHaveLength(0)
    expect(state.auditLog).toHaveLength(0)
    expect(Object.keys(state.resourceHistory.coin)).toHaveLength(0)
    expect(state.bundleSnapshots).toHaveLength(0)
    expect(state.pendingDeltaBundle).toBeNull()
  })

  it('getBundleSnapshots returns before and after snapshots for a bundle', () => {
    const store = useChronicleStore.getState()

    const beforeSnapshot: ChronicleBundleSnapshot = {
      id: 'before-bundle-test',
      bundleId: 'bundle-test',
      entryId: 'entry-test',
      stage: 'before',
      capturedAt: '2025-10-09T09:00:00.000Z',
      actor: 'auto',
      autoApply: true,
      metrics: {
        totalCharacters: 0,
        characters: [],
        inventory: {
          totalItems: 0,
          totalEquipped: 0,
          totalQuickSlots: 0,
          equippedItemIds: [],
          quickSlotIds: [],
        },
        holds: [],
        totalHoldEntries: 0,
      },
    }

    const afterSnapshot: ChronicleBundleSnapshot = {
      ...beforeSnapshot,
      id: 'after-bundle-test',
      stage: 'after',
      capturedAt: '2025-10-09T09:00:01.000Z',
    }

    store.recordBundleSnapshot(beforeSnapshot)
    store.recordBundleSnapshot(afterSnapshot)

    const snapshots = useChronicleStore.getState().getBundleSnapshots('bundle-test')
    expect(snapshots.before?.id).toBe('before-bundle-test')
    expect(snapshots.after?.id).toBe('after-bundle-test')

    const exportPayload =
      useChronicleStore.getState().exportBundleSnapshots('bundle-test')
    expect(exportPayload).not.toBeNull()
    const parsed = JSON.parse(exportPayload as string)
    expect(parsed.bundleId).toBe('bundle-test')
    expect(parsed.before.id).toBe('before-bundle-test')
    expect(parsed.after.id).toBe('after-bundle-test')
  })

  it('getAutomationHistory supports limiting results', () => {
    const store = useChronicleStore.getState()
    for (let index = 0; index < 3; index += 1) {
      store.logDeltaResult(
        makeLog({
          bundleId: `bundle-hist-${index}`,
          entryId: `entry-hist-${index}`,
          createdAt: new Date(Date.UTC(2025, 9, 9, 10, 0, index)).toISOString(),
        }),
      )
    }

    const history = useChronicleStore.getState().getAutomationHistory(2)
    expect(history).toHaveLength(2)
    expect(history[0].bundleId).toBe('bundle-hist-2')
    expect(history[1].bundleId).toBe('bundle-hist-1')
  })

  it('tracks and resets session cost', () => {
    const {
      recordSessionCost,
      resetSessionCost,
      sessionCostCents: initialCost,
    } = useChronicleStore.getState()

    expect(initialCost).toBe(0)
    recordSessionCost(25, '2025-10-09T10:00:00.000Z')
    recordSessionCost(15.5)

    const afterRecord = useChronicleStore.getState()
    expect(afterRecord.sessionCostCents).toBe(41)
    expect(afterRecord.lastCostEventAt).not.toBeNull()

    resetSessionCost()

    const afterReset = useChronicleStore.getState()
    expect(afterReset.sessionCostCents).toBe(0)
    expect(afterReset.lastCostEventAt).toBeNull()
  })
})
