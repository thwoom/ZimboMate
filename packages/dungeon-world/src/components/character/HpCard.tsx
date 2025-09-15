import React from 'react'
import { HeartIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

export interface HpCardProps {
  currentHp: number
  maxHp: number
  onHpChange: (delta: number) => void
  onRest: () => void
  className?: string
}

export function HpCard({
  currentHp,
  maxHp,
  onHpChange,
  onRest,
  className
}: HpCardProps) {
  const hpPercent = maxHp > 0 ? (currentHp / maxHp) * 100 : 0
  
  const getHpStatus = () => {
    if (currentHp <= 0) return 'dead'
    if (hpPercent <= 25) return 'critical'
    if (hpPercent <= 50) return 'injured'
    return 'healthy'
  }

  const getHpColor = () => {
    const status = getHpStatus()
    switch (status) {
      case 'dead': return 'text-text-tertiary'
      case 'critical': return 'text-danger'
      case 'injured': return 'text-warning'
      default: return 'text-success'
    }
  }

  const getProgressColor = () => {
    const status = getHpStatus()
    switch (status) {
      case 'dead': return 'bg-text-tertiary'
      case 'critical': return 'bg-danger'
      case 'injured': return 'bg-warning'
      default: return 'bg-success'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <HeartIcon className="w-4 h-4 text-danger" />
          Hit Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onHpChange(-1)}
            disabled={currentHp <= 0}
            className="h-10 w-10 rounded-full"
          >
            <MinusIcon className="w-4 h-4" />
          </Button>
          
          <div className="text-center">
            <div className={cn('text-3xl font-bold', getHpColor())}>
              {currentHp}
              <span className="text-text-secondary text-xl mx-1">/</span>
              <span className="text-text-secondary text-xl">{maxHp}</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => onHpChange(1)}
            disabled={currentHp >= maxHp}
            className="h-10 w-10 rounded-full"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
        
        {/* HP Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all duration-300', getProgressColor())}
              style={{ width: `${Math.max(0, hpPercent)}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-tertiary">
              {getHpStatus().charAt(0).toUpperCase() + getHpStatus().slice(1)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRest}
              className="text-xs h-6 px-2"
            >
              Rest
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}