import React from 'react'
import { StarIcon, PlusIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

export interface XpCardProps {
  currentXp: number
  level: number
  onAddXp: () => void
  onLevelUp?: () => void
  canLevelUp?: boolean
  className?: string
}

export function XpCard({
  currentXp,
  level,
  onAddXp,
  onLevelUp,
  canLevelUp = false,
  className
}: XpCardProps) {
  // XP threshold is level + 7
  const xpThreshold = level + 7
  const xpProgress = (currentXp / xpThreshold) * 100
  const xpToNext = Math.max(0, xpThreshold - currentXp)

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <StarIcon className="w-4 h-4 text-warning" />
          Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-text-primary">
            {currentXp}
            <span className="text-text-secondary text-lg mx-1">/</span>
            <span className="text-text-secondary text-lg">{xpThreshold}</span>
          </div>
          
          <div className="text-sm text-text-secondary">
            Level {level}
            {xpToNext > 0 && (
              <span className="block text-xs text-text-tertiary">
                {xpToNext} XP to next level
              </span>
            )}
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className="h-2 bg-warning rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, xpProgress)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddXp}
              className="text-xs h-6 px-2 gap-1"
            >
              <PlusIcon className="w-3 h-3" />
              Add XP
            </Button>
            
            {canLevelUp && onLevelUp && (
              <Button
                variant="default"
                size="sm"
                onClick={onLevelUp}
                className="text-xs h-6 px-2 bg-warning hover:bg-warning/80 animate-pulse"
              >
                Level Up!
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}