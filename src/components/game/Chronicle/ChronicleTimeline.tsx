/**
 * Chronicle Timeline - Chronological view of all chronicle entries
 */

import type {
  ChronicleDeltaLog,
  ChronicleEntry,
  Entity,
  EntityMention,
  EntityType,
  ResourceHistoryState,
} from '../../../types/chronicle'
import type {
  MentionHighlight,
  ResourceChangeDisplay,
} from '@/components/chronicle/highlightUtils'
import { motion } from 'framer-motion'
import {
  AtSign,
  Calendar,
  Clock,
  Coins,
  Hash,
  MapPin,
  Package,
  Sparkles,
  Users,
} from 'lucide-react'
import React, { Fragment, useCallback, useMemo } from 'react'
import {
  buildMentionContext,
  collectMentionHighlights,
  collectResourceChanges,
  describeResourceChange,
  EMPTY_RESOURCE_HISTORY,
  formatActorLabel,
} from '@/components/chronicle/highlightUtils'
import { badgeVariants } from '@/components/ui/badge-variants'
import { cn } from '@/lib/utils'
import { Badge, Card, CardContent } from '../../ui'

const escapeRegExp = (value: string) =>
  value.replace(/[\^$.*+?()[\]{}|]/g, '\$&')

interface ChronicleTimelineProps {
  entries: ChronicleEntry[]
  entities: Entity[]
  resourceHistory: ResourceHistoryState
  getDeltaLog: (entryId: string) => ChronicleDeltaLog | undefined
  resolveCharacterName: (characterId?: string | null) => string
  searchQuery?: string
  tagFilters?: string[]
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

interface TimelineItem {
  entry: ChronicleEntry
  deltaLog: ChronicleDeltaLog | null
  directMentions: Array<{
    mention: EntityMention
    entity: Entity
  }>
  mentionHighlights: MentionHighlight[]
  resourceDisplay: ResourceChangeDisplay[]
  mentionContextFallback: string
  timestampLabel: string
}

export const ChronicleTimeline: React.FC<ChronicleTimelineProps> = ({
  entries,
  entities,
  resourceHistory,
  getDeltaLog,
  resolveCharacterName,
  searchQuery = '',
  tagFilters,
  onEntitySelect,
}) => {
  const handleEntityNavigate = useCallback(
    (entityId: string) => {
      if (!onEntitySelect) return
      const entity = entities.find((candidate) => candidate.id === entityId)
      if (entity) {
        onEntitySelect(entity)
      }
    },
    [entities, onEntitySelect],
  )

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
          <mark key={key} className='rounded bg-yellow-200 px-1 text-chart-4'>
            {segment}
          </mark>
        )
      }

      return <Fragment key={key}>{segment}</Fragment>
    })
  }

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const normalizedTagFilters = (tagFilters ?? []).map((tag) =>
      tag.toLowerCase(),
    )

    return entries
      .filter((entry) => {
        if (!query) return true

        return (
          entry.rawText.toLowerCase().includes(query) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          entry.parsedEntities.some((mention) => {
            const entity = entities.find(
              (candidate) => candidate.id === mention.entityId,
            )
            return entity?.name.toLowerCase().includes(query)
          })
        )
      })
      .filter((entry) => {
        if (normalizedTagFilters.length === 0) return true
        const entryTags = entry.tags.map((tag) => tag.toLowerCase())
        return normalizedTagFilters.every((tag) => entryTags.includes(tag))
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [entries, entities, searchQuery, tagFilters])

  const resourceHistoryState = (resourceHistory ??
    EMPTY_RESOURCE_HISTORY) as ResourceHistoryState

  const timelineItems = useMemo<TimelineItem[]>(() => {
    return filteredEntries.map((entry) => {
      const deltaLog = getDeltaLog(entry.id) ?? null

      const directMentions = entry.parsedEntities
        .map((mention) => {
          const entity = entities.find(
            (candidate) => candidate.id === mention.entityId,
          )
          if (!entity) return null
          return { mention, entity }
        })
        .filter(
          (value): value is { mention: EntityMention; entity: Entity } =>
            value !== null,
        )

      const bundleHighlights = collectMentionHighlights(deltaLog, entities)

      const fallbackHighlights: MentionHighlight[] = directMentions.map(
        ({ mention, entity }) => ({
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.type,
          record: {
            entryId: entry.id,
            mentionText: mention.mentionText,
            context: mention.context,
            startIndex: mention.startIndex,
            endIndex: mention.endIndex,
            confidence: mention.confidence,
            entityType: mention.entityType ?? entity.type,
            createdAt: entry.timestamp.toISOString(),
            source: 'parsed',
          },
        }),
      )

      const mentionHighlights = (
        bundleHighlights.length > 0 ? bundleHighlights : fallbackHighlights
      ).slice(0, 4)

      const resourceDisplay = collectResourceChanges(
        deltaLog,
        resourceHistoryState,
        entry.id,
      )
        .map((context) => describeResourceChange(context, resolveCharacterName))
        .filter((change): change is ResourceChangeDisplay => change !== null)
        .slice(0, 5)

      return {
        entry,
        deltaLog,
        directMentions,
        mentionHighlights,
        resourceDisplay,
        mentionContextFallback: entry.rawText,
        timestampLabel: formatTimestamp(entry.timestamp),
      }
    })
  }, [
    entities,
    filteredEntries,
    getDeltaLog,
    resolveCharacterName,
    resourceHistoryState,
  ])

  if (timelineItems.length === 0) {
    return (
      <Card variant='surface'>
        <CardContent>
          <div className='py-8 text-center'>
            <Clock size={48} className='mx-auto mb-4 opacity-50' />
            <h3 className='mb-2 text-lg font-medium'>
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
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h3 className='flex items-center gap-2 font-medium'>
          <Clock size={16} />
          Chronicle Timeline
        </h3>
        <div className='flex items-center gap-2'>
          {(tagFilters?.length ?? 0) > 0 && (
            <Badge variant='magical' className='text-[10px] uppercase'>
              Filtered
            </Badge>
          )}
          <Badge variant='outline'>{timelineItems.length} entries</Badge>
        </div>
      </div>

      <div className='space-y-4'>
        {timelineItems.map(
          (
            {
              entry,
              deltaLog,
              directMentions,
              mentionHighlights,
              resourceDisplay,
              mentionContextFallback,
              timestampLabel,
            },
            index,
          ) => {
            const hasAutomation = Boolean(deltaLog)
            const actorLabel = formatActorLabel(deltaLog?.actor)

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  variant={entry.isSceneBreak ? 'magical' : 'surface'}
                  className='relative overflow-hidden border-border/60 shadow-sm'
                >
                  {index < timelineItems.length - 1 && (
                    <div className='absolute left-6 -bottom-4 h-8 w-0.5 bg-border/70' />
                  )}

                  <CardContent className='space-y-5 pt-6'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
                          <Hash size={14} className='text-muted-foreground' />
                          Entry {entry.id}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {timestampLabel}
                        </p>
                      </div>
                      <div className='flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground'>
                        {hasAutomation && deltaLog?.appliedOps && (
                          <Badge
                            variant='outline'
                            className='gap-1 text-[11px]'
                          >
                            <Sparkles size={12} /> {deltaLog.appliedOps.length}{' '}
                            automation updates
                          </Badge>
                        )}
                        {hasAutomation && actorLabel && (
                          <Badge
                            variant='outline'
                            className='text-[10px] uppercase tracking-wide'
                          >
                            {actorLabel}
                          </Badge>
                        )}
                        {entry.emotionalTone && (
                          <span
                            className={cn(
                              'rounded-full px-3 py-1 text-[11px] font-medium',
                              getToneColor(entry.emotionalTone),
                            )}
                          >
                            {entry.emotionalTone}
                          </span>
                        )}
                        {entry.narrativeContext && (
                          <Badge variant='outline' className='text-[11px]'>
                            {entry.narrativeContext}
                          </Badge>
                        )}
                        {entry.isSceneBreak && (
                          <Badge
                            variant='magical'
                            className='gap-1 text-[11px]'
                          >
                            <Sparkles size={12} /> Scene Break
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className='prose prose-sm max-w-none'>
                      <div className='whitespace-pre-wrap text-base leading-relaxed text-foreground'>
                        {renderHighlightedText(entry)}
                      </div>
                    </div>

                    {(directMentions.length > 0 ||
                      mentionHighlights.length > 0) && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
                          <AtSign size={14} /> Entities Mentioned
                        </div>
                        {directMentions.length > 0 && (
                          <div className='flex flex-wrap gap-2'>
                            {directMentions.map(({ mention, entity }) => {
                              const IconComponent = getEntityIcon(entity.type)
                              return (
                                <button
                                  key={`${entry.id}-${entity.id}-${mention.startIndex}`}
                                  type='button'
                                  onClick={() =>
                                    handleEntityNavigate(entity.id)
                                  }
                                  className={cn(
                                    badgeVariants({ variant: 'outline' }),
                                    'gap-1 border-border/60 bg-card/40 text-xs font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30',
                                  )}
                                >
                                  <IconComponent size={12} />
                                  <span>{entity.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                        {mentionHighlights.length > 0 && (
                          <div className='space-y-1.5 text-xs text-muted-foreground'>
                            {mentionHighlights.map((highlight) => (
                              <button
                                key={`${entry.id}-highlight-${highlight.entityId}-${highlight.record.createdAt}`}
                                type='button'
                                onClick={() =>
                                  handleEntityNavigate(highlight.entityId)
                                }
                                className='w-full rounded-md border border-transparent bg-muted/10 px-3 py-2 text-left leading-snug transition-colors hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30'
                              >
                                <div className='flex items-center gap-2 font-semibold text-foreground'>
                                  <span>{highlight.entityName}</span>
                                  <Badge
                                    variant='outline'
                                    className='text-[10px] uppercase tracking-wide'
                                  >
                                    {highlight.entityType}
                                  </Badge>
                                </div>
                                <div className='mt-1 text-muted-foreground'>
                                  {buildMentionContext(
                                    highlight.record,
                                    mentionContextFallback,
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {resourceDisplay.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                          <Coins size={12} /> Resource updates
                        </div>
                        <div className='space-y-1'>
                          {resourceDisplay.map(
                            ({ key, Icon, colorClass, message, detail }) => (
                              <div
                                key={`${entry.id}-resource-${key}`}
                                className='flex items-center justify-between gap-3 rounded-md border border-border/40 bg-muted/10 px-2.5 py-1.5 text-xs'
                              >
                                <div className='flex items-center gap-2 text-foreground'>
                                  <Icon
                                    className={cn('h-3.5 w-3.5', colorClass)}
                                  />
                                  <span>{message}</span>
                                </div>
                                {detail && (
                                  <span className='text-muted-foreground'>
                                    {detail}
                                  </span>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {entry.tags.length > 0 && (
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
                          <Hash size={14} /> Tags
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          {entry.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant='outline'
                              className='text-xs'
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          },
        )}
      </div>

      <Card variant='surface'>
        <CardContent>
          <div className='text-center text-sm text-muted-foreground'>
            That's the complete chronicle so far.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatTimestamp(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleString()
}
