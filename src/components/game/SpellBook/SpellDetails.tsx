/**
 * SpellDetails Component for ZimboMate V2
 * Comprehensive spell information display with casting details
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Wand, Clock, Target, Zap, Eye, Sparkles } from 'lucide-react'
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

interface SpellDetailsProps {
  spell: Spell | null
  onCast?: (spellId: string, level: number) => void
  onPrepare?: (spellId: string) => void
  className?: string
}

export function SpellDetails({ 
  spell, 
  onCast, 
  onPrepare, 
  className = '' 
}: SpellDetailsProps) {
  if (!spell) {
    return (
      <motion.div
        className={`spell-book-page p-8 rounded-lg flex items-center justify-center ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center text-muted-foreground">
          <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-body-lg">Select a spell to view details</p>
        </div>
      </motion.div>
    )
  }

  const getSpellSchoolColor = (school: string) => {
    const colors = {
      abjuration: 'text-primary',
      conjuration: 'text-chart-2',
      divination: 'text-chart-4',
      enchantment: 'text-accent',
      evocation: 'text-destructive',
      illusion: 'text-accent',
      necromancy: 'text-muted-foreground',
      transmutation: 'text-chart-4'
    }
    return colors[school.toLowerCase()] || 'text-muted-foreground'
  }

  const canCast = spell.preparationStatus === 'prepared' || spell.level === 0

  return (
    <motion.div
      className={`spell-book-page p-6 rounded-lg ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      key={spell.id}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-display-md text-foreground font-display">
            {spell.name}
          </h2>
          <div className="flex items-center gap-2">
            {spell.ritual && (
              <Sparkles size={20} className="text-accent" />
            )}
            {spell.concentration && (
              <Eye size={20} className="text-primary" />
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="font-display">
            {spell.level === 0 ? 'Cantrip' : `${spell.level}${getOrdinalSuffix(spell.level)} Level`}
          </Badge>
          <Badge className={`${getSpellSchoolColor(spell.school)} bg-transparent border-current`}>
            {spell.school.charAt(0).toUpperCase() + spell.school.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Casting Information */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <div>
              <div className="text-ui-small text-muted-foreground">Casting Time</div>
              <div className="text-ui-regular">{spell.castingTime}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Target size={16} className="text-muted-foreground" />
            <div>
              <div className="text-ui-small text-muted-foreground">Range</div>
              <div className="text-ui-regular">{spell.range}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-muted-foreground" />
            <div>
              <div className="text-ui-small text-muted-foreground">Duration</div>
              <div className="text-ui-regular">
                {spell.duration}
                {spell.concentration && ' (C)'}
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-ui-small text-muted-foreground">Components</div>
            <div className="text-ui-regular">{spell.components.join(', ').toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Material Components */}
      {spell.materialComponents && (
        <div className="mb-6 p-3 bg-parchment-100/50 rounded-lg border border-parchment-300/30">
          <div className="text-ui-small text-muted-foreground mb-1">Material Components</div>
          <div className="text-ui-regular italic">{spell.materialComponents}</div>
        </div>
      )}

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-body-lg font-display text-foreground mb-2">Description</h3>
        <p className="text-body-regular text-muted-foreground leading-relaxed">
          {spell.description}
        </p>
      </div>

      {/* Damage/Effects */}
      {spell.damage && (
        <div className="mb-4 p-3 bg-destructive/12 rounded-lg border border-destructive/30">
          <div className="text-ui-small text-destructive mb-1">Damage</div>
          <div className="text-ui-regular font-mono">{spell.damage}</div>
          {spell.savingThrow && (
            <div className="text-ui-small text-destructive mt-1">
              Saving Throw: {spell.savingThrow}
            </div>
          )}
        </div>
      )}

      {/* At Higher Levels */}
      {spell.atHigherLevels && (
        <div className="mb-6 p-3 bg-magic-50 rounded-lg border border-magic-200">
          <div className="text-ui-small text-accent mb-1">At Higher Levels</div>
          <p className="text-ui-regular text-accent">{spell.atHigherLevels}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-parchment-300/30">
        {spell.preparationStatus === 'not_prepared' && spell.level > 0 && onPrepare && (
          <Button
            variant="outline"
            onClick={() => onPrepare(spell.id)}
            className="flex-1"
          >
            Prepare Spell
          </Button>
        )}
        
        {canCast && onCast && (
          <Button
            variant="default"
            onClick={() => onCast(spell.id, spell.level)}
            disabled={spell.preparationStatus === 'used'}
            className="flex-1 gap-2 magical-glow"
          >
            <Wand size={16} />
            Cast Spell
          </Button>
        )}
      </div>
    </motion.div>
  )
}

function getOrdinalSuffix(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const remainder = num % 100
  return suffixes[(remainder - 20) % 10] || suffixes[remainder] || suffixes[0]
}




