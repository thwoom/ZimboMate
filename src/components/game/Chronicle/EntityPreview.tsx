/**
 * Entity Preview - Modal for viewing detailed entity information
 */

import type {
  ChronicleEntry,
  Entity,
  EntityType,
} from '../../../types/chronicle'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Building,
  Calendar,
  Clock,
  Hash,
  HelpCircle,
  MapPin,
  Package,
  Star,
  Users,
  X,
} from 'lucide-react'
import React from 'react'
import { buildMentionContext } from '@/components/chronicle/highlightUtils'
import { useChronicleStore } from '../../../stores'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../ui'
import { WikiView } from './WikiView'

interface EntityPreviewProps {
  entity: Entity
  entries: ChronicleEntry[]
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

export const EntityPreview: React.FC<EntityPreviewProps> = ({
  entity,
  entries,
  onClose,
  onNavigateToEntry,
}) => {
  const [showWiki, setShowWiki] = React.useState(false)
  const { getWikiPage } = useChronicleStore()
  // Get relevant entries for this entity
  const entityEntries = entries
    .filter((entry) =>
      entry.parsedEntities.some((mention) => mention.entityId === entity.id),
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

  const sortedMentionHistory = React.useMemo(() => {
    const history = Array.isArray(entity.mentionHistory)
      ? entity.mentionHistory
      : []
    return [...history].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [entity.mentionHistory])

  const mentionEntries = React.useMemo(() => {
    return sortedMentionHistory.slice(0, 5).map((mention) => ({
      mention,
      entry: entries.find((entry) => entry.id === mention.entryId),
    }))
  }, [sortedMentionHistory, entries])

  const handleMentionNavigate = (entryId: string) => {
    if (onNavigateToEntry) {
      onNavigateToEntry(entryId, entity.name)
    }
    onClose()
  }

  const IconComponent = getEntityIcon(entity.type)

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
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
        className='w-full max-w-2xl max-h-[90vh] overflow-hidden'
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
                  <CardTitle className='text-xl'>{entity.name}</CardTitle>
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
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowWiki(true)}
                  className='flex-shrink-0 gap-2'
                >
                  <BookOpen size={14} />
                  View Wiki
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onClose}
                  className='flex-shrink-0'
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className='max-h-[60vh] overflow-y-auto'>
            <div className='space-y-6'>
              {/* Description */}
              {entity.description && (
                <div>
                  <h4 className='font-medium mb-2'>Description</h4>
                  <p className='text-muted-foreground'>{entity.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className='grid grid-cols-3 gap-4 text-center'>
                <div>
                  <div className='text-2xl font-bold'>
                    {entityEntries.length}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Appearances
                  </div>
                </div>
                <div>
                  <div className='text-2xl font-bold'>{entity.importance}</div>
                  <div className='text-sm text-muted-foreground'>
                    Importance
                  </div>
                </div>
                <div>
                  <div className='text-2xl font-bold'>
                    {Math.floor(
                      (Date.now() - entity.createdAt.getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Days Known
                  </div>
                </div>
              </div>

              {/* Tags */}
              {entity.tags.length > 0 && (
                <div>
                  <h4 className='font-medium mb-2 flex items-center gap-2'>
                    <Hash size={16} />
                    Tags
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {entity.tags.map((tag) => (
                      <Badge key={tag} variant='secondary' className='text-xs'>
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Aliases */}
              {entity.aliases.length > 0 && (
                <div>
                  <h4 className='font-medium mb-2'>Also Known As</h4>
                  <div className='flex flex-wrap gap-2'>
                    {entity.aliases.map((alias) => (
                      <Badge key={alias} variant='outline' className='text-xs'>
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Mentions */}
              <div>
                <h4 className='font-medium mb-3 flex items-center gap-2'>
                  <Clock size={16} />
                  Recent Mentions
                </h4>
                <div className='space-y-3'>
                  {mentionEntries.map(({ mention, entry }) => {
                    const mentionDate = mention.createdAt
                      ? new Date(mention.createdAt)
                      : null
                    const mentionDateLabel =
                      mentionDate && !Number.isNaN(mentionDate.getTime())
                        ? formatTimestamp(mentionDate)
                        : mention.createdAt
                    const mentionContext = buildMentionContext(
                      mention,
                      entry?.rawText ?? entity.description ?? '',
                    )

                    return (
                      <button
                        type='button'
                        key={`${mention.entryId}-${mention.createdAt}`}
                        onClick={() => handleMentionNavigate(mention.entryId)}
                        className='w-full rounded-md border border-border/40 bg-muted/10 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30'
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <div className='space-y-1'>
                            <span className='text-sm font-semibold text-foreground'>
                              Entry {mention.entryId}
                            </span>
                            {mentionDateLabel && (
                              <span className='text-xs text-muted-foreground'>
                                {mentionDateLabel}
                              </span>
                            )}
                          </div>
                          <div className='flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground'>
                            <Badge
                              variant='outline'
                              className='text-[10px] uppercase tracking-wide'
                            >
                              {mention.entityType ?? entity.type}
                            </Badge>
                            {mention.source && (
                              <Badge
                                variant='outline'
                                className='text-[10px] uppercase tracking-wide'
                              >
                                {mention.source}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                          {mentionContext}
                        </div>

                        {entry?.tags?.length ? (
                          <div className='flex flex-wrap gap-1 mt-3'>
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
                        ) : null}
                      </button>
                    )
                  })}

                  {sortedMentionHistory.length > 5 && (
                    <div className='text-center py-2 text-sm text-muted-foreground'>
                      And {sortedMentionHistory.length - 5} more mentions...
                    </div>
                  )}
                </div>
              </div>

              {sortedMentionHistory.length === 0 && (
                <div className='text-center py-8'>
                  <div className='opacity-50 mb-2'>
                    <IconComponent size={48} />
                  </div>
                  <p className='text-muted-foreground'>
                    No chronicle mentions logged yet for this entity.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wiki View Modal */}
      {showWiki && (
        <WikiView
          entity={entity}
          wikiPage={getWikiPage(entity.id)}
          onClose={() => setShowWiki(false)}
          onNavigateToEntry={(entryId) => {
            if (onNavigateToEntry) {
              onNavigateToEntry(entryId, entity.name)
            }
            onClose()
          }}
        />
      )}
    </motion.div>
  )
}
