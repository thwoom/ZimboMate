import type { DeltaOperation } from './types'
import { z } from 'zod'

const idSchema = z.string().min(1)

const characterIdSchema = idSchema.describe('Existing character identifier')
const itemIdSchema = idSchema.describe('Existing inventory item identifier')
const entityIdSchema = idSchema.describe('Existing entity identifier')

const inventoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  weight: z.number().optional(),
  quantity: z.number().int().positive().optional(),
  uses: z.number().int().nonnegative().optional(),
  coinValue: z.number().nonnegative().optional(),
  properties: z.array(z.string()).optional(),
  slotHint: z.string().optional(),
  isEquipped: z.boolean().optional(),
})

const entityInputSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  disposition: z.string().optional(),
})

const baseOperationSchema = z.object({ type: z.string() })

export const deltaOperationSchema = z.discriminatedUnion('type', [
  baseOperationSchema.extend({
    type: z.literal('apply_damage'),
    characterId: characterIdSchema,
    amount: z.number().positive(),
    source: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('heal'),
    characterId: characterIdSchema,
    amount: z.number().positive(),
    source: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('mark_xp'),
    characterId: characterIdSchema,
    amount: z.number().int().positive().max(5),
    reason: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('add_item'),
    characterId: characterIdSchema,
    item: inventoryItemSchema,
  }),
  baseOperationSchema.extend({
    type: z.literal('remove_item'),
    characterId: characterIdSchema,
    itemId: itemIdSchema,
  }),
  baseOperationSchema.extend({
    type: z.literal('add_item_tag'),
    itemId: itemIdSchema,
    tag: z.string(),
  }),
  baseOperationSchema.extend({
    type: z.literal('equip_item'),
    characterId: characterIdSchema,
    itemId: itemIdSchema,
    slot: z.string().optional(),
    reason: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('unequip_item'),
    characterId: characterIdSchema,
    itemId: itemIdSchema,
    slot: z.string().optional(),
    reason: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('level_up'),
    characterId: characterIdSchema,
    newLevel: z.number().int().positive(),
    picks: z
      .array(z.object({ move: z.string(), description: z.string().optional() }))
      .optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('spend_ammo'),
    characterId: characterIdSchema,
    amount: z.number().int().positive(),
    move: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('mark_hold'),
    characterId: characterIdSchema,
    move: z.string(),
    amount: z.number().int().nonnegative(),
  }),
  baseOperationSchema.extend({
    type: z.literal('spend_hold'),
    characterId: characterIdSchema,
    move: z.string(),
    amount: z.number().int().positive(),
  }),
  baseOperationSchema.extend({
    type: z.literal('add_debility'),
    characterId: characterIdSchema,
    debility: z.string(),
    reason: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('remove_debility'),
    characterId: characterIdSchema,
    debility: z.string(),
  }),
  baseOperationSchema.extend({
    type: z.literal('add_bond'),
    characterId: characterIdSchema,
    targetId: characterIdSchema,
    text: z.string(),
  }),
  baseOperationSchema.extend({
    type: z.literal('resolve_bond'),
    characterId: characterIdSchema,
    targetId: characterIdSchema,
    resolution: z.string(),
  }),
  baseOperationSchema.extend({
    type: z.literal('add_flag'),
    characterId: characterIdSchema,
    flag: z.string(),
    description: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('create_entity'),
    entity: entityInputSchema,
  }),
  baseOperationSchema.extend({
    type: z.literal('link_entity'),
    fromId: entityIdSchema,
    toId: entityIdSchema,
    relationship: z.string(),
    context: z.string().optional(),
  }),
  baseOperationSchema.extend({
    type: z.literal('add_note'),
    entityId: entityIdSchema,
    note: z.string(),
  }),
  baseOperationSchema.extend({
    type: z.literal('add_coin'),
    characterId: characterIdSchema,
    amount: z.number(),
    denomination: z.string().optional(),
  }),
])

export type ValidatedDeltaOperation = z.infer<typeof deltaOperationSchema>

export function validateDeltaOperations(
  ops: DeltaOperation[],
): ValidatedDeltaOperation[] {
  return ops.map((op) => deltaOperationSchema.parse(op))
}

export function deltaSchemasForResponses(): unknown {
  return deltaOperationSchema.options.map((option) => {
    const typeLiteral = option.shape.type.value
    const schema = option.omit({ type: true })
    return {
      name: typeLiteral,
      strict: true,
      parameters: schema.toJSON(),
    }
  })
}
