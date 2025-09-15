import React from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

export interface CombatStatsCardProps {
  armor: number
  damage: string
  className?: string
}

export function CombatStatsCard({
  armor,
  damage,
  className
}: CombatStatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheckIcon className="w-4 h-4 text-info" />
          Combat Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <div className="text-xs text-text-secondary uppercase tracking-wide">
              Armor
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {armor}
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <div className="text-xs text-text-secondary uppercase tracking-wide">
              Damage
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {damage}
            </div>
          </div>
        </div>
        
        <div className="text-xs text-text-tertiary text-center">
          Armor reduces incoming damage • Damage die for weapon attacks
        </div>
      </CardContent>
    </Card>
  )
}