/**
 * Entity Suggestion Panel - Autocomplete dropdown for @ mentions
 */

import type { Entity, EntityType } from '../../../types/chronicle'
import { motion } from 'framer-motion'
import {
  Building,
  Calendar,
  HelpCircle,
  MapPin,
  Package,
  Users,
} from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { Badge } from '../../ui'

interface EntitySuggestionPanelProps {
  suggestions: Entity[]
  onSelect: (entity: Entity) => void
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

export const EntitySuggestionPanel: React.FC<EntitySuggestionPanelProps> = ({
  suggestions,
  onSelect,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Handle clicks outside
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  if (suggestions.length === 0) {
    return null
  }

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className='absolute z-50 mt-1 w-80 rounded-lg border shadow-lg'
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        top: '100%',
        left: 0,
      }}
    >
      <div className='p-2'>
        <div className='text-xs font-medium mb-2 px-2 text-muted-foreground'>
          Entity Suggestions
        </div>
        <div className='max-h-64 overflow-y-auto'>
          {suggestions.map((entity) => {
            const IconComponent = getEntityIcon(entity.type)

            return (
              <button
                type='button'
                key={entity.id}
                onClick={() => onSelect(entity)}
                className='w-full text-left p-2 rounded-md hover:bg-black/5 transition-colors flex items-center gap-3'
              >
                <div className='flex-shrink-0'>
                  <IconComponent size={16} className='text-muted-foreground' />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='font-medium truncate'>{entity.name}</span>
                    <Badge
                      variant='secondary'
                      className={`text-xs ${getEntityColor(entity.type)}`}
                    >
                      {entity.type}
                    </Badge>
                  </div>

                  {entity.description && (
                    <div className='text-xs mt-1 line-clamp-1 text-muted-foreground'>
                      {entity.description}
                    </div>
                  )}

                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs text-muted-foreground'>
                      {entity.appearances.length} mentions
                    </span>
                    {entity.importance > 75 && (
                      <span className='text-xs text-chart-4'>★</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className='border-t mt-2 pt-2 border-border'>
          <div className='text-xs text-muted-foreground'>
            💡 New entity? Just type the name and it will be created
            automatically
          </div>
        </div>
      </div>
    </motion.div>
  )
}
