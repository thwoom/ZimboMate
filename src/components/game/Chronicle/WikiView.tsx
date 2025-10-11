/**
 * Wiki View - Display auto-generated wiki pages for entities
 */

import type { Entity, EntityType, WikiPage } from '../../../types/chronicle'
import { motion } from 'framer-motion'
import {
  AtSign,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Building,
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  Hash,
  HelpCircle,
  Lightbulb,
  Link2,
  MapPin,
  Package,
  Search,
  Star,
  Users,
} from 'lucide-react'
import React from 'react'
import {
  buildMentionContext,
  formatActorLabel,
  formatRelativeTimeFromNow,
} from '@/components/chronicle/highlightUtils'
import { useChronicleStore } from '../../../stores'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../ui'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../ui/hover-card'

interface WikiViewProps {
  entity: Entity
  wikiPage?: WikiPage
  onClose: () => void
  onNavigateToEntry?: (entryId: string, entityName?: string) => void
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
    case 'organization':
      return Building
    default:
      return HelpCircle
  }
}

// Color mapping for entity types
function getEntityColor(type: EntityType) {
  switch (type) {
    case 'character':
      return 'bg-primary/10 text-primary'
    case 'location':
      return 'bg-chart-2/15 text-chart-2'
    case 'item':
      return 'bg-accent/15 text-accent'
    case 'event':
      return 'bg-chart-4/15 text-chart-4'
    case 'organization':
      return 'bg-destructive/15 text-destructive'
    case 'mystery':
      return 'bg-muted text-foreground'
    default:
      return 'bg-muted text-foreground'
  }
}

// Format timeline importance
function getTimelineImportanceColor(importance: string) {
  switch (importance) {
    case 'high':
      return 'bg-destructive/15 text-destructive'
    case 'medium':
      return 'bg-chart-4/15 text-chart-4'
    case 'low':
      return 'bg-primary/10 text-primary'
    default:
      return 'bg-muted text-foreground'
  }
}

export const WikiView: React.FC<WikiViewProps> = ({
  entity,
  wikiPage,
  onClose,
  onNavigateToEntry,
}) => {
  const {
    generateWikiPage,
    getWikiPage,
    incrementWikiView,
    updateWikiPage,
    getEntry,
    getDeltaLog,
    setSelectedEntity,
    getLinkedEntities,
  } = useChronicleStore()

  // Get or generate wiki page
  const currentWikiPage = wikiPage || getWikiPage(entity.id)

  React.useEffect(() => {
    if (!currentWikiPage) {
      generateWikiPage(entity.id)
    } else {
      incrementWikiView(entity.id)
    }
  }, [entity.id, currentWikiPage, generateWikiPage, incrementWikiView])

  // Get fresh wiki page after generation
  const displayWikiPage = currentWikiPage || getWikiPage(entity.id)

  const mentionHistory = React.useMemo(
    () => (Array.isArray(entity.mentionHistory) ? entity.mentionHistory : []),
    [entity.mentionHistory],
  )

  const mysteriesWithIds = React.useMemo(() => {
    if (!displayWikiPage) {
      return []
    }

    const counts = new Map<string, number>()

    return displayWikiPage.mysteries.map((mystery) => {
      const normalized = mystery.trim().toLowerCase()
      const slug = normalized.replace(/[^a-z0-9]+/g, '-') || 'mystery'
      const nextCount = (counts.get(normalized) ?? 0) + 1
      counts.set(normalized, nextCount)

      const suffix = nextCount > 1 ? `-${nextCount}` : ''

      return {
        id: `${entity.id}-${slug}${suffix}`,
        text: mystery,
      }
    })
  }, [displayWikiPage, entity.id])

  const IconComponent = getEntityIcon(entity.type)

  const linkedEntityEdges = React.useMemo(() => {
    const toTimestamp = (value: Date | string | undefined) => {
      if (!value) return 0
      const date = value instanceof Date ? value : new Date(value)
      return Number.isNaN(date.getTime()) ? 0 : date.getTime()
    }

    const edges = getLinkedEntities(entity.id).filter(
      (edge) => edge.entity && edge.otherEntityId !== entity.id,
    )

    return edges
      .slice()
      .sort(
        (a, b) =>
          toTimestamp(b.relationship.lastUpdated) -
          toTimestamp(a.relationship.lastUpdated),
      )
  }, [entity.id, getLinkedEntities])

  const maxLinkedEntitiesToDisplay = 6
  const visibleLinkedEntities = React.useMemo(
    () => linkedEntityEdges.slice(0, maxLinkedEntitiesToDisplay),
    [linkedEntityEdges],
  )
  const hiddenLinkedEntityCount = Math.max(
    linkedEntityEdges.length - visibleLinkedEntities.length,
    0,
  )

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleBookmarkToggle = () => {
    if (displayWikiPage) {
      updateWikiPage(entity.id, {
        bookmarked: !displayWikiPage.bookmarked,
      })
    }
  }

  const handleRegenerateWiki = () => {
    generateWikiPage(entity.id)
  }

  const handleLinkedEntityNavigate = React.useCallback(
    (linkedEntityId: string) => {
      setSelectedEntity(linkedEntityId)
      incrementWikiView(linkedEntityId)
    },
    [incrementWikiView, setSelectedEntity],
  )

  if (!displayWikiPage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='fixed inset-0 z-[var(--layer-overlay-content)] flex items-center justify-center p-4'
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      >
        <Card variant='magical'>
          <CardContent>
            <div className='text-center py-8'>
              <div className='animate-pulse'>
                <BookOpen size={48} className='mx-auto mb-4 opacity-50' />
              </div>
              <h3 className='text-lg font-medium mb-2'>Generating Wiki Page</h3>
              <p className='text-muted-foreground'>
                Analyzing chronicle entries for {entity.name}
                ...
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-[var(--layer-overlay-content)] flex items-center justify-center p-4'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='w-full max-w-4xl max-h-[90vh] overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant='magical'>
          <CardHeader>
            <div className='flex items-start justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-lg flex items-center justify-center bg-primary/20'>
                  <IconComponent className='text-primary' size={24} />
                </div>
                <div>
                  <CardTitle className='text-xl flex items-center gap-2'>
                    <BookOpen size={20} />
                    {entity.name} - Wiki
                  </CardTitle>
                  <div className='flex items-center gap-2 mt-1'>
                    <Badge
                      variant='secondary'
                      className={getEntityColor(entity.type)}
                    >
                      {entity.type}
                    </Badge>
                    {entity.importance > 75 && (
                      <Badge
                        variant='secondary'
                        className='gap-1 text-chart-4 bg-chart-4/15'
                      >
                        <Star size={12} className='fill-current' />
                        Important
                      </Badge>
                    )}
                    <Badge variant='outline' className='gap-1 text-xs'>
                      <Eye size={12} />
                      {displayWikiPage.viewCount} views
                    </Badge>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBookmarkToggle}
                  className='flex-shrink-0'
                >
                  {displayWikiPage.bookmarked ? (
                    <BookmarkCheck size={16} className='text-chart-4' />
                  ) : (
                    <Bookmark size={16} />
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleRegenerateWiki}
                  className='flex-shrink-0'
                >
                  <Search size={16} />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onClose}
                  className='flex-shrink-0'
                >
                  ×
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className='max-h-[70vh] overflow-y-auto space-y-6'>
            {/* Auto-Generated Summary */}
            <div>
              <div className='bg-primary/10 border border-primary/30 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Lightbulb size={16} className='text-primary' />
                  <span className='font-medium text-primary'>
                    Auto-Generated Summary
                  </span>
                </div>
                <p className='text-primary leading-relaxed'>
                  {displayWikiPage.autoGeneratedSummary}
                </p>
                <div className='text-xs text-primary mt-2'>
                  Last generated:{' '}
                  {formatTimestamp(displayWikiPage.lastGenerated)}
                </div>
              </div>
            </div>

            {/* Key Facts */}
            {displayWikiPage.keyFacts.length > 0 && (
              <div>
                <h3 className='font-medium mb-3 flex items-center gap-2'>
                  <Hash size={16} />
                  Key Facts
                </h3>
                <div className='space-y-2'>
                  {displayWikiPage.keyFacts.map((fact, index) => (
                    <motion.div
                      key={fact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className='p-3 rounded-lg border'
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className='flex items-start justify-between gap-2'>
                        <p className='text-sm leading-relaxed flex-1'>
                          {fact.fact}
                        </p>
                        <div className='flex items-center gap-1'>
                          <Badge variant='outline' className='text-xs'>
                            {Math.round(fact.confidence * 100)}% confident
                          </Badge>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              if (onNavigateToEntry) {
                                onNavigateToEntry(
                                  fact.chronicleEntryId,
                                  entity.name,
                                )
                              }
                              onClose()
                            }}
                          >
                            <ExternalLink size={12} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {displayWikiPage.timeline.length > 0 && (
              <div>
                <h3 className='font-medium mb-3 flex items-center gap-2'>
                  <Clock size={16} />
                  Timeline
                </h3>
                <div className='space-y-3'>
                  {displayWikiPage.timeline.map((timelineEntry, index) => {
                    const entry = getEntry(timelineEntry.entryId)
                    const mentionRecord = mentionHistory.find(
                      (record) => record.entryId === timelineEntry.entryId,
                    )
                    const mentionContext = mentionRecord
                      ? buildMentionContext(
                          mentionRecord,
                          entry?.rawText ?? timelineEntry.context ?? '',
                        )
                      : null
                    const deltaLog = getDeltaLog(timelineEntry.entryId)
                    const actorLabel = deltaLog?.actor
                      ? formatActorLabel(deltaLog.actor)
                      : null

                    return (
                      <motion.div
                        key={timelineEntry.entryId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className='flex gap-4'
                      >
                        {/* Timeline connector */}
                        <div className='flex flex-col items-center'>
                          <div
                            className='w-3 h-3 rounded-full border-2'
                            style={{
                              backgroundColor:
                                timelineEntry.importance === 'high'
                                  ? 'var(--primary)'
                                  : 'var(--card)',
                              borderColor: 'var(--primary)',
                            }}
                          />
                          {index < displayWikiPage.timeline.length - 1 && (
                            <div className='w-0.5 h-8 mt-2 bg-[color:var(--border)]' />
                          )}
                        </div>

                        {/* Timeline content */}
                        <div className='flex-1 pb-4'>
                          <div className='flex items-start justify-between gap-2 mb-2'>
                            <div className='text-sm font-medium'>
                              {formatTimestamp(timelineEntry.timestamp)}
                            </div>
                            <div className='flex items-center gap-1'>
                              <Badge
                                variant='secondary'
                                className={`text-xs ${getTimelineImportanceColor(timelineEntry.importance)}`}
                              >
                                {timelineEntry.importance}
                              </Badge>
                              {actorLabel && (
                                <Badge
                                  variant='outline'
                                  className='text-[10px] uppercase tracking-wide'
                                >
                                  {actorLabel}
                                </Badge>
                              )}
                              {timelineEntry.emotionalTone && (
                                <Badge variant='outline' className='text-xs'>
                                  {timelineEntry.emotionalTone}
                                </Badge>
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-7 w-7 p-0 text-muted-foreground hover:text-foreground'
                                onClick={() => {
                                  if (onNavigateToEntry) {
                                    onNavigateToEntry(
                                      timelineEntry.entryId,
                                      entity.name,
                                    )
                                  }
                                  onClose()
                                }}
                              >
                                <ExternalLink size={12} />
                              </Button>
                            </div>
                          </div>

                          <p className='text-sm leading-relaxed mb-2'>
                            {timelineEntry.event}
                          </p>

                          {mentionContext ? (
                            <div className='mt-2 space-y-1 rounded-md border border-border/40 bg-muted/10 px-3 py-2'>
                              <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                <AtSign size={12} /> Mention context
                              </div>
                              <div className='text-sm leading-snug text-muted-foreground'>
                                {mentionContext}
                              </div>
                            </div>
                          ) : timelineEntry.context ? (
                            <div className='text-xs text-muted-foreground'>
                              Context: {timelineEntry.context}
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Relationships */}
            {(displayWikiPage.relationshipSummary ||
              visibleLinkedEntities.length > 0) && (
              <div>
                <h3 className='font-medium mb-3 flex items-center gap-2'>
                  <Users size={16} />
                  Relationships
                </h3>
                {displayWikiPage.relationshipSummary && (
                  <div
                    className='p-4 rounded-lg border'
                    style={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <p className='text-sm leading-relaxed'>
                      {displayWikiPage.relationshipSummary}
                    </p>
                  </div>
                )}
                {visibleLinkedEntities.length > 0 && (
                  <div className='mt-3 space-y-2'>
                    <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      <Link2 size={12} /> Linked entities
                    </div>
                    <div className='space-y-2'>
                      {visibleLinkedEntities.map((edge) => {
                        const linkedEntityName =
                          edge.entity?.name ?? edge.otherEntityId
                        const relationship = edge.relationship
                        const updatedAt =
                          relationship.lastUpdated instanceof Date
                            ? relationship.lastUpdated
                            : relationship.lastUpdated
                              ? new Date(relationship.lastUpdated)
                              : null
                        const updatedLabel =
                          updatedAt && !Number.isNaN(updatedAt.getTime())
                            ? formatRelativeTimeFromNow(updatedAt)
                            : null
                        const confidence =
                          typeof relationship.confidence === 'number'
                            ? `${Math.round(relationship.confidence * 100)}%`
                            : undefined

                        return (
                          <HoverCard key={relationship.id}>
                            <HoverCardTrigger asChild>
                              <button
                                type='button'
                                onClick={() =>
                                  handleLinkedEntityNavigate(edge.otherEntityId)
                                }
                                className='w-full rounded-md border border-border/40 bg-muted/15 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30'
                              >
                                <div className='flex flex-wrap items-start justify-between gap-2'>
                                  <div className='space-y-1'>
                                    <div className='text-sm font-semibold text-foreground'>
                                      {linkedEntityName}
                                    </div>
                                    {relationship.description && (
                                      <p className='text-xs leading-snug text-muted-foreground'>
                                        {relationship.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className='flex flex-wrap items-center gap-2'>
                                    {edge.entity?.type && (
                                      <Badge
                                        variant='outline'
                                        className='text-[10px] uppercase tracking-wide'
                                      >
                                        {edge.entity.type}
                                      </Badge>
                                    )}
                                    <Badge
                                      variant='outline'
                                      className='text-[10px] uppercase tracking-wide'
                                    >
                                      {relationship.type}
                                    </Badge>
                                  </div>
                                </div>
                                {(relationship.strength !== undefined ||
                                  updatedLabel) && (
                                  <div className='mt-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground'>
                                    {relationship.strength !== undefined && (
                                      <span>
                                        Strength {relationship.strength}
                                      </span>
                                    )}
                                    {updatedLabel && (
                                      <span>Updated {updatedLabel}</span>
                                    )}
                                  </div>
                                )}
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className='w-72 space-y-2 text-left'>
                              <div className='flex items-center justify-between gap-2'>
                                <span className='text-sm font-semibold text-foreground'>
                                  {linkedEntityName}
                                </span>
                                <Badge
                                  variant='outline'
                                  className='text-[10px] uppercase tracking-wide'
                                >
                                  {relationship.type}
                                </Badge>
                              </div>
                              <div className='grid gap-1 text-[11px] text-muted-foreground'>
                                {relationship.currentStatus && (
                                  <div className='flex items-center justify-between'>
                                    <span>Status</span>
                                    <span className='uppercase tracking-wide'>
                                      {relationship.currentStatus}
                                    </span>
                                  </div>
                                )}
                                {relationship.strength !== undefined && (
                                  <div className='flex items-center justify-between'>
                                    <span>Strength</span>
                                    <span>{relationship.strength}</span>
                                  </div>
                                )}
                                {confidence && (
                                  <div className='flex items-center justify-between'>
                                    <span>Confidence</span>
                                    <span>{confidence}</span>
                                  </div>
                                )}
                                {updatedLabel && (
                                  <div className='flex items-center justify-between'>
                                    <span>Last updated</span>
                                    <span>{updatedLabel}</span>
                                  </div>
                                )}
                              </div>
                              {relationship.history.length > 0 && (
                                <p className='text-[11px] text-muted-foreground'>
                                  {relationship.history.length} recorded events
                                </p>
                              )}
                            </HoverCardContent>
                          </HoverCard>
                        )
                      })}
                    </div>
                    {hiddenLinkedEntityCount > 0 && (
                      <div className='text-xs text-muted-foreground'>
                        +{hiddenLinkedEntityCount} more linked entities in
                        Chronicle
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mysteries */}
            {displayWikiPage.mysteries.length > 0 && (
              <div>
                <h3 className='font-medium mb-3 flex items-center gap-2'>
                  <HelpCircle size={16} />
                  Mysteries & Questions
                </h3>
                <div className='space-y-2'>
                  {mysteriesWithIds.map((mystery) => (
                    <div
                      key={mystery.id}
                      className='p-3 rounded-lg border border-purple-200 bg-accent/12'
                    >
                      <p className='text-sm text-accent leading-relaxed'>
                        {mystery.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Content Section */}
            {displayWikiPage.userContent && (
              <div>
                <h3 className='font-medium mb-3 flex items-center gap-2'>
                  <Edit size={16} />
                  Your Notes
                </h3>
                <div
                  className='p-4 rounded-lg border'
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                    {displayWikiPage.userContent}
                  </p>
                </div>
              </div>
            )}

            {/* Empty state for new entities */}
            {displayWikiPage.timeline.length === 0 &&
              displayWikiPage.keyFacts.length === 0 && (
                <div className='text-center py-8'>
                  <div className='opacity-50 mb-4'>
                    <BookOpen size={48} />
                  </div>
                  <h3 className='text-lg font-medium mb-2'>
                    Wiki Page Generated
                  </h3>
                  <p className='text-muted-foreground'>
                    As you mention {entity.name} in your chronicle entries, this
                    wiki will automatically populate with facts, timeline
                    events, and relationships.
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
