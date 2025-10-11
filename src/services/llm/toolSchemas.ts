import type { DeltaOperation } from './types'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const idSchema = z.string().min(1)

const characterIdSchema = idSchema.describe('Existing character identifier')
const itemIdSchema = idSchema.describe('Existing inventory item identifier')
const entityIdSchema = idSchema.describe('Existing entity identifier')
export const RELATIONSHIP_TYPE_VALUES = [
  'ally',
  'enemy',
  'family',
  'romantic',
  'business',
  'mentor',
  'unknown',
] as const
export type RelationshipTypeValue = (typeof RELATIONSHIP_TYPE_VALUES)[number]
export const RELATIONSHIP_METADATA: ReadonlyArray<{
  value: RelationshipTypeValue
  description: string
}> = [
  {
    value: 'ally',
    description:
      'Allies, companions, or otherwise cooperative entities working together.',
  },
  {
    value: 'enemy',
    description:
      'Hostile entities at odds with one another (active conflict or rivalry).',
  },
  {
    value: 'family',
    description:
      'Blood or chosen family ties such as siblings, parents, or kinship bonds.',
  },
  {
    value: 'romantic',
    description:
      'Romantic, intimate, or affectionate connection beyond camaraderie.',
  },
  {
    value: 'business',
    description:
      'Transactional or professional partnership like employer, patron, or client.',
  },
  {
    value: 'mentor',
    description:
      'Mentor, teacher, or patron guiding a student, squire, or apprentice.',
  },
  {
    value: 'unknown',
    description:
      'Relationship recorded but type unclear—requires player clarification.',
  },
] as const
const relationshipTypeSchema = z
  .enum(RELATIONSHIP_TYPE_VALUES)
  .describe(
    'Relationship type between the two entities (see metadata for definitions).',
  )

export const RELATIONSHIP_STATUS_VALUES = [
  'active',
  'dormant',
  'resolved',
  'unknown',
] as const
export type RelationshipStatusValue =
  (typeof RELATIONSHIP_STATUS_VALUES)[number]
export const RELATIONSHIP_STATUS_METADATA: ReadonlyArray<{
  value: RelationshipStatusValue
  description: string
}> = [
  {
    value: 'active',
    description:
      'Connection is current and relevant to the latest session context.',
  },
  {
    value: 'dormant',
    description:
      'Relationship exists but is not presently active or may resume later.',
  },
  {
    value: 'resolved',
    description:
      'Arc between the entities has concluded (e.g., quest finished, rivalry settled).',
  },
  {
    value: 'unknown',
    description:
      'Status is uncertain or needs player clarification before being trusted.',
  },
] as const
const relationshipStatusSchema = z
  .enum(RELATIONSHIP_STATUS_VALUES)
  .describe('Current status of the relationship between the entities.')

const linkRelationshipDetailsSchema = z
  .object({
    type: relationshipTypeSchema,
    strength: z
      .number()
      .int()
      .min(-10)
      .max(10)
      .optional()
      .describe(
        'Narrative strength score between -10 (hostile) and +10 (allied).',
      ),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe('Model confidence (0-1) that this relationship is correct.'),
    status: relationshipStatusSchema.optional(),
    description: z
      .string()
      .max(512)
      .optional()
      .describe('Short sentence describing the relationship context.'),
  })
  .describe('Details describing the relationship link being created.')

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

const baseOperationSchema = z.object({
  type: z.string(),
  metadata: z.record(z.any()).optional(),
})

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
    relationship: linkRelationshipDetailsSchema,
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
  baseOperationSchema.extend({
    type: z.literal('spend_coin'),
    characterId: characterIdSchema,
    amount: z.number().positive(),
    reason: z.string().optional(),
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
    const typeLiteral = option.shape.type.value as DeltaOperation['type']
    const schemaWithoutDiscriminator = option.omit({ type: true })
    const schemaJson = zodToJsonSchema(schemaWithoutDiscriminator, {
      $refStrategy: 'none',
      target: 'jsonSchema7',
    }) as {
      $schema?: string
      definitions?: unknown
      properties?: Record<string, unknown>
      required?: string[]
      [key: string]: unknown
    }

    delete schemaJson.$schema
    delete schemaJson.definitions

    const baseSchema = {
      name: typeLiteral,
      strict: true,
      parameters: schemaJson,
    }

    if (typeLiteral === 'link_entity') {
      return {
        ...baseSchema,
        metadata: {
          relationshipTypes: RELATIONSHIP_METADATA,
          relationshipStatuses: RELATIONSHIP_STATUS_METADATA,
          confidenceRange: [0, 1],
          strengthRange: [-10, 10],
        },
      }
    }

    return baseSchema
  })
}
