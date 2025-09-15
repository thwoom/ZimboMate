import React from 'react'
import { TableCellsIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

export interface Attributes {
  STR: number
  DEX: number
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export interface Debilities {
  weak: boolean      // -1 STR
  shaky: boolean     // -1 DEX
  sick: boolean      // -1 CON
  confused: boolean  // -1 INT
  scarred: boolean   // -1 WIS
  stunned: boolean   // -1 CHA
}

export interface AttributesGridProps {
  attributes: Attributes
  debilities: Debilities
  onRollAttribute: (attribute: keyof Attributes) => void
  highlightStats?: string[]
  className?: string
}

const ATTRIBUTE_NAMES = {
  STR: 'Strength',
  DEX: 'Dexterity', 
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
} as const

const DEBILITY_MAP = {
  STR: 'weak',
  DEX: 'shaky',
  CON: 'sick',
  INT: 'confused',
  WIS: 'scarred',
  CHA: 'stunned'
} as const

export function AttributesGrid({
  attributes,
  debilities,
  onRollAttribute,
  highlightStats = [],
  className
}: AttributesGridProps) {
  const getModifier = (score: number): number => {
    if (score <= 3) return -3
    if (score <= 5) return -2
    if (score <= 8) return -1
    if (score <= 12) return 0
    if (score <= 15) return 1
    if (score <= 17) return 2
    return 3
  }

  const getEffectiveModifier = (attribute: keyof Attributes): number => {
    const baseModifier = getModifier(attributes[attribute])
    const debilityKey = DEBILITY_MAP[attribute] as keyof Debilities
    const hasDebility = debilities[debilityKey]
    return hasDebility ? baseModifier - 1 : baseModifier
  }

  const formatModifier = (modifier: number): string => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TableCellsIcon className="w-4 h-4 text-primary" />
          Attributes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(Object.keys(attributes) as Array<keyof Attributes>).map((attr) => {
            const score = attributes[attr]
            const modifier = getEffectiveModifier(attr)
            const debilityKey = DEBILITY_MAP[attr] as keyof Debilities
            const hasDebility = debilities[debilityKey]
            const isHighlighted = highlightStats.includes(attr)
            
            return (
              <Button
                key={attr}
                variant="outline"
                onClick={() => onRollAttribute(attr)}
                className={cn(
                  'h-auto p-3 flex flex-col items-center gap-1 transition-all',
                  hasDebility && 'border-danger/50 bg-danger/5',
                  isHighlighted && 'border-primary bg-primary/10',
                  'hover:scale-105'
                )}
                title={`Roll 2d6 + ${formatModifier(modifier)} (${ATTRIBUTE_NAMES[attr]})`}
              >
                <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                  {attr}
                </div>
                <div className="text-lg font-bold text-text-primary">
                  {score}
                </div>
                <div className={cn(
                  'text-sm font-semibold',
                  hasDebility ? 'text-danger' : 'text-primary'
                )}>
                  {formatModifier(modifier)}
                </div>
                {hasDebility && (
                  <div className="text-xs text-danger font-medium">
                    Debility
                  </div>
                )}
              </Button>
            )
          })}
        </div>
        
        <div className="mt-4 text-xs text-text-tertiary text-center">
          Click any attribute to roll 2d6 + modifier
        </div>
      </CardContent>
    </Card>
  )
}