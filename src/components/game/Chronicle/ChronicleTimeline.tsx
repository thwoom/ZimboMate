/**
 * Chronicle Timeline - Chronological view of all chronicle entries
 */

import type {
  ChronicleEntry,
  Entity,
  EntityType,
} from '../../../types/chronicle'
import { motion } from 'framer-motion'
import {
  AtSign,
  Calendar,
  Clock,
  Hash,
  MapPin,
  Package,
  Sparkles,
  Users,
} from 'lucide-react'
import React, { Fragment } from 'react'
import { Badge, Card, CardContent } from '../../ui'

const escapeRegExp = (value: string) => value.replace(/[\^$.*+?()[\]{}|]/g, '\$&')

interface ChronicleTimelineProps {
  entries: ChronicleEntry[]
  entities: Entity[]
  searchQuery?: string
  onEntitySelect?: (entity: Entity) => void
}

// Icon mapping for entity types
function getEntityIcon(type: EntityType) {
  switch (type) {
    case 'character':
      return Users
    case 'location':
      return MapPin
    case 'item':
      return Package
    case 'event':
      return Calendar
    default:
      return Users
  }
}

// Color mapping for emotional tones
function getToneColor(tone?: string) {
  switch (tone) {
    case 'tense':
      return 'bg-destructive/15 text-destructive'
    case 'triumphant':
      return 'bg-chart-2/15 text-chart-2'
    case 'mysterious':
      return 'bg-accent/15 text-accent'
    case 'somber':
      return 'bg-muted text-foreground'
    case 'funny':
      return 'bg-chart-4/15 text-chart-4'
    default:
      return 'bg-primary/10 text-primary'
  }
}

export const ChronicleTimeline: React.FC<ChronicleTimelineProps> = ({
  entries,
  entities,
  searchQuery = '',
  onEntitySelect,
}) => {
  const renderHighlightedText = (entry: ChronicleEntry) => {
    if (!searchQuery) {
      return entry.rawText
    }

    const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi')
    let cursor = 0

    return entry.rawText.split(regex).map((segment, segmentIndex) => {
      const key = `${entry.id}-search-${cursor}`
      cursor += segment.length

      if (segmentIndex % 2 === 1) {
        return (
          <mark key={key} className='bg-yellow-200 text-chart-4 px-1 rounded'>
            {segment}
          </mark>
        )
      }

      return <Fragment key={key}>{segment}</Fragment>
    })
  }

  // Filter entries based on search query
  const filteredEntries = entries
    .filter((entry) => {
      if (!searchQuery) return true

      const lowerQuery = searchQuery.toLowerCase()
      return (
        entry.rawText.toLowerCase().includes(lowerQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        entry.parsedEntities.some((mention) => {
          const entity = entities.find((e) => e.id === mention.entityId)
          return entity?.name.toLowerCase().includes(lowerQuery)
        })
      )
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Get entity by ID
  const getEntity = (entityId: string) =>
    entities.find((e) => e.id === entityId)

  // Render entity mention as clickable badge
  const renderEntityMention = (mention: any, entry: ChronicleEntry) => {
    const entity = getEntity(mention.entityId)
    if (!entity) return null

    const IconComponent = getEntityIcon(entity.type)

    return (
      <button
        type='button'
        key={`${entry.id}-${mention.entityId}`}
        onClick={() => onEntitySelect?.(entity)}
        className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border hover:shadow-sm transition-all'
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--foreground)',
        }}
      >
        <IconComponent size={12} />
        {entity.name}
      </button>
    )
  }

  if (filteredEntries.length === 0) {
    return (
      <Card variant='surface'>
        <CardContent>
          <div className='text-center py-8'>
            <Clock size={48} className='mx-auto mb-4 opacity-50' />
            <h3 className='text-lg font-medium mb-2'>
              {searchQuery ? 'No Matching Entries' : 'No Chronicle Entries Yet'}
            </h3>
            <p className='text-muted-foreground'>
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Start writing your adventure story to see the timeline!'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Timeline Header */}
      <div className='flex items-center justify-between'>
        <h3 className='font-medium flex items-center gap-2'>
          <Clock size={16} />
          Chronicle Timeline
        </h3>
        <Badge variant='secondary'>{filteredEntries.length} entries</Badge>
      </div>

      {/* Timeline Entries */}
      <div className='space-y-4'>
        {filteredEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              variant={entry.isSceneBreak ? 'magical' : 'glass'}
              className='relative'
            >
              {/* Timeline Connector */}
              {index < filteredEntries.length - 1 && (
                <div className='absolute left-6 -bottom-4 w-0.5 h-8 z-10 bg-[color:var(--border)]' />
              )}

              {/* Timeline Dot */}
              <div
                className='absolute left-4 top-6 w-4 h-4 rounded-full border-2 z-20'
                style={{
                  backgroundColor: entry.isSceneBreak
                    ? 'var(--primary)'
                    : 'var(--card)',
                  borderColor: entry.isSceneBreak
                    ? 'var(--primary)'
                    : 'var(--border)',
                }}
              >
                {entry.isSceneBreak && (
                  <Sparkles
                    size={8}
                    className='absolute top-0.5 left-0.5 text-white'
                  />
                )}
              </div>

              <CardContent className='ml-8'>
                <div className='space-y-4'>
                  {/* Entry Header */}
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                      <div className='text-sm font-medium'>
                        {formatTimestamp(entry.timestamp)}
                      </div>
                      {entry.emotionalTone && (
                        <Badge
                          variant='secondary'
                          className={`text-xs ${getToneColor(entry.emotionalTone)}`}
                        >
                          {entry.emotionalTone}
                        </Badge>
                      )}
                      {entry.narrativeContext && (
                        <Badge variant='outline' className='text-xs'>
                          {entry.narrativeContext}
                        </Badge>
                      )}
                    </div>

                    {entry.isSceneBreak && (
                      <Badge variant='default' className='gap-1 magical-glow'>
                        <Sparkles size={12} />
                        Scene Break
                      </Badge>
                    )}
                  </div>

                  {/* Entry Content */}
                  <div className='prose prose-sm max-w-none'>
                    <div className='text-base leading-relaxed whitespace-pre-wrap'>
                      {/* Highlight search query if present */}
                      {renderHighlightedText(entry)}
                    </div>
                  </div>

                  {/* Entity Mentions */}
                  {entry.parsedEntities.length > 0 && (
                    <div className='space-y-2'>
                      <div className='text-sm font-medium flex items-center gap-2'>
                        <AtSign size={14} />
                        Entities Mentioned
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {entry.parsedEntities.map((mention) =>
                          renderEntityMention(mention, entry),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {entry.tags.length > 0 && (
                    <div className='space-y-2'>
                      <div className='text-sm font-medium flex items-center gap-2'>
                        <Hash size={14} />
                        Tags
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {entry.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant='secondary'
                            className='text-xs'
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Entry Metadata */}
                  {(entry.narrativeContext || entry.emotionalTone) && (
                    <div className='pt-2 border-t text-xs border-border'>
                      <div className='flex items-center gap-4 text-muted-foreground'>
                        {entry.narrativeContext && (
                          <span>
                            Context:
                            {entry.narrativeContext}
                          </span>
                        )}
                        {entry.emotionalTone && (
                          <span>
                            Tone:
                            {entry.emotionalTone}
                          </span>
                        )}
                        <span>
                          {entry.parsedEntities.length} entities |
                          {entry.tags.length} tags
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Timeline Footer */}
      {filteredEntries.length > 0 && (
        <Card variant='surface'>
          <CardContent>
            <div className='text-center text-sm text-muted-foreground'>
              That's the complete chronicle so far.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
