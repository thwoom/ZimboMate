import type {
  ChronicleDeltaLog,
  ChronicleEntry,
  Entity,
  EntityMention,
  Relationship,
} from '@/types/chronicle'

interface EntityLinkFixture {
  entry: ChronicleEntry
  entities: Array<Entity & { mentionHistory?: EntityMentionRecord[] }>
  relationships: Relationship[]
  deltaLog: ChronicleDeltaLog
}

interface EntityMentionRecord {
  entryId: string
  createdAt: string
  context?: string
  mentionText?: string
  entityType?: string
  source?: string
}

export function buildEntityLinkFixture(
  overrides: Partial<EntityLinkFixture> = {},
): EntityLinkFixture {
  const timestamp = new Date('2025-10-08T20:15:00.000Z')

  const entry: ChronicleEntry = {
    id: 'entry-linked-1',
    sessionId: 'session-1',
    timestamp,
    rawText: 'Aria confers with Lysa about the siege.',
    parsedEntities: [
      buildMention('entity-aria', 'Aria', 0, 4),
      buildMention('entity-lysa', 'Lysa', 16, 19),
    ],
    tags: [],
    isSceneBreak: false,
    narrativeContext: 'action',
    emotionalTone: 'tense',
  }

  const linkedRelationship: Relationship = {
    id: 'rel-aria-lysa',
    fromEntityId: 'entity-aria',
    toEntityId: 'entity-lysa',
    type: 'ally',
    strength: 3,
    description: 'Fought together at the Siege of Emberfall',
    history: [],
    currentStatus: 'active',
    confidence: 0.92,
    createdAt: timestamp,
    lastUpdated: timestamp,
  }

  const aria: Entity & { mentionHistory?: EntityMentionRecord[] } = {
    id: 'entity-aria',
    name: 'Aria Dawnsong',
    type: 'character',
    description: 'Captain of the Ember Guard.',
    firstMention: entry.id,
    lastMention: entry.id,
    appearances: [entry.id],
    relationships: [linkedRelationship],
    aliases: ['Captain Aria'],
    status: 'active',
    tags: ['commander'],
    importance: 72,
    createdAt: new Date('2025-09-15T12:00:00.000Z'),
    lastUpdated: timestamp,
    mentionHistory: [
      {
        entryId: entry.id,
        createdAt: timestamp.toISOString(),
        context: entry.rawText,
        mentionText: 'Aria',
        entityType: 'character',
      },
    ],
  }

  const lysa: Entity & { mentionHistory?: EntityMentionRecord[] } = {
    id: 'entity-lysa',
    name: 'Lysa Valen',
    type: 'character',
    description: 'Tactician of the Dawnsong Company.',
    firstMention: entry.id,
    lastMention: entry.id,
    appearances: [entry.id],
    relationships: [linkedRelationship],
    aliases: [],
    status: 'active',
    tags: ['strategist'],
    importance: 64,
    createdAt: new Date('2025-09-20T09:00:00.000Z'),
    lastUpdated: timestamp,
    mentionHistory: [
      {
        entryId: entry.id,
        createdAt: timestamp.toISOString(),
        context: entry.rawText,
        mentionText: 'Lysa',
        entityType: 'character',
      },
    ],
  }

  const deltaLog: ChronicleDeltaLog = {
    bundleId: 'bundle-linked-1',
    entryId: entry.id,
    appliedOps: [],
    skippedOps: [],
    createdAt: timestamp.toISOString(),
    actor: 'auto',
  }

  const baseFixture: EntityLinkFixture = {
    entry,
    entities: [aria, lysa],
    relationships: [linkedRelationship],
    deltaLog,
  }

  return {
    ...baseFixture,
    ...overrides,
    entities: overrides.entities ?? baseFixture.entities,
    relationships: overrides.relationships ?? baseFixture.relationships,
    entry: overrides.entry ?? baseFixture.entry,
    deltaLog: overrides.deltaLog ?? baseFixture.deltaLog,
  }
}

function buildMention(
  entityId: string,
  text: string,
  startIndex: number,
  endIndex: number,
): EntityMention {
  return {
    entityId,
    mentionText: text,
    startIndex,
    endIndex,
    confidence: 0.96,
    context: 'Aria confers with Lysa about the siege.',
  }
}
