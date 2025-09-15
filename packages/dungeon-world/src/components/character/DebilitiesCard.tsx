import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { cn } from '../../lib/utils'

export interface Debilities {
  weak: boolean      // -1 STR
  shaky: boolean     // -1 DEX
  sick: boolean      // -1 CON
  confused: boolean  // -1 INT
  scarred: boolean   // -1 WIS
  stunned: boolean   // -1 CHA
}

export interface DebilitiesCardProps {
  debilities: Debilities
  onToggleDebility: (debility: keyof Debilities) => void
  className?: string
}

const DEBILITY_INFO = {
  weak: { label: 'Weak', stat: 'STR', description: '-1 to Strength' },
  shaky: { label: 'Shaky', stat: 'DEX', description: '-1 to Dexterity' },
  sick: { label: 'Sick', stat: 'CON', description: '-1 to Constitution' },
  confused: { label: 'Confused', stat: 'INT', description: '-1 to Intelligence' },
  scarred: { label: 'Scarred', stat: 'WIS', description: '-1 to Wisdom' },
  stunned: { label: 'Stunned', stat: 'CHA', description: '-1 to Charisma' }
} as const

export function DebilitiesCard({
  debilities,
  onToggleDebility,
  className
}: DebilitiesCardProps) {
  const activeDebilities = Object.entries(debilities).filter(([_, active]) => active)
  const hasDebilities = activeDebilities.length > 0

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ExclamationTriangleIcon className="w-4 h-4 text-warning" />
          Debilities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasDebilities ? (
          <div className="space-y-2">
            {activeDebilities.map(([debility]) => {
              const info = DEBILITY_INFO[debility as keyof Debilities]
              return (
                <div
                  key={debility}
                  className="flex items-center justify-between p-2 bg-danger/10 border border-danger/30 rounded-md"
                >
                  <div>
                    <div className="text-sm font-medium text-danger">
                      {info.label}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {info.description}
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleDebility(debility as keyof Debilities)}
                    className="text-xs text-danger hover:text-danger-hover transition-colors"
                    title="Remove debility"
                  >
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-sm text-text-tertiary">
              No active debilities
            </div>
          </div>
        )}
        
        {/* Quick toggle buttons */}
        <div className="pt-2 border-t border-border/50">
          <div className="text-xs text-text-secondary mb-2">Quick Toggle:</div>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(DEBILITY_INFO).map(([key, info]) => {
              const isActive = debilities[key as keyof Debilities]
              return (
                <button
                  key={key}
                  onClick={() => onToggleDebility(key as keyof Debilities)}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-colors',
                    isActive
                      ? 'bg-danger text-text-inverse'
                      : 'bg-surface hover:bg-surface-hover text-text-secondary'
                  )}
                  title={info.description}
                >
                  {info.stat}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}