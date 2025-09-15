import React from 'react'
import { cn } from '../../lib/utils'

interface StatItemProps {
  label: string
  value: string | number
  modifier?: string | number
  color?: string
  onClick?: () => void
  className?: string
}

export function StatItem({ label, value, modifier, color, onClick, className }: StatItemProps) {
  const Comp = onClick ? 'button' : 'div'
  
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'flex flex-col items-center p-2 rounded-md transition-all duration-fast',
        onClick && 'hover:bg-surface-hover cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      style={color ? { '--stat-color': color } as React.CSSProperties : undefined}
    >
      <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
        {label}
      </span>
      <span 
        className={cn(
          'text-lg font-bold text-text-primary',
          color && 'text-[var(--stat-color)]'
        )}
      >
        {value}
      </span>
      {modifier !== undefined && (
        <span className={cn(
          'text-xs font-medium',
          color ? 'text-[var(--stat-color)]' : 'text-text-secondary'
        )}>
          {typeof modifier === 'number' && modifier >= 0 ? '+' : ''}{modifier}
        </span>
      )}
    </Comp>
  )
}

interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  children: React.ReactNode
  columns?: 2 | 3 | 4 | 6
}

export function StatGroup({ title, children, columns = 3, className, ...props }: StatGroupProps) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {title && (
        <h4 className="text-sm font-semibold text-text-primary">
          {title}
        </h4>
      )}
      <div 
        className={cn(
          'grid gap-2',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-3',
          columns === 4 && 'grid-cols-4',
          columns === 6 && 'grid-cols-6'
        )}
      >
        {children}
      </div>
    </div>
  )
}