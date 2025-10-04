/**
 * Wiki View - Display auto-generated wiki pages for entities
 */

import type { Entity, EntityType, WikiPage } from '../../../types/chronicle'
import { motion } from 'framer-motion'
import {
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
  MapPin,
  Package,
  Search,
  Star,
  Users,
} from 'lucide-react'
import React from 'react'
import { logger } from '@/utils/logger'
import { useChronicleStore } from '../../../stores'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../ui'

interface WikiViewProps {
  entity: Entity
  wikiPage?: WikiPage
  onClose: () => void
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
}) => {
  const {
    generateWikiPage,
    getWikiPage,
    incrementWikiView,
    updateWikiPage,
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

  if (!displayWikiPage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='fixed inset-0 z-50 flex items-center justify-center p-4'
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
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
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
                              // Navigate to source entry (placeholder)
                              logger.info('Navigate to entry', fact.sourceEntryId)
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
                  {displayWikiPage.timeline.map((timelineEntry, index) => (
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
                            {timelineEntry.emotionalTone && (
                              <Badge variant='outline' className='text-xs'>
                                {timelineEntry.emotionalTone}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className='text-sm leading-relaxed mb-2'>
                          {timelineEntry.event}
                        </p>

                        <div className='text-xs text-muted-foreground'>
                          Context: {timelineEntry.context}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Relationships */}
            {displayWikiPage.relationshipSummary && (
              <div>
                <h3 className='font-medium mb-3 flex items-center gap-2'>
                  <Users size={16} />
                  Relationships
                </h3>
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
