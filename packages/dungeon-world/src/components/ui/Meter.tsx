import React from 'react'
import { cn } from '../../lib/utils'

interface MeterProps {
  label: string
  current: number
  max: number
  variant?: 'default' | 'hp' | 'xp' | 'success' | 'warning' | 'danger'
  showValues?: boolean
  showPercentage?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

const variantStyles = {
  default: 'bg-primary',
  hp: 'bg-hp-full data-[status=injured]:bg-hp-injured data-[status=critical]:bg-hp-critical data-[status=dead]:bg-hp-dead',
  xp: 'bg-xp-highlight',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

const sizeStyles = {
  sm: 'h-1',
  default: 'h-2',
  lg: 'h-3',
}

export function Meter({
  label,
  current,
  max,
  variant = 'default',
  showValues = true,
  showPercentage = false,
  size = 'default',
  className,
}: MeterProps) {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100))
  
  // Determine HP status for styling
  const getHpStatus = () => {
    if (variant !== 'hp') return undefined
    if (current <= 0) return 'dead'
    if (percentage <= 25) return 'critical'
    if (percentage <= 50) return 'injured'
    return 'full'
  }

  const status = getHpStatus()

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text-primary">{label}</span>
        <div className="flex items-center gap-2 text-text-secondary">
          {showValues && (
            <span className="font-mono">
              {current}/{max}
            </span>
          )}
          {showPercentage && (
            <span className="font-mono">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
      
      <div className={cn(
        'relative w-full bg-surface-elevated rounded-full overflow-hidden',
        sizeStyles[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
          data-status={status}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${current} of ${max}`}
        />
        
        {/* Subtle shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      </div>
    </div>
  )
}