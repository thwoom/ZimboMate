import React from 'react'
import { cn } from '../../lib/utils'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: () => void
  actions?: React.ReactNode
}

export function SectionHeader({
  title,
  subtitle,
  collapsible = false,
  collapsed = false,
  onToggle,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 border-b border-border/50',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {collapsible && (
          <button
            onClick={onToggle}
            className="flex-shrink-0 p-1 rounded hover:bg-surface-hover transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={collapsed ? 'Expand section' : 'Collapse section'}
          >
            <ChevronDownIcon
              className={cn(
                'w-4 h-4 text-text-secondary transition-transform duration-fast',
                collapsed && '-rotate-90'
              )}
            />
          </button>
        )}
        
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-text-secondary truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}