import type { ChronicleEntry } from '../../types/chronicle'

export type DeltaOperation =
  | ApplyDamageOp
  | HealOp
  | MarkXpOp
  | AddItemOp
  | RemoveItemOp
  | AddItemTagOp
  | EquipItemOp
  | UnequipItemOp
  | LevelUpOp
  | SpendAmmoOp
  | MarkHoldOp
  | SpendHoldOp
  | AddDebilityOp
  | RemoveDebilityOp
  | AddBondOp
  | ResolveBondOp
  | AddFlagOp
  | CreateEntityOp
  | LinkEntityOp
  | AddNoteOp
  | AddCoinOp

export interface ApplyDamageOp {
  type: 'apply_damage'

  characterId: string

  amount: number

  source?: string
}

export interface HealOp {
  type: 'heal'

  characterId: string

  amount: number

  source?: string
}

export interface MarkXpOp {
  type: 'mark_xp'

  characterId: string

  amount: number

  reason?: string
}

export interface AddItemOp {
  type: 'add_item'

  characterId: string

  item: InventoryItemInput
}

export interface RemoveItemOp {
  type: 'remove_item'

  characterId: string

  itemId: string
}

export interface AddItemTagOp {
  type: 'add_item_tag'

  itemId: string

  tag: string
}

export interface EquipItemOp {
  type: 'equip_item'

  characterId: string

  itemId: string

  slot?: string

  reason?: string
}

export interface UnequipItemOp {
  type: 'unequip_item'

  characterId: string

  itemId: string

  slot?: string

  reason?: string
}

export interface LevelUpOp {
  type: 'level_up'

  characterId: string

  newLevel: number

  picks?: LevelUpMovePick[]
}

export interface LevelUpMovePick {
  move: string

  description?: string
}

export interface SpendAmmoOp {
  type: 'spend_ammo'

  characterId: string

  amount: number

  move?: string
}

export interface MarkHoldOp {
  type: 'mark_hold'

  characterId: string

  move: string

  amount: number
}

export interface SpendHoldOp {
  type: 'spend_hold'

  characterId: string

  move: string

  amount: number
}

export interface AddDebilityOp {
  type: 'add_debility'

  characterId: string

  debility: string

  reason?: string
}

export interface RemoveDebilityOp {
  type: 'remove_debility'

  characterId: string

  debility: string
}

export interface AddBondOp {
  type: 'add_bond'

  characterId: string

  targetId: string

  text: string
}

export interface ResolveBondOp {
  type: 'resolve_bond'

  characterId: string

  targetId: string

  resolution: string
}

export interface AddFlagOp {
  type: 'add_flag'

  characterId: string

  flag: string

  description?: string
}

export interface CreateEntityOp {
  type: 'create_entity'

  entity: EntityInput
}

export interface LinkEntityOp {
  type: 'link_entity'

  fromId: string

  toId: string

  relationship: string

  context?: string
}

export interface AddNoteOp {
  type: 'add_note'

  entityId: string

  note: string
}

export interface AddCoinOp {
  type: 'add_coin'

  characterId: string

  amount: number

  denomination?: string
}

export interface InventoryItemInput {
  id?: string

  name: string

  description?: string

  tags?: string[]

  weight?: number

  quantity?: number

  uses?: number

  coinValue?: number

  properties?: string[]

  slotHint?: string

  isEquipped?: boolean
}

export interface EntityInput {
  id?: string

  name: string

  type: string

  description?: string

  tags?: string[]

  disposition?: string
}

export interface ChronicleContext {
  activeCharacterId?: string

  partyIds?: string[]

  locationId?: string

  moveContext?: {
    moveId: string

    result?: '10+' | '7-9' | '6-'

    rollTotal?: number
  }

  previousEntry?: Pick<ChronicleEntry, 'id' | 'rawText' | 'timestamp'>
}

export interface NarrativeSettings {
  tone: 'gritty' | 'heroic' | 'terse'

  verbosity: 'short' | 'standard' | 'long'

  costCapCents?: number

  autoApplyPolicy: Record<string, 'auto' | 'confirm' | 'off'>

  autoEquipWeapons?: boolean
}

export interface ProposeDeltasRequest {
  entryId: string

  rawText: string

  summary?: string

  context?: ChronicleContext

  settings: NarrativeSettings
}

export interface ProposedDeltaBundle {
  entryId: string

  narrative: string

  ops: DeltaOperation[]

  usage: TokenUsage

  reasoning?: string

  idempotencyKey: string

  model: string

  createdAt: string
}

export interface TokenUsage {
  inputTokens: number

  outputTokens: number

  totalTokens: number
}

export interface ProposeDeltasResponse {
  bundle: ProposedDeltaBundle

  warnings: string[]
}

export interface ApplyDeltaBundleRequest {
  bundle: ProposedDeltaBundle

  autoApply?: boolean
  selectedOpIndices?: number[]
}

export interface ApplyDeltaBundleResult {
  bundleId: string

  appliedOps: DeltaOperation[]

  skippedOps: DeltaOperation[]

  undoHandle: UndoHandle
}

export interface UndoHandle {
  bundleId: string

  issuedAt: string
}

export interface LlmProgressEvent {
  progress: number

  stage: string

  message?: string
}

export interface LlmTelemetryEvent {
  model: string

  latencyMs: number

  usage: TokenUsage

  costCents?: number
}
