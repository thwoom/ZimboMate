import type { Item, ItemCategory, Tag } from '../../models/Equipment'
import type { Inventory, InventoryEquipSlot } from '../../models/Inventory'
import type { EntityMentionRecord, EntityType, RelationshipType } from '../../types/chronicle'
import type { Condition } from '../CharacterStateService'
import type {
  ApplyDeltaBundleRequest,
  ApplyDeltaBundleResult,
  DeltaOperation,
  InventoryItemInput,
} from '../llm'
import { getXPThreshold } from '../../models/Character'
import { createEmptyInventory, getEquippedSlot } from '../../models/Inventory'
import { useCharacterStore } from '../../stores/characterStore'
import { useChronicleStore } from '../../stores/chronicleStore'
import { useHoldStore } from '../../stores/holdStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { logger } from '../../utils/logger'
import { characterStateService } from '../CharacterStateService'
import { validateDeltaOperations } from '../llm/toolSchemas'
import { computeSha256Hex } from '../llm/hash'
import { stableStringify } from '@/utils/stableStringify'

type UndoAction = () => void | Promise<void>

type HoldEntry = import('../../stores/holdStore').HoldEntry

interface AppliedBundleRecord {
  undoActions: UndoAction[]
  appliedOps: DeltaOperation[]
  skippedOps: DeltaOperation[]
  issuedAt: string
  entryId: string
  actor: 'auto' | 'manual' | 'system' | 'user'
}

const appliedBundles = new Map<string, AppliedBundleRecord>()

interface BundleOperationMeta {
  explicitEquipTargets: Set<string>
  explicitUnequipTargets: Set<string>
}

async function deriveBundleId(
  bundle: ApplyDeltaBundleRequest['bundle'],
  operations: DeltaOperation[],
  selectedOpIndices?: number[],
): Promise<string> {
  if (bundle.idempotencyKey && bundle.idempotencyKey.trim().length > 0) {
    return bundle.idempotencyKey
  }

  const payload = {
    entryId: bundle.entryId,
    operations: operations.map(normalizeOperationForFingerprint),
    selection: Array.isArray(selectedOpIndices)
      ? [...selectedOpIndices].sort((a, b) => a - b)
      : null,
  }

  const fingerprint = await computeSha256Hex(stableStringify(payload))
  return `${bundle.entryId}:${fingerprint}`
}

function normalizeOperationForFingerprint(
  operation: DeltaOperation,
): unknown {
  try {
    const clone = JSON.parse(JSON.stringify(operation)) as Record<
      string,
      unknown
    >

    if (clone && typeof clone === 'object') {
      delete clone.metadata

      if (clone.item && typeof clone.item === 'object') {
        const item = clone.item as Record<string, unknown>
        delete item.id
        delete item.createdAt
        delete item.updatedAt
      }

      if (clone.entity && typeof clone.entity === 'object') {
        const entity = clone.entity as Record<string, unknown>
        delete entity.id
        delete entity.createdAt
        delete entity.lastUpdated
      }
    }

    return clone
  } catch (error) {
    logger.warn(
      '[chronicle][executor] Failed to normalize operation for fingerprint',
      error,
    )
    return operation
  }
}

function buildBundleOperationMeta(ops: DeltaOperation[]): BundleOperationMeta {
  const meta: BundleOperationMeta = {
    explicitEquipTargets: new Set<string>(),
    explicitUnequipTargets: new Set<string>(),
  }

  ops.forEach((op) => {
    if (op.type === 'equip_item') meta.explicitEquipTargets.add(op.itemId)
    else if (op.type === 'unequip_item')
      meta.explicitUnequipTargets.add(op.itemId)
  })

  return meta
}

function nowIso(): string {
  return new Date().toISOString()
}

function resolveCharacterId(rawId: string | undefined): string | null {
  const { activeCharacterId } = useCharacterStore.getState()
  if (!rawId || rawId === '.' || rawId === 'active_character')
    return activeCharacterId ?? null

  return rawId
}

function withCharacter<TReturn>(
  characterId: string | undefined,
  handler: (context: {
    characterId: string
    characterState: ReturnType<typeof useCharacterStore.getState>
    character: NonNullable<
      ReturnType<ReturnType<typeof useCharacterStore.getState>['getCharacter']>
    >
  }) => TReturn,
): { ok: true; result: TReturn } | { ok: false } {
  const characterState = useCharacterStore.getState()
  const resolvedId = resolveCharacterId(characterId)
  if (!resolvedId) return { ok: false }

  const character = characterState.getCharacter(resolvedId)
  if (!character) return { ok: false }

  return {
    ok: true,
    result: handler({ characterId: resolvedId, characterState, character }),
  }
}

function generateId(prefix: string): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function cloneInventory(inventory: Inventory | null): Inventory | null {
  if (!inventory) return null

  return {
    ...inventory,
    items: Object.fromEntries(
      Object.entries(inventory.items).map(([id, item]) => [
        id,
        {
          ...item,
          tags: item.tags.map((tag) => ({ ...tag })),
          uses: item.uses ? { ...item.uses } : undefined,
        },
      ]),
    ),
    containers: inventory.containers.map((container) => ({
      ...container,
      items: [...container.items],
    })),
    quickSlots: [...inventory.quickSlots],
    lastUpdated: new Date(inventory.lastUpdated),
  }
}

function recordInventorySnapshot(): Inventory | null {
  return cloneInventory(useInventoryStore.getState().inventory)
}

function restoreInventorySnapshot(snapshot: Inventory | null): void {
  useInventoryStore.setState(() => ({
    inventory: cloneInventory(snapshot),
  }))
}

function recordHoldSnapshot(characterId: string): HoldEntry[] {
  const holds = useHoldStore.getState().characterHolds[characterId] || []
  return holds.map((hold) => ({ ...hold }))
}

function restoreHoldSnapshot(characterId: string, snapshot: HoldEntry[]): void {
  useHoldStore.setState((state) => ({
    characterHolds: {
      ...state.characterHolds,
      [characterId]: snapshot.map((hold) => ({ ...hold })),
    },
  }))
}

function toTag(raw: string): Tag {
  const value = raw.trim()
  if (!value) return { name: value }

  const colonIndex = value.indexOf(':')
  if (colonIndex >= 0) {
    const name = value.slice(0, colonIndex).trim()
    const rawValue = value.slice(colonIndex + 1).trim()
    const numeric = Number(rawValue)
    return {
      name,
      value: Number.isNaN(numeric) ? rawValue : numeric,
    }
  }

  const parts = value.split(/\s+/)
  if (parts.length >= 2) {
    const numeric = Number(parts[1])
    if (!Number.isNaN(numeric)) return { name: parts[0], value: numeric }
  }

  return { name: value }
}

function inferCategory(tags: Tag[], slotHint?: string): ItemCategory {
  const hint = slotHint?.toLowerCase()
  if (hint?.includes('weapon')) return 'weapon'
  if (hint?.includes('armor')) return 'armor'
  if (hint?.includes('consumable')) return 'consumable'

  const names = tags.map((tag) => tag.name.toLowerCase())
  const weaponTags = ['hand', 'close', 'reach', 'near', 'far', 'thrown']
  if (weaponTags.some((tag) => names.includes(tag))) return 'weapon'
  if (
    names.includes('armor') ||
    names.includes('worn') ||
    names.includes('shield')
  )
    return 'armor'
  if (names.includes('ration') || names.includes('consumable'))
    return 'consumable'
  if (names.includes('treasure')) return 'treasure'
  if (names.includes('magical')) return 'magical'
  return 'gear'
}

function extractWeight(tags: Tag[], fallback?: number): number {
  const weightTag = tags.find((tag) => tag.name.toLowerCase() === 'weight')
  if (weightTag) {
    const numeric =
      typeof weightTag.value === 'number'
        ? weightTag.value
        : Number(weightTag.value)
    if (!Number.isNaN(numeric)) return numeric
  }
  return fallback ?? 0
}

function toInventoryItem(input: InventoryItemInput, itemId: string): Item {
  const tags = (input.tags ?? []).map(toTag)
  return {
    id: itemId,
    name: input.name,
    category: inferCategory(tags, input.slotHint),
    tags,
    description: input.description,
    weight: extractWeight(tags, input.weight),
    value: input.coinValue,
    quantity: input.quantity ?? 1,
    equipped: Boolean(input.isEquipped),
    customMove: undefined,
    uses:
      typeof input.uses === 'number'
        ? { current: input.uses, max: input.uses }
        : undefined,
  }
}

function isWeapon(item: Item): boolean {
  return item.category === 'weapon'
}

function hasTwoHandedTag(item: Item): boolean {
  return item.tags.some((tag) => tag.name.toLowerCase() === 'two-handed')
}

function resolveAutoEquipSlot(
  settings: ReturnType<typeof useChronicleStore.getState>['settings'],
  inventory: Inventory,
  item: Item,
): InventoryEquipSlot | undefined {
  if (!settings?.autoEquipWeapons || !isWeapon(item)) return undefined

  const equippedContainer = inventory.containers.find(
    (container) => container.id === 'equipped',
  )
  if (!equippedContainer) return undefined

  const equippedItems = equippedContainer.items
    .map((itemId) => inventory.items[itemId])
    .filter(Boolean) as Item[]

  if (hasTwoHandedTag(item))
    return equippedItems.length === 0 ? 'two_handed' : undefined

  if (equippedItems.length === 0) return 'main_hand'

  if (equippedItems.length === 1 && !hasTwoHandedTag(equippedItems[0]))
    return 'off_hand'

  return undefined
}

function ensureInventoryInitialized(): Inventory {
  const store = useInventoryStore.getState()
  if (!store.inventory) store.setInventory(createEmptyInventory())
  return useInventoryStore.getState().inventory!
}

function determineEquipSlotHint(
  item: Item,
  requestedSlot?: InventoryEquipSlot,
  fallbackSlot?: InventoryEquipSlot,
): InventoryEquipSlot | undefined {
  if (requestedSlot) return requestedSlot
  if (fallbackSlot) return fallbackSlot
  if (hasTwoHandedTag(item)) return 'two_handed'
  if (isWeapon(item)) return 'main_hand'
  return undefined
}

function convertEntityType(value: string | undefined): EntityType {
  const allowed: EntityType[] = [
    'character',
    'location',
    'organization',
    'item',
    'event',
    'mystery',
    'relationship',
  ]
  const lower = value?.toLowerCase() ?? ''
  return (allowed as string[]).includes(lower)
    ? (lower as EntityType)
    : 'character'
}

function convertRelationshipType(value: string | undefined): RelationshipType {
  const allowed: RelationshipType[] = [
    'ally',
    'enemy',
    'family',
    'romantic',
    'business',
    'mentor',
    'unknown',
  ]
  const lower = value?.toLowerCase() ?? ''
  return (allowed as string[]).includes(lower)
    ? (lower as RelationshipType)
    : 'ally'
}

function normalizeRelationshipStrength(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 1
  const rounded = Math.round(value)
  return Math.max(-10, Math.min(10, rounded))
}

function normalizeRelationshipConfidence(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 1
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function normalizeRelationshipStatus(status: string | undefined): string {
  const normalized = status?.toLowerCase()
  switch (normalized) {
    case 'active':
    case 'dormant':
    case 'resolved':
    case 'unknown':
      return normalized
    default:
      return 'active'
  }
}

function recordEntityMention(
  entityId: string | undefined,
  entryId: string,
  detail?: Partial<EntityMentionRecord>,
) {
  if (!entityId) return
  const chronicle = useChronicleStore.getState()
  chronicle.recordEntityMention(entityId, entryId, detail)
}

function tagValueToNumber(tags: Tag[], target: string): number | undefined {
  const tag = tags.find(
    (entry) => entry.name.toLowerCase() === target.toLowerCase(),
  )
  if (!tag) return undefined
  const numeric = typeof tag.value === 'number' ? tag.value : Number(tag.value)
  return Number.isNaN(numeric) ? undefined : numeric
}

export async function applyChronicleDeltaBundle(
  request: ApplyDeltaBundleRequest,
): Promise<ApplyDeltaBundleResult> {
  const { bundle, selectedOpIndices } = request
  const validatedOps = validateDeltaOperations(bundle.ops)
  const bundleId = await deriveBundleId(bundle, validatedOps, selectedOpIndices)

  const existing = appliedBundles.get(bundleId)
  if (existing) {
    return {
      bundleId,
      appliedOps: existing.appliedOps,
      skippedOps: existing.skippedOps,
      undoHandle: {
        bundleId,
        issuedAt: existing.issuedAt,
      },
    }
  }

  ensureInventoryInitialized()

  const selection = selectedOpIndices
    ? new Set(selectedOpIndices)
    : new Set(validatedOps.map((_, index) => index))

  const bundleMeta = buildBundleOperationMeta(validatedOps)

  const appliedOps: DeltaOperation[] = []
  const skippedOps: DeltaOperation[] = []
  const undoActions: UndoAction[] = []
  const idMap = new Map<string, string>()
  const chronicleStore = useChronicleStore.getState()
  const chronicleSettings = chronicleStore.settings

  const withMetadata = <T extends DeltaOperation>(
    op: T,
    metadata: Record<string, unknown>,
  ): T => {
    const existing =
      (op as { metadata?: Record<string, unknown> }).metadata ?? {}
    return {
      ...op,
      metadata: { ...existing, ...metadata },
    } as T
  }

  const skipOperation = (op: DeltaOperation, reason: string) => {
    logger.warn('[chronicle][executor] Skipping operation %s: %s', op.type, reason)
    skippedOps.push(withMetadata(op, { skipReason: reason }))
  }

  const detectEquipConflicts = (
    inventory: Inventory,
    item: Item,
    itemId: string,
    targetSlot: InventoryEquipSlot | undefined,
  ): Item[] => {
    const equippedContainer = inventory.containers.find(
      (container) => container.category === 'equipped',
    )
    if (!equippedContainer) return []

    const equippedIds = equippedContainer.items.filter((id) => id !== itemId)
    const candidates = equippedIds
      .map((id) => inventory.items[id])
      .filter((candidate): candidate is Item => Boolean(candidate))

    if (candidates.length === 0) {
      return []
    }

    const conflicts = new Set<Item>()
    const isTwoHanded = hasTwoHandedTag(item)

    for (const candidate of candidates) {
      if (bundleMeta.explicitUnequipTargets.has(candidate.id)) {
        continue
      }

      if (isTwoHanded) {
        conflicts.add(candidate)
        continue
      }

      if (hasTwoHandedTag(candidate)) {
        conflicts.add(candidate)
        continue
      }

      if (targetSlot) {
        const slot = getEquippedSlot(inventory, candidate.id)
        if (slot && slot.toLowerCase() === targetSlot.toLowerCase()) {
          conflicts.add(candidate)
        }
      }
    }

    return Array.from(conflicts)
  }

  const formatConflictReason = (items: Item[]): string => {
    if (items.length === 0) return ''
    const names = items.map((conflict) => conflict.name ?? conflict.id)
    if (names.length === 1) {
      return `${names[0]} is already equipped`
    }
    const head = names.slice(0, -1).join(', ')
    const tail = names[names.length - 1]
    return `${head}, and ${tail} are already equipped`
  }

  const resolveMappedId = (rawId: string | undefined): string | undefined => {
    if (!rawId) return undefined
    return idMap.get(rawId) ?? rawId
  }

  validatedOps.forEach((op, index) => {
    if (!selection.has(index)) {
      skippedOps.push(op)
      return
    }

    switch (op.type) {
      case 'apply_damage': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const previousHP = character.hp.current
            const nextHP = Math.max(0, previousHP - op.amount)
            if (nextHP === previousHP) {
              skippedOps.push(op)
              return
            }

            characterState.updateHP(characterId, nextHP)
            chronicleStore.logResourceChange({
              type: 'hp',
              id: generateId('hp-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              delta: -op.amount,
              previous: previousHP,
              next: nextHP,
              reason: op.source ?? 'damage',
            })
            undoActions.push(() =>
              characterState.updateHP(characterId, previousHP),
            )
            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'heal': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const previousHP = character.hp.current
            const nextHP = Math.min(character.hp.max, previousHP + op.amount)
            if (nextHP === previousHP) {
              skippedOps.push(op)
              return
            }

            characterState.updateHP(characterId, nextHP)
            chronicleStore.logResourceChange({
              type: 'hp',
              id: generateId('hp-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              delta: op.amount,
              previous: previousHP,
              next: nextHP,
              reason: op.source ?? 'healing',
            })
            undoActions.push(() =>
              characterState.updateHP(characterId, previousHP),
            )
            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'mark_xp': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const previousXP = character.xp
            characterState.addXP(
              characterId,
              op.amount,
              op.reason ?? 'chronicle_automation',
              bundle.entryId,
            )
            const updated = characterState.getCharacter(characterId)
            chronicleStore.logResourceChange({
              type: 'xp',
              id: generateId('xp-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              amount: op.amount,
              previous: previousXP,
              next: updated?.xp ?? previousXP + op.amount,
              reason: op.reason ?? 'chronicle_automation',
            })
            undoActions.push(() =>
              characterState.updateCharacter(characterId, { xp: previousXP }),
            )
            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'add_coin': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const previousCoin = character.coin ?? 0
            characterState.updateCharacter(characterId, {
              coin: previousCoin + op.amount,
            })
            chronicleStore.logResourceChange({
              type: 'coin',
              id: generateId('coin-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              amount: op.amount,
              previous: previousCoin,
              next: previousCoin + op.amount,
            })
            undoActions.push(() =>
              characterState.updateCharacter(characterId, {
                coin: previousCoin,
              }),
            )
            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

            case 'spend_coin': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const previousCoin = character.coin ?? 0
            const requestedAmount = Math.abs(op.amount)
            if (requestedAmount <= 0) {
              skippedOps.push(op)
              return
            }

            const spendAmount = Math.min(requestedAmount, previousCoin)
            if (spendAmount <= 0) {
              skippedOps.push(op)
              return
            }

            const nextCoin = previousCoin - spendAmount
            characterState.updateCharacter(characterId, {
              coin: nextCoin,
            })
            chronicleStore.logResourceChange({
              type: 'coin',
              id: generateId('coin-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              amount: -spendAmount,
              previous: previousCoin,
              next: nextCoin,
            })
            undoActions.push(() =>
              characterState.updateCharacter(characterId, {
                coin: previousCoin,
              }),
            )
            const normalizedOp: DeltaOperation = {
              ...op,
              amount: spendAmount,
            }
            appliedOps.push(normalizedOp)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }
case 'add_debility': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const key =
              op.debility.toLowerCase() as keyof typeof character.debilities
            if (!(key in character.debilities) || character.debilities[key]) {
              skippedOps.push(op)
              return
            }

            const previousDebilities = { ...character.debilities }
            const updated = { ...character.debilities, [key]: true }
            characterState.updateCharacter(characterId, {
              debilities: updated,
            })
            chronicleStore.logResourceChange({
              type: 'debility',
              id: generateId('debility-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              debility: op.debility,
              action: 'add',
            })
            undoActions.push(() =>
              characterState.updateCharacter(characterId, {
                debilities: previousDebilities,
              }),
            )
            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'remove_debility': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const key =
              op.debility.toLowerCase() as keyof typeof character.debilities
            if (!(key in character.debilities) || !character.debilities[key]) {
              skippedOps.push(op)
              return
            }

            const previousDebilities = { ...character.debilities }
            const updated = { ...character.debilities, [key]: false }
            characterState.updateCharacter(characterId, {
              debilities: updated,
            })
            chronicleStore.logResourceChange({
              type: 'debility',
              id: generateId('debility-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              debility: op.debility,
              action: 'remove',
            })
            undoActions.push(() =>
              characterState.updateCharacter(characterId, {
                debilities: previousDebilities,
              }),
            )
            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'add_item': {
        const inventorySnapshot = recordInventorySnapshot()
        const store = useInventoryStore.getState()
        const rawId = op.item.id ?? generateId('item-')
        const actualId = rawId
        const item = toInventoryItem(op.item, actualId)

        ensureInventoryInitialized()
        store.addItemToInventory(item, 'carried')

        idMap.set(rawId, actualId)
        idMap.set(actualId, actualId)

        const inventory = ensureInventoryInitialized()
        const explicitEquipTargets = bundleMeta.explicitEquipTargets
        const hasExplicitEquip =
          (rawId && explicitEquipTargets.has(rawId)) ||
          explicitEquipTargets.has(actualId)

        let autoEquipUndo: UndoAction | null = null
        let autoEquipOp: DeltaOperation | null = null

        if (!hasExplicitEquip) {
          const autoSlot = resolveAutoEquipSlot(
            chronicleSettings,
            inventory,
            item,
          )
          if (autoSlot) {
            const conflicts = detectEquipConflicts(
              inventory,
              item,
              actualId,
              autoSlot,
            )
            if (conflicts.length > 0) {
              const autoOp = {
                type: 'equip_item',
                characterId: op.characterId,
                itemId: actualId,
                slot: autoSlot,
                reason: 'auto_equip_weapon',
              } as DeltaOperation
              skipOperation(
                autoOp,
                `${formatConflictReason(conflicts)}. Add unequip operations first.`,
              )
            } else {
              const equippedSnapshot = recordInventorySnapshot()
              store.setItemEquipped(actualId, true, autoSlot)
              autoEquipUndo = () => restoreInventorySnapshot(equippedSnapshot)

              const updatedInventory = ensureInventoryInitialized()
              const resolvedSlot =
                getEquippedSlot(updatedInventory, actualId) ?? autoSlot
              autoEquipOp = withMetadata(
                {
                  type: 'equip_item',
                  characterId: op.characterId,
                  itemId: actualId,
                  slot: resolvedSlot,
                  reason: 'auto_equip_weapon',
                } as DeltaOperation,
                {
                  autoAssigned: true,
                  previousSlot: null,
                  requestedSlot: resolvedSlot ?? autoSlot ?? null,
                },
              )
            }
          }
        }

        undoActions.push(() => restoreInventorySnapshot(inventorySnapshot))
        if (autoEquipUndo) undoActions.push(autoEquipUndo)

        appliedOps.push(op)
        if (autoEquipOp) appliedOps.push(autoEquipOp)
        break
      }

      case 'remove_item': {
        const store = useInventoryStore.getState()
        const resolvedId = resolveMappedId(op.itemId)
        if (!resolvedId) {
          skippedOps.push(op)
          break
        }

        const inventory = store.inventory
        if (!inventory || !inventory.items[resolvedId]) {
          skippedOps.push(op)
          break
        }

        const snapshot = recordInventorySnapshot()
        store.removeItemFromInventory(resolvedId)
        undoActions.push(() => restoreInventorySnapshot(snapshot))
        appliedOps.push(op)
        break
      }

      case 'add_item_tag': {
        const store = useInventoryStore.getState()
        const resolvedId = resolveMappedId(op.itemId)
        const inventory = store.inventory
        if (!resolvedId || !inventory) {
          skippedOps.push(op)
          break
        }

        const item = inventory.items[resolvedId]
        if (!item) {
          skippedOps.push(op)
          break
        }

        const tag = toTag(op.tag)
        const alreadyPresent = item.tags.some(
          (existing) =>
            existing.name === tag.name && existing.value === tag.value,
        )
        if (alreadyPresent) {
          skippedOps.push(op)
          break
        }

        const snapshot = recordInventorySnapshot()
        const updatedInventory: Inventory = {
          ...inventory,
          items: {
            ...inventory.items,
            [resolvedId]: {
              ...item,
              tags: [...item.tags, tag],
            },
          },
          containers: inventory.containers.map((container) => ({
            ...container,
            items: [...container.items],
          })),
          quickSlots: [...inventory.quickSlots],
          lastUpdated: new Date(),
        }

        store.setInventory(updatedInventory)
        undoActions.push(() => restoreInventorySnapshot(snapshot))
        appliedOps.push(op)
        break
      }

      case 'equip_item':
      case 'unequip_item': {
        const store = useInventoryStore.getState()
        const resolvedId = resolveMappedId(op.itemId)
        const inventory = store.inventory
        if (!resolvedId || !inventory) {
          skipOperation(op, 'Unable to resolve item for equip/unequip.')
          break
        }

        const item = inventory.items[resolvedId]
        if (!item) {
          skipOperation(op, `Item ${op.itemId} is not present in inventory.`)
          break
        }

        const shouldEquip = op.type === 'equip_item'
        const slotBefore = getEquippedSlot(inventory, resolvedId)
        const targetSlotHint = determineEquipSlotHint(item, op.slot, slotBefore)
        const opMetadata =
          (op as { metadata?: Record<string, unknown> }).metadata ?? {}
        const buildMetadata = (targetSlot: InventoryEquipSlot | undefined) => ({
          ...opMetadata,
          previousSlot: slotBefore ?? null,
          autoAssigned:
            opMetadata.autoAssigned ?? op.reason === 'auto_equip_weapon',
          requestedSlot:
            opMetadata.requestedSlot ??
            op.slot ??
            (shouldEquip ? targetSlot ?? null : slotBefore ?? null),
        })

        if (shouldEquip) {
          if (
            item.equipped &&
            (!targetSlotHint || targetSlotHint === slotBefore)
          ) {
            const slotValue = slotBefore ?? targetSlotHint ?? op.slot
            appliedOps.push(
              withMetadata(
                { ...op, slot: slotValue } as DeltaOperation,
                buildMetadata(slotValue ?? undefined),
              ),
            )
            break
          }

          const conflicts = detectEquipConflicts(
            inventory,
            item,
            resolvedId,
            targetSlotHint,
          )

          if (conflicts.length > 0) {
            const message = `${formatConflictReason(conflicts)}. Add unequip operations first.`
            skipOperation(op, message)
            break
          }
        } else if (!item.equipped) {
          const slotValue = slotBefore ?? targetSlotHint ?? op.slot
          appliedOps.push(
            withMetadata(
              { ...op, slot: slotValue } as DeltaOperation,
              buildMetadata(slotValue ?? undefined),
            ),
          )
          break
        }

        const snapshot = recordInventorySnapshot()
        if (shouldEquip) {
          store.setItemEquipped(resolvedId, true, targetSlotHint ?? slotBefore)
        } else {
          store.setItemEquipped(resolvedId, false)
        }
        undoActions.push(() => restoreInventorySnapshot(snapshot))

        const currentInventory = useInventoryStore.getState().inventory
        const resolvedSlot = shouldEquip
          ? currentInventory
            ? getEquippedSlot(currentInventory, resolvedId) ??
              targetSlotHint ??
              slotBefore
            : targetSlotHint ?? slotBefore
          : slotBefore ?? targetSlotHint ?? op.slot

        appliedOps.push(
          withMetadata(
            { ...op, slot: resolvedSlot } as DeltaOperation,
            buildMetadata(resolvedSlot ?? undefined),
          ),
        )
        break
      }

      
      case 'spend_ammo': {
        const characterId = resolveCharacterId(op.characterId)
        if (!characterId) {
          skippedOps.push(op)
          break
        }

        const state = characterStateService.getCharacterState(characterId)
        const resourceId = `ammo:${op.move.toLowerCase()}`
        const resource = state.resources.find(
          (entry) => entry.id === resourceId,
        )

        if (resource && resource.current >= op.amount) {
          const snapshot = resource.current
          characterStateService.updateResource(
            characterId,
            resourceId,
            resource.current - op.amount,
          )
          undoActions.push(() =>
            characterStateService.updateResource(
              characterId,
              resourceId,
              snapshot,
            ),
          )
          appliedOps.push(op)
          break
        }

        const store = useInventoryStore.getState()
        const inventory = store.inventory
        if (!inventory) {
          skippedOps.push(op)
          break
        }

        const candidate = Object.values(inventory.items).find((item) => {
          const ammoUses =
            item.uses?.current ?? tagValueToNumber(item.tags, 'ammo') ?? 0
          return (
            ammoUses >= op.amount &&
            (item.tags.some((tag) => tag.name.toLowerCase() === 'ammo') ||
              item.uses)
          )
        })

        if (!candidate) {
          skippedOps.push(op)
          break
        }

        const snapshot = recordInventorySnapshot()
        const updatedItem: Item = { ...candidate }

        if (updatedItem.uses) {
          updatedItem.uses = {
            ...updatedItem.uses,
            current: updatedItem.uses.current - op.amount,
          }
        } else {
          updatedItem.tags = updatedItem.tags.map((tag) =>
            tag.name.toLowerCase() === 'ammo'
              ? {
                  ...tag,
                  value: (tagValueToNumber([tag], 'ammo') ?? 0) - op.amount,
                }
              : tag,
          )
        }

        const updatedInventory: Inventory = {
          ...inventory,
          items: {
            ...inventory.items,
            [updatedItem.id]: updatedItem,
          },
          containers: inventory.containers.map((container) => ({
            ...container,
            items: [...container.items],
          })),
          quickSlots: [...inventory.quickSlots],
          lastUpdated: new Date(),
        }

        store.setInventory(updatedInventory)
        undoActions.push(() => restoreInventorySnapshot(snapshot))
        appliedOps.push(op)
        break
      }

      case 'mark_hold': {
        const characterId = resolveCharacterId(op.characterId)
        if (!characterId) {
          skippedOps.push(op)
          break
        }

        const before = recordHoldSnapshot(characterId)
        const holdStore = useHoldStore.getState()
        holdStore.grantHold(characterId, op.move, op.amount, bundle.entryId)

        const after = useHoldStore.getState().characterHolds[characterId] || []
        const newEntry = after.find(
          (entry) => !before.some((prev) => prev.id === entry.id),
        )
        if (!newEntry) {
          restoreHoldSnapshot(characterId, before)
          skippedOps.push(op)
          break
        }

        chronicleStore.logResourceChange({
          type: 'hold',
          id: generateId('hold-log-'),
          bundleId,
          entryId: bundle.entryId,
          createdAt: nowIso(),
          characterId,
          holdId: newEntry.id,
          moveId: newEntry.moveId,
          moveName: newEntry.moveName,
          change: op.amount,
          remaining: newEntry.amount,
        })

        undoActions.push(() => restoreHoldSnapshot(characterId, before))
        appliedOps.push(op)
        break
      }

      case 'spend_hold': {
        const characterId = resolveCharacterId(op.characterId)
        if (!characterId) {
          skippedOps.push(op)
          break
        }

        const holdStore = useHoldStore.getState()
        const holds = holdStore.getHoldsForMove(characterId, op.move)
        const target = holds.find((hold) => hold.amount >= op.amount)

        if (!target) {
          skippedOps.push(op)
          break
        }

        const before = recordHoldSnapshot(characterId)
        const success = holdStore.spendHold(
          characterId,
          target.id,
          undefined,
          op.amount,
        )
        if (!success) {
          restoreHoldSnapshot(characterId, before)
          skippedOps.push(op)
          break
        }

        const remainingHolds =
          useHoldStore.getState().characterHolds[characterId] || []
        const remainingEntry = remainingHolds.find(
          (entry) => entry.id === target.id,
        )
        const remainingAmount = remainingEntry ? remainingEntry.amount : 0

        chronicleStore.logResourceChange({
          type: 'hold',
          id: generateId('hold-log-'),
          bundleId,
          entryId: bundle.entryId,
          createdAt: nowIso(),
          characterId,
          holdId: target.id,
          moveId: target.moveId,
          moveName: target.moveName,
          change: -op.amount,
          remaining: remainingAmount,
        })

        undoActions.push(() => restoreHoldSnapshot(characterId, before))
        appliedOps.push(op)
        break
      }

      case 'level_up': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            if (op.newLevel <= character.level) {
              skippedOps.push(op)
              return
            }

            const threshold = getXPThreshold(character.level)
            const previousState = { level: character.level, xp: character.xp }
            const remainingXP =
              character.xp >= threshold
                ? character.xp - threshold
                : character.xp

            characterState.updateCharacter(characterId, {
              level: op.newLevel,
              xp: Math.max(0, remainingXP),
            })

            undoActions.push(() =>
              characterState.updateCharacter(characterId, previousState),
            )
            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'add_bond': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const bonds = character.bonds ?? []
            const newBondId = op.targetId || generateId('bond-')
            const targetCharacter = characterState.getCharacter(op.targetId)
            const chronicle = useChronicleStore.getState()
            const entity = chronicle.getEntity?.(op.targetId)

            const newBond = {
              id: newBondId,
              text: op.text,
              characterName:
                targetCharacter?.name ?? entity?.name ?? op.targetId,
              resolved: false,
            }

            const previousBonds = bonds.map((bond) => ({ ...bond }))
            characterState.updateCharacter(characterId, {
              bonds: [...bonds, newBond],
            })
            chronicleStore.logResourceChange({
              type: 'bond',
              id: generateId('bond-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              bondId: newBondId,
              targetId: op.targetId,
              text: op.text,
              action: 'add',
              resolved: false,
            })

            undoActions.push(() =>
              characterState.updateCharacter(characterId, {
                bonds: previousBonds,
              }),
            )
            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'resolve_bond': {
        const response = withCharacter(
          op.characterId,
          ({ characterId, characterState, character }) => {
            const bonds = character.bonds ?? []
            const index = bonds.findIndex(
              (bond) =>
                bond.id === op.targetId ||
                bond.characterName?.toLowerCase() === op.targetId.toLowerCase(),
            )
            if (index === -1) {
              skippedOps.push(op)
              return
            }

            const previousBonds = bonds.map((bond) => ({ ...bond }))
            const previousXP = character.xp
            const resolvedBond = bonds[index]
            const updatedBonds = bonds.map((bond, bondIndex) =>
              bondIndex === index ? { ...bond, resolved: true } : bond,
            )

            characterState.updateCharacter(characterId, {
              bonds: updatedBonds,
            })
            characterState.addXP(
              characterId,
              1,
              'bond_resolution',
              op.resolution,
            )
            const updatedCharacter = characterState.getCharacter(characterId)

            chronicleStore.logResourceChange({
              type: 'bond',
              id: generateId('bond-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              bondId:
                resolvedBond?.id ??
                (typeof op.targetId === 'string'
                  ? op.targetId
                  : generateId('bond-temp-')),
              targetId: resolvedBond?.id ?? op.targetId,
              text: resolvedBond?.text ?? op.resolution,
              action: 'resolve',
              resolved: true,
            })

            chronicleStore.logResourceChange({
              type: 'xp',
              id: generateId('xp-log-'),
              bundleId,
              entryId: bundle.entryId,
              createdAt: nowIso(),
              characterId,
              amount: 1,
              previous: previousXP,
              next: updatedCharacter?.xp ?? previousXP + 1,
              reason: 'bond_resolution',
              note: op.resolution,
            })

            undoActions.push(() => {
              characterState.updateCharacter(characterId, {
                bonds: previousBonds,
                xp: previousXP,
              })
            })

            appliedOps.push(op)
          },
        )

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'add_flag': {
        const response = withCharacter(op.characterId, ({ characterId }) => {
          const flagId = `flag:${op.flag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
          const condition: Condition = {
            id: flagId,
            name: `Flag: ${op.flag}`,
            description:
              op.description ?? 'Flag recorded by Chronicle automation.',
            effects: [],
            duration: 'permanent',
            severity: 'minor',
            source: 'chronicle',
          }

          const alreadyExists = characterStateService
            .getCharacterState(characterId)
            .conditions.some((c) => c.id === flagId)
          if (alreadyExists) {
            skippedOps.push(op)
            return
          }

          characterStateService.addCondition(characterId, condition)
          undoActions.push(() =>
            characterStateService.removeCondition(characterId, flagId),
          )
          appliedOps.push(op)
        })

        if (!response.ok) skippedOps.push(op)
        break
      }

      case 'create_entity': {
        const chronicle = useChronicleStore.getState()
        const entityId = chronicle.addEntity({
          name: op.entity.name,
          type: convertEntityType(op.entity.type),
          description: op.entity.description ?? '',
          firstMention: bundle.entryId,
          lastMention: bundle.entryId,
          appearances: [bundle.entryId],
          relationships: [],
          aliases: [],
          status: 'active',
          tags: op.entity.tags ?? [],
          importance: 1,
          userNotes: '',
        })

        if (op.entity.id) idMap.set(op.entity.id, entityId)
        idMap.set(entityId, entityId)

        recordEntityMention(entityId, bundle.entryId, {
          mentionText: op.entity.name,
          context: op.entity.description ?? undefined,
          entityType: convertEntityType(op.entity.type),
          createdAt: bundle.createdAt,
          source: 'automation',
        })

        undoActions.push(() => chronicle.deleteEntity(entityId))
        appliedOps.push(op)
        break
      }

      case 'link_entity': {
        const chronicle = useChronicleStore.getState()
        const fromId = resolveMappedId(op.fromId)
        const toId = resolveMappedId(op.toId)
        if (!fromId) {
          skipOperation(op, 'fromId could not be resolved to an entity.')
          break
        }
        if (!toId) {
          skipOperation(op, 'toId could not be resolved to an entity.')
          break
        }
        if (fromId === toId) {
          skipOperation(op, 'fromId and toId must reference different entities.')
          break
        }

        const relationshipType = convertRelationshipType(op.relationship.type)
        const strength = normalizeRelationshipStrength(op.relationship.strength)
        const confidence = normalizeRelationshipConfidence(
          op.relationship.confidence,
        )
        const status = normalizeRelationshipStatus(op.relationship.status)
        const description = op.relationship.description ?? op.context ?? ''

        const relationshipId = chronicle.addRelationship({
          fromEntityId: fromId,
          toEntityId: toId,
          type: relationshipType,
          strength,
          description,
          currentStatus: status,
          confidence,
        })

        recordEntityMention(fromId, bundle.entryId, {
          context: description || undefined,
          createdAt: bundle.createdAt,
          source: 'automation',
        })
        recordEntityMention(toId, bundle.entryId, {
          context: description || undefined,
          createdAt: bundle.createdAt,
          source: 'automation',
        })

        undoActions.push(() => chronicle.deleteRelationship(relationshipId))
        appliedOps.push({
          ...op,
          relationship: {
            ...op.relationship,
            type: relationshipType,
            strength,
            confidence,
            status,
          },
        })
        break
      }

      case 'add_note': {
        const chronicle = useChronicleStore.getState()
        const entityId = resolveMappedId(op.entityId)
        if (!entityId) {
          skipOperation(op, 'Entity ID could not be resolved for note attachment.')
          break
        }

        const entity = chronicle.getEntity(entityId)
        if (!entity) {
          skipOperation(op, `Entity ${entityId} was not found in the Chronicle store.`)
          break
        }

        const previousNotes = entity.userNotes ?? ''
        const updatedNotes = previousNotes
          ? `${previousNotes}\n${op.note}`
          : op.note

        chronicle.updateEntity(entityId, { userNotes: updatedNotes })
        recordEntityMention(entityId, bundle.entryId, {
          context: op.note,
          createdAt: bundle.createdAt,
          source: 'automation',
        })
        undoActions.push(() =>
          chronicle.updateEntity(entityId, { userNotes: previousNotes }),
        )
        appliedOps.push(op)
        break
      }

      default:
        logger.info('[chronicle][executor] No handler for op type', op.type)
        skippedOps.push(op)
        break
    }
  })

  const issuedAt = nowIso()
  const actor: 'auto' | 'manual' | 'system' | 'user' =
    request.autoApply ? 'auto' : 'manual'

  appliedBundles.set(bundleId, {
    undoActions,
    appliedOps,
    skippedOps,
    issuedAt,
    entryId: bundle.entryId,
    actor,
  })

  return {
    bundleId,
    appliedOps,
    skippedOps,
    undoHandle: {
      bundleId,
      issuedAt,
    },
  }
}

export async function undoChronicleBundle(
  bundleId: string,
  options: { actor?: 'auto' | 'manual' | 'system' | 'user' } = {},
): Promise<boolean> {
  const record = appliedBundles.get(bundleId)
  if (!record) return false

  const actor = options.actor ?? 'user'
  const chronicleStore = useChronicleStore.getState()

  for (const undo of [...record.undoActions].reverse()) {
    try {
      await Promise.resolve(undo())
    } catch (error) {
      logger.error('[chronicle][executor] Failed to undo action', error)
    }
  }

  chronicleStore.removeResourceHistoryForBundle(bundleId)

  chronicleStore.recordAuditEvent({
    id: generateId('audit-'),
    bundleId,
    entryId: record.entryId,
    action: 'undone',
    actor,
    timestamp: nowIso(),
    appliedOps: record.appliedOps,
    skippedOps: record.skippedOps,
  })

  appliedBundles.delete(bundleId)
  return true
}

export function getAppliedBundle(
  bundleId: string,
): AppliedBundleRecord | undefined {
  return appliedBundles.get(bundleId)
}

export function resetChronicleExecutorForTesting(): void {
  appliedBundles.clear()
}



