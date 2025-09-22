/**
 * Entity Preview - Modal for viewing detailed entity information
 */

import React from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Users,
  MapPin,
  Package,
  Calendar,
  HelpCircle,
  Building,
  Clock,
  Hash,
  Star,
  Eye,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { Entity, ChronicleEntry, EntityType } from '../../../types/chronicle'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../ui'
import { WikiView } from './WikiView'
import { useChronicleStore } from '../../../stores'

interface EntityPreviewProps {
  entity: Entity
  entries: ChronicleEntry[]
  onClose: () => void
}

// Icon mapping for entity types
const getEntityIcon = (type: EntityType) => {
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
const getEntityColor = (type: EntityType) => {
  switch (type) {
    case 'character':
      return 'bg-blue-100 text-blue-800'
    case 'location':
      return 'bg-green-100 text-green-800'
    case 'item':
      return 'bg-purple-100 text-purple-800'
    case 'event':
      return 'bg-orange-100 text-orange-800'
    case 'organization':
      return 'bg-red-100 text-red-800'
    case 'mystery':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const EntityPreview: React.FC<EntityPreviewProps> = ({
  entity,
  entries,
  onClose
}) => {
  const [showWiki, setShowWiki] = React.useState(false)
  const { getWikiPage } = useChronicleStore()
  // Get relevant entries for this entity
  const entityEntries = entries.filter(entry =>
    entry.parsedEntities.some(mention => mention.entityId === entity.id)
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant="magical" padding="none">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)', opacity: 0.2 }}
                >
                  <IconComponent
                    size={24}
                    style={{ color: 'var(--color-primary)' }}
                  />
                </div>
                <div>
                  <CardTitle className="text-xl">{entity.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={getEntityColor(entity.type)}
                    >
                      {entity.type}
                    </Badge>
                    {entity.importance > 75 && (
                      <Badge variant="secondary" className="gap-1 text-yellow-700 bg-yellow-100">
                        <Star size={12} className="fill-current" />
                        Important
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWiki(true)}
                  className="flex-shrink-0 gap-2"
                >
                  <BookOpen size={14} />
                  View Wiki
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="flex-shrink-0"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Description */}
              {entity.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {entity.description}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{entityEntries.length}</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Appearances
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{entity.importance}</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Importance
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Math.floor((Date.now() - entity.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Days Known
                  </div>
                </div>
              </div>

              {/* Tags */}
              {entity.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Hash size={16} />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {entity.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Aliases */}
              {entity.aliases.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Also Known As</h4>
                  <div className="flex flex-wrap gap-2">
                    {entity.aliases.map((alias, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Appearances */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock size={16} />
                  Recent Appearances
                </h4>
                <div className="space-y-3">
                  {entityEntries.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-sm font-medium">
                          {formatTimestamp(entry.timestamp)}
                        </div>
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          <Eye size={12} />
                          <ArrowRight size={12} />
                        </div>
                      </div>

                      <div className="text-sm leading-relaxed">
                        {/* Highlight entity mentions in the text */}
                        {entry.rawText.split(new RegExp(`(@${entity.name})`, 'gi')).map((part, index) =>
                          part.toLowerCase().includes(`@${entity.name.toLowerCase()}`) ? (
                            <mark
                              key={index}
                              className="bg-yellow-200 text-yellow-800 px-1 rounded"
                            >
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        )}
                      </div>

                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {entityEntries.length > 5 && (
                    <div
                      className="text-center py-2 text-sm"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      And {entityEntries.length - 5} more appearances...
                    </div>
                  )}
                </div>
              </div>

              {entityEntries.length === 0 && (
                <div className="text-center py-8">
                  <div className="opacity-50 mb-2">
                    <IconComponent size={48} />
                  </div>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    No chronicle entries yet for this entity.
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
        />
      )}
    </motion.div>
  )
}