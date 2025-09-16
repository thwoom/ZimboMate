/**
 * SpellItem Component for ZimboMate V2
 * Individual spell item with preparation and casting functionality
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Wand, Sparkles } from 'lucide-react'
import { Card, Badge, Button } from '../../ui'

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
  className = ''
}: SpellItemProps) {
  const getSpellSchoolColor = (school: string) => {
    const colors = {
      abjuration: 'bg-blue-500/20 text-blue-600',
      conjuration: 'bg-green-500/20 text-green-600',
      divination: 'bg-yellow-500/20 text-yellow-600',
      enchantment: 'bg-pink-500/20 text-pink-600',
      evocation: 'bg-red-500/20 text-red-600',
      illusion: 'bg-purple-500/20 text-purple-600',
      necromancy: 'bg-gray-500/20 text-gray-600',
      transmutation: 'bg-orange-500/20 text-orange-600'
    }
    return colors[school.toLowerCase()] || 'bg-gray-500/20 text-gray-600'
  }

  const getPreparationColor = (status: string) => {
    switch (status) {
      case 'prepared':
        return 'bg-green-500/20 text-green-600'
      case 'used':
        return 'bg-gray-500/20 text-gray-600'
      default:
        return 'bg-parchment-200/20 text-parchment-600'
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
          ${spell.preparationStatus === 'prepared' ? 'border-green-500/30' : ''}
        `}
        onClick={() => onSelect(spell)}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="text-body-lg font-display text-parchment-900">
                {spell.name}
              </h4>
              {spell.ritual && (
                <Sparkles size={14} className="text-magic-500" />
              )}
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">
                {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
              </Badge>
            </div>
          </div>

          {/* School and casting info */}
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getSpellSchoolColor(spell.school)}>
              {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
            </Badge>
            <Badge 
              variant="outline" 
              className={getPreparationColor(spell.preparationStatus)}
            >
              {spell.preparationStatus.replace('_', ' ')}
            </Badge>
          </div>

          {/* Casting details */}
          <div className="text-ui-small text-parchment-600 mb-3 space-y-1">
            <div className="flex justify-between">
              <span>Casting Time:</span>
              <span>{spell.castingTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Range:</span>
              <span>{spell.range}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>
                {spell.duration}
                {spell.concentration && ' (Concentration)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Components:</span>
              <span>{spell.components.join(', ').toUpperCase()}</span>
            </div>
          </div>

          {/* Description preview */}
          <p className="text-body-sm text-parchment-700 mb-4 line-clamp-2">
            {spell.description}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2">
            {spell.preparationStatus === 'not_prepared' && spell.level > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onPrepare(spell.id)
                }}
                className="flex-1"
              >
                Prepare
              </Button>
            )}
            
            {canCast && (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onCast(spell.id, spell.level)
                }}
                className="flex-1 gap-2"
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