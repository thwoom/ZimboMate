import { describe, expect, it } from 'vitest'
import {
  RELATIONSHIP_METADATA,
  RELATIONSHIP_STATUS_METADATA,
  RELATIONSHIP_STATUS_VALUES,
  RELATIONSHIP_TYPE_VALUES,
  deltaSchemasForResponses,
} from '../toolSchemas'
import type { RelationshipType } from '@/types/chronicle'
import type {
  RelationshipStatusValue,
  RelationshipTypeValue,
} from '../toolSchemas'

type Assert<T extends true> = T
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2)
    ? (<T>() => T extends B ? 1 : 2) extends (<T>() => T extends A ? 1 : 2)
      ? true
      : false
    : false

type _RelationshipUnionMatches = Assert<
  Equal<RelationshipTypeValue, RelationshipType>
>
type _RelationshipStatusMatches = Assert<
  Equal<RelationshipStatusValue, 'active' | 'dormant' | 'resolved' | 'unknown'>
>

describe('toolSchemas', () => {
  it('exposes relationship metadata entries for every allowed relationship type', () => {
    const metadataValues = RELATIONSHIP_METADATA.map((entry) => entry.value)
    expect(metadataValues).toEqual(RELATIONSHIP_TYPE_VALUES)

    for (const entry of RELATIONSHIP_METADATA) {
      expect(entry.description).toMatch(/\w+/)
    }
  })

  it('serializes link_entity schema with relationship enum and metadata', () => {
    const schemas = deltaSchemasForResponses() as Array<{
      name: string
      strict: boolean
      parameters: {
        type: string
        properties: Record<string, any>
        required?: string[]
      }
      metadata?: Record<string, unknown>
    }>

    const linkSchema = schemas.find((schema) => schema.name === 'link_entity')
    expect(linkSchema).toBeDefined()
    expect(linkSchema?.strict).toBe(true)
    expect(linkSchema?.metadata).toBeDefined()

    const metadata = linkSchema!.metadata as {
      relationshipTypes?: unknown
      relationshipStatuses?: unknown
      confidenceRange?: unknown
      strengthRange?: unknown
    }
    expect(metadata.relationshipTypes).toEqual(RELATIONSHIP_METADATA)
    expect(metadata.relationshipStatuses).toEqual(RELATIONSHIP_STATUS_METADATA)
    expect(metadata.confidenceRange).toEqual([0, 1])
    expect(metadata.strengthRange).toEqual([-10, 10])

    const parameters = linkSchema!.parameters
    expect(parameters.type).toBe('object')
    expect(parameters.required).toContain('relationship')

    const relationshipSchema = parameters.properties.relationship
    expect(relationshipSchema.type).toBe('object')
    expect(relationshipSchema.required).toContain('type')

    const relationshipProperties = relationshipSchema.properties as Record<
      string,
      any
    >
    expect(relationshipProperties.type.enum).toEqual(
      Array.from(RELATIONSHIP_TYPE_VALUES),
    )
    expect(relationshipProperties.status?.enum).toEqual(
      Array.from(RELATIONSHIP_STATUS_VALUES),
    )
    expect(relationshipProperties.strength?.minimum).toBe(-10)
    expect(relationshipProperties.strength?.maximum).toBe(10)
    expect(relationshipProperties.confidence?.minimum).toBe(0)
    expect(relationshipProperties.confidence?.maximum).toBe(1)
  })
})
