/**
 * SpellItem Component for ZimboMate V2
 * Individual spell item with preparation and casting functionality
 */

import { motion } from 'framer-motion'
import { Sparkles, Wand } from 'lucide-react'
import React from 'react'
import { Badge, Button, Card } from '../../ui'

interface Spell {
  id: string
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string[]
  duration: string
  concentration: boolean
  ritual: boolean
  description: string
  damage?: string
  savingThrow?: string
  materialComponents?: string
  atHigherLevels?: string
  preparationStatus: 'not_prepared' | 'prepared' | 'used'
}

interface SpellItemProps {
  spell: Spell
  isSelected: boolean
  onSelect: (spell: Spell) => void
  onPrepare: (spellId: string) => void
  onCast: (spellId: string, level: number) => void
  className?: string
}

export function SpellItem({
  spell,
  isSelected,
  onSelect,
  onPrepare,
  onCast,
  className = '',
}: SpellItemProps) {
  const getSpellSchoolColor = (school: string) => {
    const colors = {
      abjuration: 'bg-primary/100/20 text-primary',
      conjuration: 'bg-chart-2/20 text-chart-2',
      divination: 'bg-chart-4/120/20 text-chart-4',
      enchantment: 'bg-accent/15 text-accent',
      evocation: 'bg-destructive/20 text-destructive',
      illusion: 'bg-accent/20 text-accent',
      necromancy: 'bg-muted/500/20 text-muted-foreground',
      transmutation: 'bg-chart-4/120/20 text-chart-4',
    }
    return (
      colors[school.toLowerCase()] || 'bg-muted/500/20 text-muted-foreground'
    )
  }

  const getPreparationColor = (status: string) => {
    switch (status) {
      case 'prepared':
        return 'bg-chart-2/20 text-chart-2'
      case 'used':
        return 'bg-muted/500/20 text-muted-foreground'
      default:
        return 'bg-card/20 text-muted-foreground'
    }
  }

  const canCast = spell.preparationStatus === 'prepared' || spell.level === 0

  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`
          cursor-pointer transition-all duration-200
          ${isSelected ? 'ring-2 ring-gold-400 magical-glow' : ''}
          ${spell.preparationStatus === 'prepared' ? 'border-chart-2/40/30' : ''}
        `}
        onClick={() => onSelect(spell)}
      >
        <div className='p-4'>
          {/* Header */}
          <div className='flex items-start justify-between mb-2'>
            <div className='flex items-center gap-2'>
              <h4 className='text-body-lg font-display text-foreground'>
                {spell.name}
              </h4>
              {spell.ritual && <Sparkles size={14} className='text-accent' />}
            </div>
            <div className='flex gap-1'>
              <Badge variant='outline' className='text-xs'>
                {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
              </Badge>
            </div>
          </div>

          {/* School and casting info */}
          <div className='flex items-center gap-2 mb-3'>
            <Badge className={getSpellSchoolColor(spell.school)}>
              {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
            </Badge>
            <Badge
              variant='outline'
              className={getPreparationColor(spell.preparationStatus)}
            >
              {spell.preparationStatus.replace('_', ' ')}
            </Badge>
          </div>

          {/* Casting details */}
          <div className='text-ui-small text-muted-foreground mb-3 space-y-1'>
            <div className='flex justify-between'>
              <span>Casting Time:</span>
              <span>{spell.castingTime}</span>
            </div>
            <div className='flex justify-between'>
              <span>Range:</span>
              <span>{spell.range}</span>
            </div>
            <div className='flex justify-between'>
              <span>Duration:</span>
              <span>
                {spell.duration}
                {spell.concentration && ' (Concentration)'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Components:</span>
              <span>{spell.components.join(', ').toUpperCase()}</span>
            </div>
          </div>

          {/* Description preview */}
          <p className='text-body-sm text-muted-foreground mb-4 line-clamp-2'>
            {spell.description}
          </p>

          {/* Action buttons */}
          <div className='flex gap-2'>
            {spell.preparationStatus === 'not_prepared' && spell.level > 0 && (
              <Button
                variant='outline'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  onPrepare(spell.id)
                }}
                className='flex-1'
              >
                Prepare
              </Button>
            )}

            {canCast && (
              <Button
                variant='default'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  onCast(spell.id, spell.level)
                }}
                className='flex-1 gap-2'
                disabled={spell.preparationStatus === 'used'}
              >
                <Wand size={14} />
                Cast
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
