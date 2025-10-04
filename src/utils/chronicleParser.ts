/**
 * Chronicle Parser - Entity recognition and text parsing for Chronicle system
 * Handles @ entity mentions, relationship inference, and narrative analysis
 */

import type {
  EmotionalTone,
  Entity,
  EntityMention,
  EntityType,
  InferredRelationship,
  NarrativeContext,
  ParseResult,
  RelationshipType,
} from '../types/chronicle'

// Regex patterns for entity recognition
const ENTITY_MENTION_PATTERN = /@([a-z][a-z0-9\s\-']+?)(?=[\s.,!?;:]|$)/gi
const SCENE_BREAK_PATTERNS = [
  /^(?:later|meanwhile|afterward|after|then|next|suddenly|eventually)/i,
  /^(?:chapter|scene|act)\s+\d+/i,
  /^-{3,}$/,
  /^\*{3,}$/,
  /^#{1,6}\s/,
]

// Common words that indicate relationships
const RELATIONSHIP_INDICATORS = {
  ally: [
    'friend',
    'ally',
    'partner',
    'companion',
    'helps',
    'assists',
    'supports',
  ],
  enemy: [
    'enemy',
    'foe',
    'rival',
    'opponent',
    'fights',
    'attacks',
    'opposes',
    'hates',
  ],
  family: [
    'father',
    'mother',
    'son',
    'daughter',
    'brother',
    'sister',
    'parent',
    'child',
  ],
  romantic: [
    'love',
    'romance',
    'marry',
    'kiss',
    'date',
    'boyfriend',
    'girlfriend',
    'husband',
    'wife',
  ],
  business: ['works', 'employee', 'boss', 'merchant', 'trade', 'sells', 'buys'],
  mentor: [
    'teaches',
    'mentor',
    'student',
    'learns',
    'trains',
    'master',
    'apprentice',
  ],
}

// Emotional tone keywords
const EMOTIONAL_TONE_KEYWORDS = {
  tense: [
    'tension',
    'nervous',
    'anxious',
    'worried',
    'afraid',
    'danger',
    'threat',
  ],
  triumphant: ['victory', 'success', 'triumph', 'celebrate', 'won', 'achieved'],
  mysterious: [
    'mystery',
    'unknown',
    'strange',
    'weird',
    'curious',
    'secret',
    'hidden',
  ],
  somber: ['sad', 'death', 'loss', 'grief', 'mourning', 'tragic', 'melancholy'],
  funny: ['laugh', 'funny', 'joke', 'humor', 'amusing', 'hilarious', 'comedy'],
}

// Context keywords for narrative classification
const NARRATIVE_CONTEXT_KEYWORDS = {
  setup: ['begin', 'start', 'introduce', 'meet', 'arrive', 'enter', 'setup'],
  action: [
    'fight',
    'battle',
    'run',
    'chase',
    'attack',
    'defend',
    'move',
    'act',
  ],
  consequence: [
    'result',
    'outcome',
    'effect',
    'because',
    'therefore',
    'consequently',
  ],
  reflection: ['think', 'wonder', 'remember', 'realize', 'understand', 'feel'],
  description: ['look', 'appear', 'seem', 'describe', 'notice', 'observe'],
}

// Entity type detection patterns
const ENTITY_TYPE_PATTERNS = {
  character: {
    patterns: [/\b(?:he|she|they|him|her|them)\b/i, /\bsays?\b/i, /\btalks?\b/i],
    keywords: ['person', 'character', 'npc', 'player', 'hero', 'villain'],
  },
  location: {
    patterns: [/\b(?:in|at|to|from|near)\s+@/i, /\btravels?\s+to\s+@/i],
    keywords: ['place', 'location', 'city', 'town', 'dungeon', 'room', 'area'],
  },
  organization: {
    patterns: [/\b(?:guild|clan|army|group|faction)\b/i],
    keywords: ['guild', 'organization', 'group', 'faction', 'clan', 'army'],
  },
  item: {
    patterns: [/\b(?:wielding|holding|carries|found|lost)\s+@/i],
    keywords: ['item', 'weapon', 'armor', 'treasure', 'artifact', 'object'],
  },
  event: {
    patterns: [/\b(?:during|after|before)\s+@/i],
    keywords: ['event', 'battle', 'ceremony', 'meeting', 'celebration'],
  },
  mystery: {
    patterns: [/\b(?:mystery|secret|unknown|question)\b/i],
    keywords: ['mystery', 'secret', 'question', 'puzzle', 'riddle'],
  },
}

export class ChronicleParser {
  private existingEntities: Map<string, Entity>

  constructor(entities: Entity[] = []) {
    this.existingEntities = new Map(
      entities.map((entity) => [entity.name.toLowerCase(), entity]),
    )

    // Also map aliases
    entities.forEach((entity) => {
      entity.aliases.forEach((alias) => {
        this.existingEntities.set(alias.toLowerCase(), entity)
      })
    })
  }

  /**
   * Parse text for entity mentions and extract metadata
   */
  parseText(text: string, entryId?: string): ParseResult {
    const entities = this.extractEntityMentions(text)
    const relationships = this.inferRelationships(text, entities, entryId)
    const narrativeContext = this.detectNarrativeContext(text)
    const emotionalTone = this.detectEmotionalTone(text)
    const isSceneBreak = this.detectSceneBreak(text)
    const extractedTags = this.extractHashtags(text)

    // Calculate overall confidence based on various factors
    const confidence = this.calculateOverallConfidence(
      entities,
      relationships,
      text,
    )

    return {
      entities,
      relationships,
      narrativeContext,
      emotionalTone,
      isSceneBreak,
      extractedTags,
      confidence,
    }
  }

  /**
   * Extract @entity mentions from text
   */
  private extractEntityMentions(text: string): EntityMention[] {
    const mentions: EntityMention[] = []
    const mentionPattern = new RegExp(
      ENTITY_MENTION_PATTERN.source,
      ENTITY_MENTION_PATTERN.flags,
    )

    for (const match of text.matchAll(mentionPattern)) {
      const mentionText = match[0] ?? '' // Full @mention
      const entityName = (match[1] ?? '').trim() // Name without @
      const startIndex = match.index ?? 0
      const endIndex = startIndex + mentionText.length

      // Get context around the mention
      const contextStart = Math.max(0, startIndex - 50)
      const contextEnd = Math.min(text.length, endIndex + 50)
      const context = text.substring(contextStart, contextEnd)

      // Try to resolve to existing entity
      const existingEntity = this.existingEntities.get(entityName.toLowerCase())

      const mention: EntityMention = {
        entityId: existingEntity?.id || this.generateEntityId(entityName),
        mentionText,
        startIndex,
        endIndex,
        confidence: existingEntity
          ? 0.9
          : this.calculateEntityConfidence(entityName, context),
        context,
      }

      mentions.push(mention)
    }

    return mentions
  }

  /**
   * Infer relationships between entities based on context
   */
  private inferRelationships(
    text: string,
    entities: EntityMention[],
    entryId?: string,
  ): InferredRelationship[] {
    const relationships: InferredRelationship[] = []

    // Look for relationships between entities mentioned close together
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i]
        const entity2 = entities[j]

        // Check if they're mentioned in the same sentence or nearby
        const distance = Math.abs(entity1.startIndex - entity2.startIndex)
        if (distance > 200) continue // Too far apart

        const contextStart =
          Math.min(entity1.startIndex, entity2.startIndex) - 50
        const contextEnd = Math.max(entity1.endIndex, entity2.endIndex) + 50
        const relationshipContext = text.substring(
          Math.max(0, contextStart),
          Math.min(text.length, contextEnd),
        )

        const inferredType = this.inferRelationshipType(relationshipContext)
        if (inferredType) {
          const relationship: InferredRelationship = {
            fromEntityId: entity1.entityId,
            toEntityId: entity2.entityId,
            type: inferredType.type,
            confidence: inferredType.confidence,
            evidence: relationshipContext.trim(),
            chronicleEntryId: entryId || '',
          }
          relationships.push(relationship)
        }
      }
    }

    return relationships
  }

  /**
   * Infer relationship type from context text
   */
  private inferRelationshipType(
    context: string,
  ): { type: RelationshipType; confidence: number } | null {
    const lowerContext = context.toLowerCase()

    for (const [relationshipType, keywords] of Object.entries(
      RELATIONSHIP_INDICATORS,
    )) {
      const matches = keywords.filter((keyword) =>
        lowerContext.includes(keyword),
      )
      if (matches.length > 0) {
        const confidence = Math.min(0.9, matches.length * 0.3)
        return {
          type: relationshipType as RelationshipType,
          confidence,
        }
      }
    }

    return null
  }

  /**
   * Detect narrative context of the text
   */
  private detectNarrativeContext(text: string): NarrativeContext | undefined {
    const lowerText = text.toLowerCase()
    let bestMatch: { context: NarrativeContext; score: number } | null = null

    for (const [contextType, keywords] of Object.entries(
      NARRATIVE_CONTEXT_KEYWORDS,
    )) {
      const matches = keywords.filter((keyword) => lowerText.includes(keyword))
      const score = matches.length

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          context: contextType as NarrativeContext,
          score,
        }
      }
    }

    return bestMatch?.context
  }

  /**
   * Detect emotional tone of the text
   */
  private detectEmotionalTone(text: string): EmotionalTone | undefined {
    const lowerText = text.toLowerCase()
    let bestMatch: { tone: EmotionalTone; score: number } | null = null

    for (const [toneType, keywords] of Object.entries(
      EMOTIONAL_TONE_KEYWORDS,
    )) {
      const matches = keywords.filter((keyword) => lowerText.includes(keyword))
      const score = matches.length

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          tone: toneType as EmotionalTone,
          score,
        }
      }
    }

    return bestMatch?.tone
  }

  /**
   * Detect if text represents a scene break
   */
  private detectSceneBreak(text: string): boolean {
    const trimmed = text.trim()

    return (
      SCENE_BREAK_PATTERNS.some((pattern) => pattern.test(trimmed)) ||
      (trimmed.length < 20 && /^(?:later|meanwhile|then|next)\.?$/i.test(trimmed))
    )
  }

  /**
   * Extract hashtags from text
   */
  private extractHashtags(text: string): string[] {
    const hashtagPattern = /#(\w+)/g
    const tags: string[] = []

    for (const match of text.matchAll(hashtagPattern)) {
      const tag = match[1]
      if (tag) {
        tags.push(tag)
      }
    }

    return [...new Set(tags)] // Remove duplicates
  }

  /**
   * Calculate confidence for entity recognition
   */
  private calculateEntityConfidence(
    entityName: string,
    context: string,
  ): number {
    let confidence = 0.5 // Base confidence for new entities

    // Boost confidence for capitalized names
    if (/^[A-Z]/.test(entityName)) {
      confidence += 0.2
    }

    // Boost confidence for multi-word names
    if (entityName.includes(' ')) {
      confidence += 0.1
    }

    // Try to detect entity type from context
    const detectedType = this.detectEntityType(entityName, context)
    if (detectedType) {
      confidence += 0.2
    }

    return Math.min(0.8, confidence) // Max 0.8 for new entities
  }

  /**
   * Detect entity type from name and context
   */
  private detectEntityType(
    entityName: string,
    context: string,
  ): EntityType | null {
    const lowerName = entityName.toLowerCase()
    const lowerContext = context.toLowerCase()

    for (const [entityType, typeData] of Object.entries(ENTITY_TYPE_PATTERNS)) {
      // Check patterns
      const patternMatch = typeData.patterns.some((pattern) =>
        pattern.test(context),
      )

      // Check keywords
      const keywordMatch = typeData.keywords.some(
        (keyword) =>
          lowerContext.includes(keyword) || lowerName.includes(keyword),
      )

      if (patternMatch || keywordMatch) {
        return entityType as EntityType
      }
    }

    // Default heuristics
    if (/^(?:the\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(entityName)) {
      return 'character' // Proper nouns are likely characters
    }

    return null
  }

  /**
   * Calculate overall parsing confidence
   */
  private calculateOverallConfidence(
    entities: EntityMention[],
    relationships: InferredRelationship[],
    text: string,
  ): number {
    if (entities.length === 0) return 0.1

    const avgEntityConfidence =
      entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length
    const avgRelationshipConfidence =
      relationships.length > 0
        ? relationships.reduce((sum, r) => sum + r.confidence, 0) /
          relationships.length
        : 0.5

    // Factor in text quality (longer, more structured text = higher confidence)
    const textQuality = Math.min(1, text.length / 100) * 0.2

    return Math.min(
      1,
      avgEntityConfidence * 0.6 + avgRelationshipConfidence * 0.3 + textQuality,
    )
  }

  /**
   * Generate a temporary entity ID for new entities
   */
  private generateEntityId(entityName: string): string {
    const normalized = entityName.toLowerCase().replace(/\s+/g, '-')
    return `entity-${normalized}-${Date.now()}`
  }

  /**
   * Update the parser with new entities
   */
  updateEntities(entities: Entity[]): void {
    this.existingEntities.clear()

    entities.forEach((entity) => {
      this.existingEntities.set(entity.name.toLowerCase(), entity)
      entity.aliases.forEach((alias) => {
        this.existingEntities.set(alias.toLowerCase(), entity)
      })
    })
  }

  /**
   * Get autocomplete suggestions for @ mentions
   */
  getEntitySuggestions(query: string, limit: number = 10): Entity[] {
    const lowerQuery = query.toLowerCase()
    const suggestions: { entity: Entity; score: number }[] = []

    for (const entity of this.existingEntities.values()) {
      if (suggestions.find((s) => s.entity.id === entity.id)) continue // Avoid duplicates

      const name = entity.name.toLowerCase()
      let score = 0

      if (name.startsWith(lowerQuery)) {
        score = 3 // Exact prefix match
      } else if (name.includes(lowerQuery)) {
        score = 2 // Contains match
      } else if (
        entity.aliases.some((alias) => alias.toLowerCase().includes(lowerQuery))
      ) {
        score = 1 // Alias match
      }

      if (score > 0) {
        // Boost score based on entity importance
        score += entity.importance / 100
        suggestions.push({ entity, score })
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.entity)
  }
}

/**
 * Helper function to create parser with entities
 */
export function createChronicleParser(entities: Entity[]): ChronicleParser {
  return new ChronicleParser(entities)
}

/**
 * Quick parse function for simple entity extraction
 */
export function parseEntityMentions(
  text: string,
  entities: Entity[] = [],
): EntityMention[] {
  const parser = new ChronicleParser(entities)
  const result = parser.parseText(text)
  return result.entities
}
