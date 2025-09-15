import React from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'

export interface SpellcastingCardProps {
  preparedCount: number
  spellBudget: number
  hasSpellcastingStrain?: boolean
  onOpenSpells: () => void
  className?: string
}

export function SpellcastingCard({
  preparedCount,
  spellBudget,
  hasSpellcastingStrain = false,
  onOpenSpells,
  className
}: SpellcastingCardProps) {
  const budgetPercent = spellBudget > 0 ? (preparedCount / spellBudget) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <SparklesIcon className="w-4 h-4 text-info" />
          Spellcasting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <div className="text-xs text-text-secondary uppercase tracking-wide">
              Prepared
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {preparedCount}
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-xs text-text-secondary uppercase tracking-wide">
              Budget
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {spellBudget}
            </div>
          </div>
        </div>
        
        {/* Spell Budget Progress */}
        <div className="space-y-2">
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="h-2 bg-info rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, budgetPercent)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSpells}
              className="text-xs h-6 px-2"
            >
              Open Spells
            </Button>
            
            <span className="text-xs text-text-tertiary">
              {preparedCount}/{spellBudget} levels
            </span>
          </div>
        </div>
        
        {hasSpellcastingStrain && (
          <div className="p-2 bg-warning/10 border border-warning/30 rounded-md">
            <div className="text-xs text-warning font-medium">
              Spellcasting Strain: -1 ongoing to Cast a Spell
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}