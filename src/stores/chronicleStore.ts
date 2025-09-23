/**
 * Chronicle Store - Zustand state management for Chronicle system
 * Handles all chronicle entries, entities, relationships, and wiki pages
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ChronicleEntry,
  Entity,
  Relationship,
  WikiPage,
  ChronicleSearchResult,
  NarrativeThread,
  ChronicleSettings,
  EntityType,
  RelationshipType,
  WikiFact,
  WikiTimelineEntry,
  RelationshipEvent
} from '../types/chronicle'

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

  // Actions - Chronicle Entries
  addEntry: (entry: Omit<ChronicleEntry, 'id'>) => string
  updateEntry: (id: string, updates: Partial<ChronicleEntry>) => void
  deleteEntry: (id: string) => void
  getEntry: (id: string) => ChronicleEntry | undefined
  getEntriesBySession: (sessionId: string) => ChronicleEntry[]

  // Actions - Entities
  addEntity: (entity: Omit<Entity, 'id' | 'createdAt' | 'lastUpdated'>) => string
  updateEntity: (id: string, updates: Partial<Entity>) => void
  deleteEntity: (id: string) => void
  getEntity: (id: string) => Entity | undefined
  getEntitiesByType: (type: EntityType) => Entity[]
  findEntityByName: (name: string, type?: EntityType) => Entity | undefined

  // Actions - Relationships
  addRelationship: (relationship: Omit<Relationship, 'id' | 'createdAt' | 'lastUpdated'>) => string
  updateRelationship: (id: string, updates: Partial<Relationship>) => void
  deleteRelationship: (id: string) => void
  getRelationship: (id: string) => Relationship | undefined
  getEntityRelationships: (entityId: string) => Relationship[]

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
}

// Default settings
const defaultSettings: ChronicleSettings = {
  autoEntityCreation: true,
  minimumConfidenceForAutoCreation: 0.7,
  enableVoiceInput: false,
  enableSmartSuggestions: true,
  parseOnType: true,
  defaultEntityTypes: ['character', 'location', 'item', 'event'],
  customTags: []
}

// Helper function to generate IDs
const generateId = (prefix: string = '') => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

// Helper function to calculate entity importance
const calculateEntityImportance = (entity: Entity, entries: ChronicleEntry[]): number => {
  // Factor in: mention frequency, recency, user bookmarking
  const mentionCount = entity.appearances.length
  const recentMentions = entity.appearances.filter(entryId => {
    const entry = entries.find(e => e.id === entryId)
    if (!entry) return false
    const daysSince = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24)
    return daysSince < 30 // Recent = within 30 days
  }).length

  // Weight: 40% total mentions, 40% recent mentions, 20% type importance
  const typeWeight = entity.type === 'character' ? 1.2 : entity.type === 'location' ? 1.1 : 1.0
  const importance = Math.min(100, (mentionCount * 0.4 + recentMentions * 0.4 + typeWeight * 20))

  return Math.round(importance)
}

// Helper function to extract key facts from chronicle entries
const extractKeyFacts = (entity: Entity, entries: ChronicleEntry[]): WikiFact[] => {
  const relevantEntries = entries.filter(entry =>
    entry.parsedEntities.some(mention => mention.entityId === entity.id)
  )

  const facts: WikiFact[] = []

  relevantEntries.forEach(entry => {
    // Extract factual statements about the entity
    const sentences = entry.rawText.split(/[.!?]+/).filter(s => s.trim().length > 0)

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase()
      const entityNameLower = entity.name.toLowerCase()

      // Look for factual patterns
      if (lowerSentence.includes(entityNameLower) &&
          (lowerSentence.includes(' is ') ||
           lowerSentence.includes(' has ') ||
           lowerSentence.includes(' owns ') ||
           lowerSentence.includes(' wears ') ||
           lowerSentence.includes(' lives '))) {

        facts.push({
          fact: sentence.trim(),
          confidence: 0.8,
          sourceEntryId: entry.id,
          extractedAt: new Date()
        })
      }
    })
  })

  // Remove duplicates and sort by confidence
  const uniqueFacts = facts.filter((fact, index, arr) =>
    index === arr.findIndex(f => f.fact.toLowerCase() === fact.fact.toLowerCase())
  ).sort((a, b) => b.confidence - a.confidence)

  return uniqueFacts.slice(0, 10) // Limit to top 10 facts
}

// Helper function to build timeline from chronicle entries
const buildEntityTimeline = (entity: Entity, entries: ChronicleEntry[]): WikiTimelineEntry[] => {
  const relevantEntries = entries.filter(entry =>
    entry.parsedEntities.some(mention => mention.entityId === entity.id)
  ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  return relevantEntries.map(entry => {
    const mention = entry.parsedEntities.find(m => m.entityId === entity.id)

    return {
      entryId: entry.id,
      timestamp: entry.timestamp,
      event: entry.rawText.length > 150
        ? `${entry.rawText.substring(0, 150)  }...`
        : entry.rawText,
      context: mention?.context || 'mentioned',
      importance: entry.isSceneBreak ? 'high' : 'medium',
      emotionalTone: entry.emotionalTone
    }
  })
}

// Helper function to analyze relationships for wiki
const generateRelationshipSummary = (entity: Entity, relationships: Relationship[]): string => {
  const entityRelationships = relationships.filter(rel =>
    rel.fromEntityId === entity.id || rel.toEntityId === entity.id
  )

  if (entityRelationships.length === 0) {
    return `No known relationships documented for ${entity.name}.`
  }

  const relationshipTexts = entityRelationships.map(rel => {
    const isSource = rel.fromEntityId === entity.id
    const otherEntityId = isSource ? rel.toEntityId : rel.fromEntityId
    const relationshipType = rel.type

    return `${relationshipType} relationship with entity ${otherEntityId}`
  })

  return `${entity.name} has ${relationshipTexts.join(', ')}.`
}

// Helper function to generate wiki summary
const generateWikiSummary = (entity: Entity, entries: ChronicleEntry[]): string => {
  const relevantEntries = entries.filter(entry =>
    entry.parsedEntities.some(mention => mention.entityId === entity.id)
  )

  if (relevantEntries.length === 0) {
    return `${entity.name} is ${entity.type === 'character' ? 'a character' : entity.type === 'location' ? 'a location' : `an ${entity.type}`} in your campaign.`
  }

  const firstMention = relevantEntries.find(e => e.id === entity.firstMention)
  const lastMention = relevantEntries.find(e => e.id === entity.lastMention)

  let summary = `${entity.name} is ${entity.type === 'character' ? 'a character' : entity.type === 'location' ? 'a location' : `an ${entity.type}`} `

  if (firstMention) {
    const context = `${firstMention.rawText.substring(0, 100)  }...`
    summary += `first mentioned when: "${context}"`
  }

  if (entity.appearances.length > 1 && lastMention && lastMention.id !== firstMention?.id) {
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

      // Chronicle Entries Actions
      addEntry: (entryData) => {
        const id = generateId('entry-')
        const entry: ChronicleEntry = {
          ...entryData,
          id,
          timestamp: new Date()
        }

        set((state) => ({
          entries: [...state.entries, entry]
        }))

        return id
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map(entry =>
            entry.id === id ? { ...entry, ...updates } : entry
          )
        }))
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter(entry => entry.id !== id)
        }))
      },

      getEntry: (id) => {
        return get().entries.find(entry => entry.id === id)
      },

      getEntriesBySession: (sessionId) => {
        return get().entries.filter(entry => entry.sessionId === sessionId)
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
          importance: 1 // Will be calculated later
        }

        set((state) => {
          const newEntities = [...state.entities, entity]
          // Recalculate importance
          entity.importance = calculateEntityImportance(entity, state.entries)

          return {
            entities: newEntities
          }
        })

        // Generate initial wiki page
        get().generateWikiPage(id)

        return id
      },

      updateEntity: (id, updates) => {
        set((state) => ({
          entities: state.entities.map(entity =>
            entity.id === id
              ? {
                  ...entity,
                  ...updates,
                  lastUpdated: new Date(),
                  importance: calculateEntityImportance({ ...entity, ...updates }, state.entries)
                }
              : entity
          )
        }))
      },

      deleteEntity: (id) => {
        set((state) => ({
          entities: state.entities.filter(entity => entity.id !== id),
          wikiPages: state.wikiPages.filter(page => page.entityId !== id),
          relationships: state.relationships.filter(rel =>
            rel.fromEntityId !== id && rel.toEntityId !== id
          )
        }))
      },

      getEntity: (id) => {
        return get().entities.find(entity => entity.id === id)
      },

      getEntitiesByType: (type) => {
        return get().entities.filter(entity => entity.type === type)
      },

      findEntityByName: (name, type) => {
        const { entities } = get()
        const lowerName = name.toLowerCase()

        return entities.find(entity => {
          if (type && entity.type !== type) return false

          const matchesName = entity.name.toLowerCase() === lowerName
          const matchesAlias = entity.aliases.some(alias =>
            alias.toLowerCase() === lowerName
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
          history: []
        }

        set((state) => ({
          relationships: [...state.relationships, relationship]
        }))

        return id
      },

      updateRelationship: (id, updates) => {
        set((state) => ({
          relationships: state.relationships.map(rel =>
            rel.id === id
              ? { ...rel, ...updates, lastUpdated: new Date() }
              : rel
          )
        }))
      },

      deleteRelationship: (id) => {
        set((state) => ({
          relationships: state.relationships.filter(rel => rel.id !== id)
        }))
      },

      getRelationship: (id) => {
        return get().relationships.find(rel => rel.id === id)
      },

      getEntityRelationships: (entityId) => {
        return get().relationships.filter(rel =>
          rel.fromEntityId === entityId || rel.toEntityId === entityId
        )
      },

      // Wiki Actions
      generateWikiPage: (entityId) => {
        const { entities, entries, relationships, wikiPages } = get()
        const entity = entities.find(e => e.id === entityId)
        if (!entity) return

        const existingPage = wikiPages.find(p => p.entityId === entityId)

        // Generate comprehensive wiki data
        const autoGeneratedSummary = generateWikiSummary(entity, entries)
        const keyFacts = extractKeyFacts(entity, entries)
        const timeline = buildEntityTimeline(entity, entries)
        const relationshipSummary = generateRelationshipSummary(entity, relationships)

        // Extract potential mysteries/questions about the entity
        const mysteries: string[] = []
        const relevantEntries = entries.filter(entry =>
          entry.parsedEntities.some(mention => mention.entityId === entity.id)
        )

        relevantEntries.forEach(entry => {
          // Look for questions or mysterious references
          const sentences = entry.rawText.split(/[.!?]+/).filter(s => s.trim().length > 0)
          sentences.forEach(sentence => {
            if ((sentence.includes('?') ||
                 sentence.toLowerCase().includes('mystery') ||
                 sentence.toLowerCase().includes('unknown') ||
                 sentence.toLowerCase().includes('secret')) &&
                sentence.toLowerCase().includes(entity.name.toLowerCase())) {
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
          bookmarked: existingPage?.bookmarked || false
        }

        set((state) => ({
          wikiPages: state.wikiPages.filter(p => p.entityId !== entityId).concat(wikiPage)
        }))
      },

      updateWikiPage: (entityId, updates) => {
        set((state) => ({
          wikiPages: state.wikiPages.map(page =>
            page.entityId === entityId
              ? { ...page, ...updates }
              : page
          )
        }))
      },

      getWikiPage: (entityId) => {
        return get().wikiPages.find(page => page.entityId === entityId)
      },

      incrementWikiView: (entityId) => {
        set((state) => ({
          wikiPages: state.wikiPages.map(page =>
            page.entityId === entityId
              ? { ...page, viewCount: page.viewCount + 1 }
              : page
          )
        }))
      },

      // Search Actions
      searchAll: (query) => {
        const { entries, entities } = get()
        const results: ChronicleSearchResult[] = []
        const lowerQuery = query.toLowerCase()

        // Search entries
        entries.forEach(entry => {
          if (entry.rawText.toLowerCase().includes(lowerQuery)) {
            const startIndex = entry.rawText.toLowerCase().indexOf(lowerQuery)
            const excerpt = entry.rawText.substring(
              Math.max(0, startIndex - 50),
              Math.min(entry.rawText.length, startIndex + 150)
            )

            results.push({
              type: 'entry',
              id: entry.id,
              title: `Entry from ${entry.timestamp.toLocaleDateString()}`,
              excerpt,
              relevanceScore: 1,
              matchedTerms: [query]
            })
          }
        })

        // Search entities
        entities.forEach(entity => {
          const nameMatch = entity.name.toLowerCase().includes(lowerQuery)
          const descMatch = entity.description.toLowerCase().includes(lowerQuery)
          const tagMatch = entity.tags.some(tag => tag.toLowerCase().includes(lowerQuery))

          if (nameMatch || descMatch || tagMatch) {
            results.push({
              type: 'entity',
              id: entity.id,
              title: entity.name,
              excerpt: entity.description,
              relevanceScore: nameMatch ? 2 : 1,
              matchedTerms: [query]
            })
          }
        })

        // Sort by relevance
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore)
      },

      searchEntries: (query) => {
        const { entries } = get()
        const lowerQuery = query.toLowerCase()

        return entries.filter(entry =>
          entry.rawText.toLowerCase().includes(lowerQuery) ||
          entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
      },

      searchEntities: (query) => {
        const { entities } = get()
        const lowerQuery = query.toLowerCase()

        return entities.filter(entity =>
          entity.name.toLowerCase().includes(lowerQuery) ||
          entity.description.toLowerCase().includes(lowerQuery) ||
          entity.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)) ||
          entity.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        )
      },

      // Session Management
      startSession: (campaignId) => {
        const sessionId = generateId('session-')

        set(() => ({
          currentSessionId: sessionId,
          currentCampaignId: campaignId || null
        }))

        return sessionId
      },

      endSession: () => {
        set(() => ({
          currentSessionId: null
        }))
      },

      getCurrentSession: () => {
        const { currentSessionId, entries } = get()
        if (!currentSessionId) return []

        return entries.filter(entry => entry.sessionId === currentSessionId)
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
          searchQuery: ''
        }))
      },

      exportData: () => {
        const { entries, entities, relationships, wikiPages, narrativeThreads } = get()
        return JSON.stringify({
          entries,
          entities,
          relationships,
          wikiPages,
          narrativeThreads,
          exportedAt: new Date(),
          version: '1.0'
        }, null, 2)
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          set(() => ({
            entries: parsed.entries || [],
            entities: parsed.entities || [],
            relationships: parsed.relationships || [],
            wikiPages: parsed.wikiPages || [],
            narrativeThreads: parsed.narrativeThreads || []
          }))
        } catch (error) {
          console.error('Failed to import chronicle data:', error)
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      }
    }),
    {
      name: 'chronicle-store',
      version: 1
    }
  )
)