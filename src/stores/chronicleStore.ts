/**
 * Chronicle Store - Zustand state management for Chronicle system
 * Handles all chronicle entries, entities, relationships, and wiki pages
 */

import type {
  BondLogEntry,
  ChronicleAuditEntry,
  ChronicleDeltaLog,
  ChronicleEntry,
  ChronicleSearchResult,
  ChronicleSettings,
  ChronicleBundleSnapshot,
  DebilityLogEntry,
  Entity,
  EntityType,
  HoldLogEntry,
  NarrativeThread,
  PendingChronicleBundle,
  Relationship,
  ResourceHistoryState,
  ResourceLogEntry,
  WikiFact,
  WikiPage,
  WikiTimelineEntry,
  XpLogEntry,
} from '../types/chronicle'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCharacterStore } from './characterStore'
import { useHoldStore } from './holdStore'
import { useInventoryStore } from './inventoryStore'

type BundleActor = NonNullable<ChronicleDeltaLog['actor']>

interface BeginBundleApplyPayload {
  entryId: string
  requestedAt: string
  autoApply: boolean
  actor: BundleActor
  bundleId?: string
  startedAt?: string
}

interface FinishBundleApplyPayload {
  bundleId: string
  entryId: string
  appliedOps: ChronicleDeltaLog['appliedOps']
  skippedOps: ChronicleDeltaLog['skippedOps']
  actor: BundleActor
  undoHandle?: ChronicleDeltaLog['undoHandle']
  completedAt?: string
  requestedAt?: string
  autoApply?: boolean
  durationMs?: number
}

interface BundleUndoPayload {
  bundleId: string
  entryId: string
  actor: BundleActor
  timestamp?: string
  appliedOps: ChronicleDeltaLog['appliedOps']
  skippedOps: ChronicleDeltaLog['skippedOps']
}

interface BundleFailurePayload {
  bundleId: string
  entryId: string
  actor: BundleActor
  reason?: string
  error?: string
  occurredAt?: string
}

interface ChronicleState {
  // Core data
  entries: ChronicleEntry[]
  entities: Entity[]
  relationships: Relationship[]
  wikiPages: WikiPage[]
  narrativeThreads: NarrativeThread[]

  // Current session
  currentSessionId: string | null
  currentCampaignId: string | null

  // Settings
  settings: ChronicleSettings

  // UI State
  selectedEntity: string | null
  searchQuery: string
  isWriting: boolean

  // Automation Logs
  deltaHistory: ChronicleDeltaLog[]
  logDeltaResult: (log: ChronicleDeltaLog) => void
  clearAutomationHistory: (bundleId?: string) => void
  clearDeltaLog: (bundleId?: string) => void
  getDeltaLog: (bundleId: string) => ChronicleDeltaLog | undefined
  getAutomationHistory: (limit?: number) => ChronicleDeltaLog[]
  pendingDeltaBundle: PendingChronicleBundle | null
  setPendingDeltaBundle: (pending: PendingChronicleBundle | null) => void
  beginBundleApply: (payload: BeginBundleApplyPayload) => void
  finishBundleApply: (payload: FinishBundleApplyPayload) => void
  endBundleApply: (options?: { preserveSnapshots?: boolean }) => void
  markBundleUndo: (payload: BundleUndoPayload) => void
  recordBundleFailure: (payload: BundleFailurePayload) => void
  auditLog: ChronicleAuditEntry[]
  recordAuditEvent: (entry: ChronicleAuditEntry) => void
  clearAuditLog: (bundleId?: string) => void
  bundleSnapshots: ChronicleBundleSnapshot[]
  recordBundleSnapshot: (
    snapshot: ChronicleBundleSnapshot,
    previousBundleId?: string | null,
  ) => void
  getBundleSnapshots: (
    bundleId: string,
  ) => { before: ChronicleBundleSnapshot | null; after: ChronicleBundleSnapshot | null }
  exportBundleSnapshots: (bundleId: string) => string | null
  clearBundleSnapshots: (bundleId?: string) => void
  resourceHistory: ResourceHistoryState
  logResourceChange: (entry: ResourceLogEntry) => void
  removeResourceHistoryForBundle: (bundleId: string) => void
  getXpHistory: (characterId: string) => XpLogEntry[]
  getBondHistory: (characterId: string) => BondLogEntry[]
  getHoldHistory: (characterId: string) => HoldLogEntry[]
  getDebilityHistory: (characterId: string) => DebilityLogEntry[]

  // Actions - Chronicle Entries
  addEntry: (entry: Omit<ChronicleEntry, 'id'>) => string
  updateEntry: (id: string, updates: Partial<ChronicleEntry>) => void
  deleteEntry: (id: string) => void
  getEntry: (id: string) => ChronicleEntry | undefined
  getEntriesBySession: (sessionId: string) => ChronicleEntry[]

  // Actions - Entities
  addEntity: (
    entity: Omit<Entity, 'id' | 'createdAt' | 'lastUpdated'>,
  ) => string
  updateEntity: (id: string, updates: Partial<Entity>) => void
  deleteEntity: (id: string) => void
  getEntity: (id: string) => Entity | undefined
  getEntitiesByType: (type: EntityType) => Entity[]
  findEntityByName: (name: string, type?: EntityType) => Entity | undefined

  // Actions - Relationships
  addRelationship: (
    relationship: Omit<Relationship, 'id' | 'createdAt' | 'lastUpdated'>,
  ) => string
  updateRelationship: (id: string, updates: Partial<Relationship>) => void
  deleteRelationship: (id: string) => void
  getRelationship: (id: string) => Relationship | undefined
  getEntityRelationships: (entityId: string) => Relationship[]
  getLinkedEntities: (entityId: string) => EntityLinkEdge[]
  getRelationshipBetweenEntities: (
    entityA: string,
    entityB: string,
  ) => Relationship | undefined

  // Actions - Wiki Pages
  generateWikiPage: (entityId: string) => void
  updateWikiPage: (entityId: string, updates: Partial<WikiPage>) => void
  getWikiPage: (entityId: string) => WikiPage | undefined
  incrementWikiView: (entityId: string) => void

  // Actions - Search
  searchAll: (query: string) => ChronicleSearchResult[]
  searchEntries: (query: string) => ChronicleEntry[]
  searchEntities: (query: string) => Entity[]

  // Actions - Session Management
  startSession: (campaignId?: string) => string
  endSession: () => void
  getCurrentSession: () => ChronicleEntry[]

  // Actions - Utility
  clearAll: () => void
  exportData: () => string
  importData: (data: string) => void
  updateSettings: (settings: Partial<ChronicleSettings>) => void
  sessionCostCents: number
  lastCostEventAt: string | null
  recordSessionCost: (costCents: number, timestamp?: string) => void
  resetSessionCost: () => void
}

// Default settings
export const MAX_DELTA_HISTORY = 50
export const MAX_RESOURCE_HISTORY = 100
export const MAX_AUDIT_LOG_ENTRIES = 40
export const MAX_BUNDLE_SNAPSHOTS = 20
const MAX_SNAPSHOT_CHARACTERS = 10
const MAX_SNAPSHOT_ITEM_IDS = 12
const MAX_SNAPSHOT_HOLD_ENTRIES = 20

interface SnapshotMetricsCache {
  charactersRef: ReturnType<typeof useCharacterStore.getState>['characters']
  inventoryRef: ReturnType<typeof useInventoryStore.getState>['inventory']
  holdsRef: ReturnType<typeof useHoldStore.getState>['characterHolds']
  metrics: ChronicleBundleSnapshot['metrics']
}

let lastSnapshotCache: SnapshotMetricsCache | null = null

function getTimestamp(value: Date | string | undefined): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function createResourceHistory(): ResourceHistoryState {
  return {
    xp: {},
    bonds: {},
    hold: {},
    debilities: {},
    hp: {},
    coin: {},
  }
}

function prependEntry<T>(entries: T[], entry: T): T[] {
  return [entry, ...entries].slice(0, MAX_RESOURCE_HISTORY)
}

function pruneRecord<T extends { bundleId: string }>(
  record: Record<string, T[]>,
  bundleId: string,
): Record<string, T[]> {
  const next: Record<string, T[]> = {}
  for (const [key, entries] of Object.entries(record)) {
    const filtered = entries.filter((entry) => entry.bundleId !== bundleId)
    if (filtered.length > 0) next[key] = filtered
  }
  return next
}

function collectSnapshotMetrics(): ChronicleBundleSnapshot['metrics'] {
  const characterState = useCharacterStore.getState()
  const inventoryState = useInventoryStore.getState()
  const holdState = useHoldStore.getState()

  const charactersRef = characterState.characters
  const inventoryRef = inventoryState.inventory
  const holdsRef = holdState.characterHolds

  if (
    lastSnapshotCache &&
    lastSnapshotCache.charactersRef === charactersRef &&
    lastSnapshotCache.inventoryRef === inventoryRef &&
    lastSnapshotCache.holdsRef === holdsRef
  ) {
    return lastSnapshotCache.metrics
  }

  const sortedCharacters = [...charactersRef].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  const characterSummaries = sortedCharacters.slice(0, MAX_SNAPSHOT_CHARACTERS).map(
    (character) => ({
      id: character.id,
      name: character.name,
      hp: {
        current: character.hp?.current ?? 0,
        max: character.hp?.max ?? 0,
      },
      xp: character.xp ?? 0,
      coin: character.coin ?? 0,
    }),
  )

  const totalItems = inventoryRef ? Object.keys(inventoryRef.items ?? {}).length : 0
  const equippedContainer = inventoryRef?.containers.find(
    (container) => container.id === 'equipped',
  )
  const equippedItemIds = equippedContainer ? [...equippedContainer.items] : []
  const quickSlotIds = inventoryRef?.quickSlots ?? []

  const holdEntries = Object.entries(holdsRef ?? {}).flatMap(
    ([characterId, holds]) =>
      holds.map((hold) => ({
        characterId,
        holdId: hold.id,
        moveId: hold.moveId,
        moveName: hold.moveName,
        amount: hold.amount,
        maxAmount: hold.maxAmount,
      })),
  )

  holdEntries.sort((a, b) => {
    const characterCompare = a.characterId.localeCompare(b.characterId)
    if (characterCompare !== 0) return characterCompare
    return a.moveName.localeCompare(b.moveName)
  })

  const truncatedHoldEntries = holdEntries.slice(0, MAX_SNAPSHOT_HOLD_ENTRIES)

  const metrics: ChronicleBundleSnapshot['metrics'] = {
    totalCharacters: charactersRef.length,
    characters: characterSummaries,
    inventory: {
      totalItems,
      equippedItemIds: equippedItemIds.slice(0, MAX_SNAPSHOT_ITEM_IDS),
      quickSlotIds: quickSlotIds.slice(0, MAX_SNAPSHOT_ITEM_IDS),
      totalEquipped: equippedItemIds.length,
      totalQuickSlots: quickSlotIds.length,
    },
    holds: truncatedHoldEntries,
    totalHoldEntries: holdEntries.length,
  }

  lastSnapshotCache = {
    charactersRef,
    inventoryRef,
    holdsRef,
    metrics,
  }

  return metrics
}

function createBundleSnapshot(
  stage: 'before' | 'after',
  payload: {
    bundleId: string
    entryId: string
    actor: BundleActor
    autoApply: boolean
  },
): ChronicleBundleSnapshot {
  const capturedAt = new Date().toISOString()
  return {
    id: `${stage}-${payload.bundleId}-${capturedAt}`,
    bundleId: payload.bundleId,
    entryId: payload.entryId,
    stage,
    capturedAt,
    actor: payload.actor,
    autoApply: payload.autoApply,
    metrics: collectSnapshotMetrics(),
  }
}

const defaultSettings: ChronicleSettings = {
  autoEntityCreation: true,
  minimumConfidenceForAutoCreation: 0.7,
  enableVoiceInput: false,
  enableSmartSuggestions: true,
  parseOnType: true,
  defaultEntityTypes: ['character', 'location', 'item', 'event'],
  customTags: [],
  autoApplyPolicy: {
    apply_damage: 'confirm',
    heal: 'confirm',
    mark_xp: 'auto',
    add_item: 'confirm',
    spend_ammo: 'auto',
    mark_hold: 'auto',
    spend_hold: 'auto',
  },
  tone: 'heroic',
  verbosity: 'standard',
  autoEquipWeapons: false,
}

// Helper function to generate IDs
function generateId(prefix: string = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// Helper function to calculate entity importance
function calculateEntityImportance(
  entity: Entity,
  entries: ChronicleEntry[],
): number {
  // Factor in: mention frequency, recency, user bookmarking
  const mentionCount = entity.appearances.length
  const recentMentions = entity.appearances.filter((entryId) => {
    const entry = entries.find((e) => e.id === entryId)
    if (!entry) return false
    const daysSince =
      (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince < 30 // Recent = within 30 days
  }).length

  // Weight: 40% total mentions, 40% recent mentions, 20% type importance
  const typeWeight =
    entity.type === 'character' ? 1.2 : entity.type === 'location' ? 1.1 : 1.0
  const importance = Math.min(
    100,
    mentionCount * 0.4 + recentMentions * 0.4 + typeWeight * 20,
  )

  return Math.round(importance)
}

export interface EntityLinkEdge {
  relationship: Relationship
  otherEntityId: string
  entity?: Entity
}

// Helper function to extract key facts from chronicle entries
function extractKeyFacts(
  entity: Entity,
  entries: ChronicleEntry[],
): WikiFact[] {
  const relevantEntries = entries.filter((entry) =>
    entry.parsedEntities.some((mention) => mention.entityId === entity.id),
  )

  const facts: WikiFact[] = []

  relevantEntries.forEach((entry) => {
    // Extract factual statements about the entity
    const sentences = entry.rawText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0)

    sentences.forEach((sentence) => {
      const lowerSentence = sentence.toLowerCase()
      const entityNameLower = entity.name.toLowerCase()

      // Look for factual patterns
      if (
        lowerSentence.includes(entityNameLower) &&
        (lowerSentence.includes(' is ') ||
          lowerSentence.includes(' has ') ||
          lowerSentence.includes(' owns ') ||
          lowerSentence.includes(' wears ') ||
          lowerSentence.includes(' lives '))
      ) {
        facts.push({
          fact: sentence.trim(),
          confidence: 0.8,
          sourceEntryId: entry.id,
          extractedAt: new Date(),
        })
      }
    })
  })

  // Remove duplicates and sort by confidence
  const uniqueFacts = facts
    .filter(
      (fact, index, arr) =>
        index ===
        arr.findIndex((f) => f.fact.toLowerCase() === fact.fact.toLowerCase()),
    )
    .sort((a, b) => b.confidence - a.confidence)

  return uniqueFacts.slice(0, 10) // Limit to top 10 facts
}

// Helper function to build timeline from chronicle entries
function buildEntityTimeline(
  entity: Entity,
  entries: ChronicleEntry[],
): WikiTimelineEntry[] {
  const relevantEntries = entries
    .filter((entry) =>
      entry.parsedEntities.some((mention) => mention.entityId === entity.id),
    )
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  return relevantEntries.map((entry) => {
    const mention = entry.parsedEntities.find((m) => m.entityId === entity.id)

    return {
      entryId: entry.id,
      timestamp: entry.timestamp,
      event:
        entry.rawText.length > 150
          ? `${entry.rawText.substring(0, 150)}...`
          : entry.rawText,
      context: mention?.context || 'mentioned',
      importance: entry.isSceneBreak ? 'high' : 'medium',
      emotionalTone: entry.emotionalTone,
    }
  })
}

// Helper function to analyze relationships for wiki
function generateRelationshipSummary(
  entity: Entity,
  relationships: Relationship[],
): string {
  const entityRelationships = relationships.filter(
    (rel) => rel.fromEntityId === entity.id || rel.toEntityId === entity.id,
  )

  if (entityRelationships.length === 0) {
    return `No known relationships documented for ${entity.name}.`
  }

  const relationshipTexts = entityRelationships.map((rel) => {
    const isSource = rel.fromEntityId === entity.id
    const otherEntityId = isSource ? rel.toEntityId : rel.fromEntityId
    const relationshipType = rel.type

    return `${relationshipType} relationship with entity ${otherEntityId}`
  })

  return `${entity.name} has ${relationshipTexts.join(', ')}.`
}

// Helper function to generate wiki summary
function generateWikiSummary(
  entity: Entity,
  entries: ChronicleEntry[],
): string {
  const relevantEntries = entries.filter((entry) =>
    entry.parsedEntities.some((mention) => mention.entityId === entity.id),
  )

  if (relevantEntries.length === 0) {
    return `${entity.name} is ${entity.type === 'character' ? 'a character' : entity.type === 'location' ? 'a location' : `an ${entity.type}`} in your campaign.`
  }

  const firstMention = relevantEntries.find((e) => e.id === entity.firstMention)
  const lastMention = relevantEntries.find((e) => e.id === entity.lastMention)

  let summary = `${entity.name} is ${entity.type === 'character' ? 'a character' : entity.type === 'location' ? 'a location' : `an ${entity.type}`} `

  if (firstMention) {
    const context = `${firstMention.rawText.substring(0, 100)}...`
    summary += `first mentioned when: "${context}"`
  }

  if (
    entity.appearances.length > 1 &&
    lastMention &&
    lastMention.id !== firstMention?.id
  ) {
    summary += ` Last seen: ${lastMention.timestamp.toLocaleDateString()}`
  }

  return summary
}

export const useChronicleStore = create<ChronicleState>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: [],
      entities: [],
      relationships: [],
      wikiPages: [],
      narrativeThreads: [],
      currentSessionId: null,
      currentCampaignId: null,
      settings: defaultSettings,
      selectedEntity: null,
      searchQuery: '',
      isWriting: false,
      deltaHistory: [],
      pendingDeltaBundle: null,
      auditLog: [],
      bundleSnapshots: [],
      resourceHistory: createResourceHistory(),
      sessionCostCents: 0,
      lastCostEventAt: null,

      logDeltaResult: (log: ChronicleDeltaLog) => {
        const createdAt =
          log.createdAt ?? new Date().toISOString()
        const normalized: ChronicleDeltaLog = {
          ...log,
          createdAt,
          status: log.status ?? 'applied',
        }
        set((state) => {
          const filtered = state.deltaHistory.filter(
            (entry) => entry.bundleId !== normalized.bundleId,
          )
          const nextHistory = [normalized, ...filtered].slice(
            0,
            MAX_DELTA_HISTORY,
          )
          return { deltaHistory: nextHistory }
        })
      },

      clearAutomationHistory: (bundleId) => {
        if (bundleId) {
          set((state) => ({
            deltaHistory: state.deltaHistory.filter(
              (entry) => entry.bundleId !== bundleId,
            ),
            auditLog: state.auditLog.filter(
              (entry) => entry.bundleId !== bundleId,
            ),
            bundleSnapshots: state.bundleSnapshots.filter(
              (snapshot) => snapshot.bundleId !== bundleId,
            ),
            resourceHistory: {
              xp: pruneRecord(state.resourceHistory.xp, bundleId),
              bonds: pruneRecord(state.resourceHistory.bonds, bundleId),
              hold: pruneRecord(state.resourceHistory.hold, bundleId),
              debilities: pruneRecord(state.resourceHistory.debilities, bundleId),
              hp: pruneRecord(state.resourceHistory.hp, bundleId),
              coin: pruneRecord(state.resourceHistory.coin, bundleId),
            },
            pendingDeltaBundle:
              state.pendingDeltaBundle?.bundleId === bundleId
                ? null
                : state.pendingDeltaBundle,
          }))
          return
        }

        set(() => ({
          deltaHistory: [],
          auditLog: [],
          bundleSnapshots: [],
          resourceHistory: createResourceHistory(),
          pendingDeltaBundle: null,
        }))
      },

      clearDeltaLog: (bundleId?: string) => {
        get().clearAutomationHistory(bundleId)
      },

      getAutomationHistory: (limit) => {
        const history = get().deltaHistory
        if (typeof limit === 'number' && Number.isFinite(limit) && limit >= 0) {
          return history.slice(0, Math.floor(limit))
        }
        return history
      },

      getDeltaLog: (bundleId: string) =>
        get().deltaHistory.find((entry) => entry.bundleId === bundleId),

      setPendingDeltaBundle: (pending) => {
        if (!pending) {
          set(() => ({ pendingDeltaBundle: null }))
          return
        }
        const startedAt =
          pending.startedAt ?? pending.requestedAt ?? new Date().toISOString()
        set(() => ({
          pendingDeltaBundle: {
            ...pending,
            startedAt,
            status: pending.status ?? 'applying',
          },
        }))
      },

      beginBundleApply: ({
        entryId,
        requestedAt,
        autoApply,
        actor,
        bundleId,
        startedAt,
      }) => {
        const when = startedAt ?? requestedAt ?? new Date().toISOString()
        const normalizedBundleId =
          bundleId ?? `${entryId}:pending:${when}`
        const snapshot = createBundleSnapshot('before', {
          bundleId: normalizedBundleId,
          entryId,
          actor,
          autoApply: Boolean(autoApply),
        })

        set((state) => {
          const pendingEntry: ChronicleDeltaLog = {
            bundleId: normalizedBundleId,
            entryId,
            appliedOps: [],
            skippedOps: [],
            createdAt: when,
            actor,
            status: 'pending',
            requestedAt,
            autoApply: Boolean(autoApply),
          }

          const filteredHistory = state.deltaHistory.filter(
            (entry) => entry.bundleId !== normalizedBundleId,
          )

          return {
            pendingDeltaBundle: {
              bundleId: normalizedBundleId,
              entryId,
              requestedAt,
              autoApply,
              actor,
              startedAt: when,
              status: 'applying',
            },
            deltaHistory: [pendingEntry, ...filteredHistory].slice(
              0,
              MAX_DELTA_HISTORY,
            ),
          }
        })

        get().recordBundleSnapshot(snapshot)
      },

      finishBundleApply: ({
        bundleId,
        entryId,
        appliedOps,
        skippedOps,
        actor,
        undoHandle,
        completedAt,
        requestedAt,
        autoApply,
        durationMs,
      }) => {
        const timestamp = completedAt ?? new Date().toISOString()
        const normalizedAutoApply = Boolean(autoApply)
        const previousBundleId = get().pendingDeltaBundle?.bundleId ?? null
        const afterSnapshot = createBundleSnapshot('after', {
          bundleId,
          entryId,
          actor,
          autoApply: normalizedAutoApply,
        })

        const logEntry: ChronicleDeltaLog = {
          bundleId,
          entryId,
          appliedOps,
          skippedOps,
          createdAt: timestamp,
          undoHandle,
          actor,
          status: 'applied',
          requestedAt,
          autoApply: normalizedAutoApply,
          durationMs,
        }

        const auditEntry: ChronicleAuditEntry = {
          id: generateId('audit-'),
          bundleId,
          entryId,
          action: 'applied',
          actor,
          timestamp,
          appliedOps,
          skippedOps,
        }

        set((state) => {
          const candidateBundleIds = [bundleId, previousBundleId].filter(
            (value): value is string => Boolean(value),
          )
          const existingIndex = state.deltaHistory.findIndex((entry) =>
            candidateBundleIds.includes(entry.bundleId),
          )
          const existing =
            existingIndex >= 0 ? state.deltaHistory[existingIndex] : undefined

          const normalizedHistoryEntry: ChronicleDeltaLog = {
            ...existing,
            ...logEntry,
            createdAt: existing?.createdAt ?? timestamp,
            requestedAt: existing?.requestedAt ?? requestedAt ?? timestamp,
            status: 'applied',
            actor: logEntry.actor ?? existing?.actor,
            autoApply:
              logEntry.autoApply ?? existing?.autoApply ?? normalizedAutoApply,
            error: undefined,
          }

          const remainingHistory = state.deltaHistory.filter(
            (_entry, index) =>
              index !== existingIndex &&
              !candidateBundleIds.includes(_entry.bundleId),
          )

          const nextDeltaHistory = [
            normalizedHistoryEntry,
            ...remainingHistory,
          ].slice(0, MAX_DELTA_HISTORY)

          const filteredAudit = state.auditLog.filter(
            (entry) => entry.id !== auditEntry.id,
          )
          const nextAuditLog = [auditEntry, ...filteredAudit].slice(
            0,
            MAX_AUDIT_LOG_ENTRIES,
          )

          return {
            pendingDeltaBundle: null,
            deltaHistory: nextDeltaHistory,
            auditLog: nextAuditLog,
          }
        })

        get().recordBundleSnapshot(afterSnapshot, previousBundleId)
      },

      endBundleApply: (options) => {
        const pending = get().pendingDeltaBundle
        set((state) => {
          const nextHistory =
            pending?.bundleId
              ? state.deltaHistory.filter(
                  (entry) =>
                    !(
                      entry.bundleId === pending.bundleId &&
                      entry.status === 'pending'
                    ),
                )
              : state.deltaHistory

          return {
            pendingDeltaBundle: null,
            deltaHistory: nextHistory,
          }
        })
        if (pending?.bundleId && !options?.preserveSnapshots) {
          get().clearBundleSnapshots(pending.bundleId)
        }
      },

      markBundleUndo: ({
        bundleId,
        entryId,
        actor,
        timestamp,
        appliedOps,
        skippedOps,
      }) => {
        const undoneAt = timestamp ?? new Date().toISOString()

        set((state) => {
          const existingIndex = state.deltaHistory.findIndex(
            (entry) => entry.bundleId === bundleId,
          )

          let nextDeltaHistory: ChronicleDeltaLog[]
          if (existingIndex >= 0) {
            const existing = state.deltaHistory[existingIndex]
            const updated: ChronicleDeltaLog = {
              ...existing,
              status: 'undone',
              undoneAt,
              undoActor: actor,
            }
            nextDeltaHistory = [
              updated,
              ...state.deltaHistory.filter(
                (_entry, index) => index !== existingIndex,
              ),
            ]
          } else {
            nextDeltaHistory = [
              {
                bundleId,
                entryId,
                appliedOps,
                skippedOps,
                createdAt: undoneAt,
                actor,
                status: 'undone',
              },
              ...state.deltaHistory,
            ]
          }

          const auditEntry: ChronicleAuditEntry = {
            id: generateId('audit-'),
            bundleId,
            entryId,
            action: 'undone',
            actor,
            timestamp: undoneAt,
            appliedOps,
            skippedOps,
          }

          return {
            deltaHistory: nextDeltaHistory.slice(0, MAX_DELTA_HISTORY),
            auditLog: [auditEntry, ...state.auditLog].slice(
              0,
              MAX_AUDIT_LOG_ENTRIES,
            ),
          }
        })
      },

      recordBundleFailure: ({
        bundleId,
        entryId,
        actor,
        reason,
        error,
        occurredAt,
      }) => {
        const failedAt = occurredAt ?? new Date().toISOString()

        set((state) => {
          const existingIndex = state.deltaHistory.findIndex(
            (entry) => entry.bundleId === bundleId,
          )
          const existing =
            existingIndex >= 0 ? state.deltaHistory[existingIndex] : undefined

          const normalizedHistoryEntry: ChronicleDeltaLog = {
            bundleId,
            entryId,
            appliedOps: existing?.appliedOps ?? [],
            skippedOps: existing?.skippedOps ?? [],
            createdAt: existing?.createdAt ?? failedAt,
            actor: actor ?? existing?.actor,
            status: 'failed',
            requestedAt: existing?.requestedAt ?? failedAt,
            autoApply: existing?.autoApply ?? false,
            undoHandle: existing?.undoHandle,
            durationMs: existing?.durationMs,
            error,
          }

          const remainingHistory = state.deltaHistory.filter(
            (_entry, index) =>
              index !== existingIndex && _entry.bundleId !== bundleId,
          )

          const nextDeltaHistory = [
            normalizedHistoryEntry,
            ...remainingHistory,
          ].slice(0, MAX_DELTA_HISTORY)

          const auditEntry: ChronicleAuditEntry = {
            id: generateId('audit-'),
            bundleId,
            entryId,
            action: 'failed',
            actor,
            reason,
            timestamp: failedAt,
            appliedOps: normalizedHistoryEntry.appliedOps,
            skippedOps: normalizedHistoryEntry.skippedOps,
          }

          const nextAuditLog = [auditEntry, ...state.auditLog].slice(
            0,
            MAX_AUDIT_LOG_ENTRIES,
          )

          return {
            deltaHistory: nextDeltaHistory,
            auditLog: nextAuditLog,
            pendingDeltaBundle:
              state.pendingDeltaBundle?.bundleId === bundleId
                ? null
                : state.pendingDeltaBundle,
          }
        })
      },

      recordAuditEvent: (entry) => {
        set((state) => {
          const next = [
            entry,
            ...state.auditLog.filter((item) => item.id !== entry.id),
          ]
          return { auditLog: next.slice(0, MAX_AUDIT_LOG_ENTRIES) }
        })
      },

      clearAuditLog: (bundleId) => {
        set((state) => ({
          auditLog: bundleId
            ? state.auditLog.filter((entry) => entry.bundleId !== bundleId)
            : [],
        }))
      },

      recordBundleSnapshot: (snapshot, previousBundleId = null) => {
        set((state) => {
          let snapshots = state.bundleSnapshots
          if (previousBundleId && previousBundleId !== snapshot.bundleId) {
            snapshots = snapshots.map((entry) =>
              entry.bundleId === previousBundleId
                ? { ...entry, bundleId: snapshot.bundleId }
                : entry,
            )
          }

          const filtered = snapshots.filter(
            (entry) =>
              !(
                entry.bundleId === snapshot.bundleId &&
                entry.stage === snapshot.stage
              ),
          )

          const nextSnapshots = [snapshot, ...filtered].slice(
            0,
            MAX_BUNDLE_SNAPSHOTS,
          )

          return { bundleSnapshots: nextSnapshots }
        })
      },

      getBundleSnapshots: (bundleId) => {
        if (!bundleId) return { before: null, after: null }
        const snapshots = get().bundleSnapshots.filter(
          (snapshot) => snapshot.bundleId === bundleId,
        )
        const before =
          snapshots.find((snapshot) => snapshot.stage === 'before') ?? null
        const after =
          snapshots.find((snapshot) => snapshot.stage === 'after') ?? null
        return { before, after }
      },

      exportBundleSnapshots: (bundleId) => {
        const { before, after } = get().getBundleSnapshots(bundleId)
        if (!before && !after) {
          return null
        }

        return JSON.stringify(
          {
            bundleId,
            exportedAt: new Date().toISOString(),
            before,
            after,
          },
          null,
          2,
        )
      },

      clearBundleSnapshots: (bundleId) => {
        if (bundleId) {
          set((state) => ({
            bundleSnapshots: state.bundleSnapshots.filter(
              (snapshot) => snapshot.bundleId !== bundleId,
            ),
          }))
          return
        }

        set(() => ({ bundleSnapshots: [] }))
      },

      logResourceChange: (entry) => {
        set((state) => {
          const history = state.resourceHistory
          switch (entry.type) {
            case 'xp': {
              return {
                resourceHistory: {
                  ...history,
                  xp: {
                    ...history.xp,
                    [entry.characterId]: prependEntry(
                      history.xp[entry.characterId] ?? [],
                      entry,
                    ),
                  },
                },
              }
            }
            case 'hp': {
              return {
                resourceHistory: {
                  ...history,
                  hp: {
                    ...history.hp,
                    [entry.characterId]: prependEntry(
                      history.hp[entry.characterId] ?? [],
                      entry,
                    ),
                  },
                },
              }
            }
            case 'bond': {
              return {
                resourceHistory: {
                  ...history,
                  bonds: {
                    ...history.bonds,
                    [entry.characterId]: prependEntry(
                      history.bonds[entry.characterId] ?? [],
                      entry,
                    ),
                  },
                },
              }
            }
            case 'hold': {
              return {
                resourceHistory: {
                  ...history,
                  hold: {
                    ...history.hold,
                    [entry.characterId]: prependEntry(
                      history.hold[entry.characterId] ?? [],
                      entry,
                    ),
                  },
                },
              }
            }
            case 'coin': {
              return {
                resourceHistory: {
                  ...history,
                  coin: {
                    ...history.coin,
                    [entry.characterId]: prependEntry(
                      history.coin[entry.characterId] ?? [],
                      entry,
                    ),
                  },
                },
              }
            }
            case 'debility': {
              return {
                resourceHistory: {
                  ...history,
                  debilities: {
                    ...history.debilities,
                    [entry.characterId]: prependEntry(
                      history.debilities[entry.characterId] ?? [],
                      entry,
                    ),
                  },
                },
              }
            }
            default:
              return {}
          }
        })
      },

      removeResourceHistoryForBundle: (bundleId: string) => {
        set((state) => ({
          resourceHistory: {
            xp: pruneRecord(state.resourceHistory.xp, bundleId),
            bonds: pruneRecord(state.resourceHistory.bonds, bundleId),
            hold: pruneRecord(state.resourceHistory.hold, bundleId),
            debilities: pruneRecord(state.resourceHistory.debilities, bundleId),
            hp: pruneRecord(state.resourceHistory.hp, bundleId),
            coin: pruneRecord(state.resourceHistory.coin, bundleId),
          },
        }))
      },

      getXpHistory: (characterId: string) =>
        get().resourceHistory.xp[characterId] ?? [],
      getBondHistory: (characterId: string) =>
        get().resourceHistory.bonds[characterId] ?? [],
      getHoldHistory: (characterId: string) =>
        get().resourceHistory.hold[characterId] ?? [],
      getDebilityHistory: (characterId: string) =>
        get().resourceHistory.debilities[characterId] ?? [],

      // Chronicle Entries Actions
      addEntry: (entryData) => {
        const id = generateId('entry-')
        const entry: ChronicleEntry = {
          ...entryData,
          id,
          timestamp: new Date(),
        }

        set((state) => ({
          entries: [...state.entries, entry],
        }))

        return id
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry,
          ),
        }))
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }))
      },

      getEntry: (id) => {
        return get().entries.find((entry) => entry.id === id)
      },

      getEntriesBySession: (sessionId) => {
        return get().entries.filter((entry) => entry.sessionId === sessionId)
      },

      // Entity Actions
      addEntity: (entityData) => {
        const id = generateId('entity-')
        const now = new Date()
        const entity: Entity = {
          ...entityData,
          id,
          createdAt: now,
          lastUpdated: now,
          importance: 1, // Will be calculated later
        }

        set((state) => {
          const newEntities = [...state.entities, entity]
          // Recalculate importance
          entity.importance = calculateEntityImportance(entity, state.entries)

          return {
            entities: newEntities,
          }
        })

        // Generate initial wiki page
        get().generateWikiPage(id)

        return id
      },

      updateEntity: (id, updates) => {
        set((state) => ({
          entities: state.entities.map((entity) =>
            entity.id === id
              ? {
                  ...entity,
                  ...updates,
                  lastUpdated: new Date(),
                  importance: calculateEntityImportance(
                    { ...entity, ...updates },
                    state.entries,
                  ),
                }
              : entity,
          ),
        }))
      },

      deleteEntity: (id) => {
        set((state) => {
          const remainingRelationships = state.relationships.filter(
            (rel) => rel.fromEntityId !== id && rel.toEntityId !== id,
          )
          const remainingRelationshipIds = new Set(
            remainingRelationships.map((rel) => rel.id),
          )

          const remainingEntities = state.entities
            .filter((entity) => entity.id !== id)
            .map((entity) => {
              const filteredRelationships = entity.relationships.filter((rel) =>
                remainingRelationshipIds.has(rel.id),
              )
              if (filteredRelationships.length === entity.relationships.length)
                return entity

              const updatedEntity = {
                ...entity,
                relationships: filteredRelationships,
                lastUpdated: new Date(),
              }
              return {
                ...updatedEntity,
                importance: calculateEntityImportance(
                  updatedEntity,
                  state.entries,
                ),
              }
            })

          return {
            entities: remainingEntities,
            wikiPages: state.wikiPages.filter((page) => page.entityId !== id),
            relationships: remainingRelationships,
          }
        })
      },

      getEntity: (id) => {
        return get().entities.find((entity) => entity.id === id)
      },

      recordEntityMention: (entityId, entryId) => {
        set((state) => ({
          entities: state.entities.map((entity) => {
            if (entity.id !== entityId) return entity

            const appearances = entity.appearances.includes(entryId)
              ? entity.appearances
              : [...entity.appearances, entryId]
            const updated = {
              ...entity,
              firstMention: entity.firstMention ?? entryId,
              lastMention: entryId,
              appearances,
              lastUpdated: new Date(),
            }
            return {
              ...updated,
              importance: calculateEntityImportance(updated, state.entries),
            }
          }),
        }))
      },

      getEntitiesByType: (type) => {
        return get().entities.filter((entity) => entity.type === type)
      },

      findEntityByName: (name, type) => {
        const { entities } = get()
        const lowerName = name.toLowerCase()

        return entities.find((entity) => {
          if (type && entity.type !== type) return false

          const matchesName = entity.name.toLowerCase() === lowerName
          const matchesAlias = entity.aliases.some(
            (alias) => alias.toLowerCase() === lowerName,
          )

          return matchesName || matchesAlias
        })
      },

      // Relationship Actions
      addRelationship: (relationshipData) => {
        const id = generateId('rel-')
        const now = new Date()
        const relationship: Relationship = {
          ...relationshipData,
          id,
          createdAt: now,
          lastUpdated: now,
          history: [],
        }

        set((state) => ({
          relationships: [...state.relationships, relationship],
          entities: state.entities.map((entity) => {
            if (
              entity.id !== relationship.fromEntityId &&
              entity.id !== relationship.toEntityId
            )
              return entity

            const filtered = entity.relationships.filter(
              (rel) => rel.id !== relationship.id,
            )
            const updatedEntity = {
              ...entity,
              relationships: [...filtered, relationship],
              lastUpdated: now,
            }
            return {
              ...updatedEntity,
              importance: calculateEntityImportance(
                updatedEntity,
                state.entries,
              ),
            }
          }),
        }))

        return id
      },

      updateRelationship: (id, updates) => {
        const now = new Date()
        set((state) => {
          let previous: Relationship | undefined
          let updated: Relationship | undefined

          const relationships = state.relationships.map((rel) => {
            if (rel.id === id) {
              previous = rel
              updated = { ...rel, ...updates, lastUpdated: now }
              return updated
            }
            return rel
          })

          if (!updated) return { relationships }

          const entities = state.entities.map((entity) => {
            let relationshipsList = entity.relationships
            let changed = false

            if (
              previous &&
              (entity.id === previous.fromEntityId ||
                entity.id === previous.toEntityId)
            ) {
              relationshipsList = relationshipsList.filter(
                (rel) => rel.id !== id,
              )
              changed = true
            }

            if (
              entity.id === updated.fromEntityId ||
              entity.id === updated.toEntityId
            ) {
              const filtered = relationshipsList.filter((rel) => rel.id !== id)
              relationshipsList = [...filtered, updated]
              changed = true
            }

            if (!changed) return entity

            const refreshed = {
              ...entity,
              relationships: relationshipsList,
              lastUpdated: now,
            }
            return {
              ...refreshed,
              importance: calculateEntityImportance(refreshed, state.entries),
            }
          })

          return { relationships, entities }
        })
      },

      deleteRelationship: (id) => {
        const now = new Date()
        set((state) => ({
          relationships: state.relationships.filter((rel) => rel.id !== id),
          entities: state.entities.map((entity) => {
            const filtered = entity.relationships.filter((rel) => rel.id !== id)
            if (filtered.length === entity.relationships.length) return entity

            const updatedEntity = {
              ...entity,
              relationships: filtered,
              lastUpdated: now,
            }
            return {
              ...updatedEntity,
              importance: calculateEntityImportance(
                updatedEntity,
                state.entries,
              ),
            }
          }),
        }))
      },

      getRelationship: (id) => {
        return get().relationships.find((rel) => rel.id === id)
      },

      getEntityRelationships: (entityId) => {
        return get().relationships.filter(
          (rel) => rel.fromEntityId === entityId || rel.toEntityId === entityId,
        )
      },

      getLinkedEntities: (entityId) => {
        if (!entityId) return []
        const { relationships, entities } = get()
        return relationships
          .filter(
            (rel) =>
              rel.fromEntityId === entityId || rel.toEntityId === entityId,
          )
          .map((rel) => {
            const otherEntityId =
              rel.fromEntityId === entityId ? rel.toEntityId : rel.fromEntityId
            const entity = entities.find((item) => item.id === otherEntityId)
            return {
              relationship: rel,
              otherEntityId,
              entity,
            }
          })
      },

      getRelationshipBetweenEntities: (entityA, entityB) => {
        if (!entityA || !entityB) return undefined
        const candidates = get().relationships.filter(
          (rel) =>
            (rel.fromEntityId === entityA && rel.toEntityId === entityB) ||
            (rel.fromEntityId === entityB && rel.toEntityId === entityA),
        )
        if (candidates.length === 0) return undefined
        return candidates.slice(1).reduce<Relationship>(
          (latest, rel) => {
            const current = getTimestamp(rel.lastUpdated)
            const previous = getTimestamp(latest.lastUpdated)
            return current > previous ? rel : latest
          },
          candidates[0],
        )
      },

      // Wiki Actions
      generateWikiPage: (entityId) => {
        const { entities, entries, relationships, wikiPages } = get()
        const entity = entities.find((e) => e.id === entityId)
        if (!entity) return

        const existingPage = wikiPages.find((p) => p.entityId === entityId)

        // Generate comprehensive wiki data
        const autoGeneratedSummary = generateWikiSummary(entity, entries)
        const keyFacts = extractKeyFacts(entity, entries)
        const timeline = buildEntityTimeline(entity, entries)
        const relationshipSummary = generateRelationshipSummary(
          entity,
          relationships,
        )

        // Extract potential mysteries/questions about the entity
        const mysteries: string[] = []
        const relevantEntries = entries.filter((entry) =>
          entry.parsedEntities.some(
            (mention) => mention.entityId === entity.id,
          ),
        )

        relevantEntries.forEach((entry) => {
          // Look for questions or mysterious references
          const sentences = entry.rawText
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 0)
          sentences.forEach((sentence) => {
            if (
              (sentence.includes('?') ||
                sentence.toLowerCase().includes('mystery') ||
                sentence.toLowerCase().includes('unknown') ||
                sentence.toLowerCase().includes('secret')) &&
              sentence.toLowerCase().includes(entity.name.toLowerCase())
            ) {
              mysteries.push(sentence.trim())
            }
          })
        })

        const wikiPage: WikiPage = {
          entityId,
          autoGeneratedSummary,
          keyFacts,
          timeline,
          relationshipSummary,
          mysteries: mysteries.slice(0, 5), // Limit to 5 mysteries
          userContent: existingPage?.userContent || '',
          lastGenerated: new Date(),
          viewCount: existingPage?.viewCount || 0,
          bookmarked: existingPage?.bookmarked || false,
        }

        set((state) => ({
          wikiPages: state.wikiPages
            .filter((p) => p.entityId !== entityId)
            .concat(wikiPage),
        }))
      },

      updateWikiPage: (entityId, updates) => {
        set((state) => ({
          wikiPages: state.wikiPages.map((page) =>
            page.entityId === entityId ? { ...page, ...updates } : page,
          ),
        }))
      },

      getWikiPage: (entityId) => {
        return get().wikiPages.find((page) => page.entityId === entityId)
      },

      incrementWikiView: (entityId) => {
        set((state) => ({
          wikiPages: state.wikiPages.map((page) =>
            page.entityId === entityId
              ? { ...page, viewCount: page.viewCount + 1 }
              : page,
          ),
        }))
      },

      // Search Actions
      searchAll: (query) => {
        const { entries, entities } = get()
        const results: ChronicleSearchResult[] = []
        const lowerQuery = query.toLowerCase()

        // Search entries
        entries.forEach((entry) => {
          if (entry.rawText.toLowerCase().includes(lowerQuery)) {
            const startIndex = entry.rawText.toLowerCase().indexOf(lowerQuery)
            const excerpt = entry.rawText.substring(
              Math.max(0, startIndex - 50),
              Math.min(entry.rawText.length, startIndex + 150),
            )

            results.push({
              type: 'entry',
              id: entry.id,
              title: `Entry from ${entry.timestamp.toLocaleDateString()}`,
              excerpt,
              relevanceScore: 1,
              matchedTerms: [query],
            })
          }
        })

        // Search entities
        entities.forEach((entity) => {
          const nameMatch = entity.name.toLowerCase().includes(lowerQuery)
          const descMatch = entity.description
            .toLowerCase()
            .includes(lowerQuery)
          const tagMatch = entity.tags.some((tag) =>
            tag.toLowerCase().includes(lowerQuery),
          )

          if (nameMatch || descMatch || tagMatch) {
            results.push({
              type: 'entity',
              id: entity.id,
              title: entity.name,
              excerpt: entity.description,
              relevanceScore: nameMatch ? 2 : 1,
              matchedTerms: [query],
            })
          }
        })

        // Sort by relevance
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
      },

      searchEntries: (query) => {
        const { entries } = get()
        const lowerQuery = query.toLowerCase()

        return entries.filter(
          (entry) =>
            entry.rawText.toLowerCase().includes(lowerQuery) ||
            entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
        )
      },

      searchEntities: (query) => {
        const { entities } = get()
        const lowerQuery = query.toLowerCase()

        return entities.filter(
          (entity) =>
            entity.name.toLowerCase().includes(lowerQuery) ||
            entity.description.toLowerCase().includes(lowerQuery) ||
            entity.aliases.some((alias) =>
              alias.toLowerCase().includes(lowerQuery),
            ) ||
            entity.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
        )
      },

      // Session Management
      startSession: (campaignId) => {
        const sessionId = generateId('session-')

        set(() => ({
          currentSessionId: sessionId,
          currentCampaignId: campaignId || null,
        }))

        return sessionId
      },

      endSession: () => {
        set(() => ({
          currentSessionId: null,
        }))
      },

      getCurrentSession: () => {
        const { currentSessionId, entries } = get()
        if (!currentSessionId) return []

        return entries.filter((entry) => entry.sessionId === currentSessionId)
      },

      // Utility Actions
      clearAll: () => {
        set(() => ({
          entries: [],
          entities: [],
          relationships: [],
          wikiPages: [],
          narrativeThreads: [],
          currentSessionId: null,
          currentCampaignId: null,
          selectedEntity: null,
          searchQuery: '',
          pendingDeltaBundle: null,
          deltaHistory: [],
          auditLog: [],
          bundleSnapshots: [],
          resourceHistory: createResourceHistory(),
          sessionCostCents: 0,
          lastCostEventAt: null,
        }))
      },

      exportData: () => {
        const {
          entries,
          entities,
          relationships,
          wikiPages,
          narrativeThreads,
        } = get()
        return JSON.stringify(
          {
            entries,
            entities,
            relationships,
            wikiPages,
            narrativeThreads,
            exportedAt: new Date(),
            version: '1.0',
          },
          null,
          2,
        )
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          set(() => ({
            entries: parsed.entries || [],
            entities: parsed.entities || [],
            relationships: parsed.relationships || [],
            wikiPages: parsed.wikiPages || [],
            narrativeThreads: parsed.narrativeThreads || [],
          }))
        } catch (error) {
          console.error('Failed to import chronicle data:', error)
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      recordSessionCost: (costCents, timestamp) => {
        if (
          typeof costCents !== 'number' ||
          Number.isNaN(costCents) ||
          costCents <= 0
        ) {
          return
        }

        set((state) => ({
          sessionCostCents: state.sessionCostCents + Math.round(costCents),
          lastCostEventAt: timestamp ?? new Date().toISOString(),
        }))
      },

      resetSessionCost: () => {
        set(() => ({
          sessionCostCents: 0,
          lastCostEventAt: null,
        }))
      },
    }),
    {
      name: 'chronicle-store',
      version: 3,
      migrate: (persistedState, version) => {
        if (!persistedState) {
          return persistedState
        }

        const resourceHistory = persistedState.resourceHistory ?? {}
        const deltaHistory = Array.isArray(persistedState.deltaHistory)
          ? persistedState.deltaHistory
          : []
        const deltaActorByBundle = new Map<
          string,
          ChronicleDeltaLog['actor']
        >(
          deltaHistory
            .filter(
              (entry): entry is ChronicleDeltaLog & { bundleId: string } =>
                Boolean(entry?.bundleId),
            )
            .map((entry) => [entry.bundleId, entry.actor])
            .filter(([, actor]) => actor !== undefined),
        )

        const hydratedAuditLog = (persistedState.auditLog ?? []).map(
          (entry: ChronicleAuditEntry) => ({
            ...entry,
            actor:
              entry.actor ??
              (entry.bundleId
                ? deltaActorByBundle.get(entry.bundleId)
                : undefined),
          }),
        )

        const hydratedPending = persistedState.pendingDeltaBundle
          ? {
              ...persistedState.pendingDeltaBundle,
              status:
                persistedState.pendingDeltaBundle.status ?? 'applying',
            }
          : null

        const hydratedDeltaHistory = deltaHistory.map((entry) => ({
          ...entry,
          status: entry.status ?? 'applied',
        }))

        const hydratedState = {
          ...persistedState,
          pendingDeltaBundle: hydratedPending,
          deltaHistory: hydratedDeltaHistory,
          bundleSnapshots: Array.isArray(persistedState.bundleSnapshots)
            ? persistedState.bundleSnapshots
            : [],
          auditLog: hydratedAuditLog,
          resourceHistory: {
            xp: resourceHistory.xp ?? {},
            bonds: resourceHistory.bonds ?? {},
            hold: resourceHistory.hold ?? {},
            debilities: resourceHistory.debilities ?? {},
            hp: resourceHistory.hp ?? {},
            coin: resourceHistory.coin ?? {},
          },
          sessionCostCents:
            typeof persistedState.sessionCostCents === 'number'
              ? persistedState.sessionCostCents
              : 0,
          lastCostEventAt:
            typeof persistedState.lastCostEventAt === 'string'
              ? persistedState.lastCostEventAt
              : null,
        }

        return hydratedState
      },
    },
  ),
)






