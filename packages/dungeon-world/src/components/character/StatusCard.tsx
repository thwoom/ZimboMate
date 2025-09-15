import React from 'react'
import { ExclamationTriangleIcon, CubeIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { cn } from '../../lib/utils'

export interface StatusCardProps {
  currentLoad: number
  maxLoad: number
  conditions?: string[]
  className?: string
}

export function StatusCard({
  currentLoad,
  maxLoad,
  conditions = [],
  className
}: StatusCardProps) {
  const loadPercent = maxLoad > 0 ? (currentLoad / maxLoad) * 100 : 0
  const isOverloaded = currentLoad > maxLoad
  
  const getLoadStatus = () => {
    if (isOverloaded) return 'overloaded'
    if (loadPercent >= 80) return 'heavy'
    if (loadPercent >= 60) return 'moderate'
    return 'light'
  }

  const getLoadColor = () => {
    const status = getLoadStatus()
    switch (status) {
      case 'overloaded': return 'text-danger'
      case 'heavy': return 'text-warning'
      case 'moderate': return 'text-info'
      default: return 'text-success'
    }
  }

  const getProgressColor = () => {
    const status = getLoadStatus()
    switch (status) {
      case 'overloaded': return 'bg-danger'
      case 'heavy': return 'bg-warning'
      case 'moderate': return 'bg-info'
      default: return 'bg-success'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CubeIcon className="w-4 h-4 text-info" />
          Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Load */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary uppercase tracking-wide">
              Load
            </span>
            <span className={cn('text-sm font-semibold', getLoadColor())}>
              {currentLoad}/{maxLoad}
            </span>
          </div>
          
          <div className="w-full bg-surface rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all duration-300', getProgressColor())}
              style={{ width: `${Math.min(100, loadPercent)}%` }}
            />
          </div>
          
          {isOverloaded && (
            <div className="flex items-center gap-1 text-xs text-danger">
              <ExclamationTriangleIcon className="w-3 h-3" />
              Overloaded! -1 ongoing to all rolls
            </div>
          )}
        </div>
        
        {/* Conditions */}
        {conditions.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-text-secondary uppercase tracking-wide">
              Conditions
            </div>
            <div className="flex flex-wrap gap-1">
              {conditions.map((condition, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-md border border-warning/30"
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {conditions.length === 0 && !isOverloaded && (
          <div className="text-xs text-text-tertiary text-center py-2">
            No active conditions
          </div>
        )}
      </CardContent>
    </Card>
  )
}