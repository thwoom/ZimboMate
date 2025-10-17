import { Loader2 } from 'lucide-react'
import React from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

import { useAutomationStatus } from './useAutomationStatus'

export interface AutomationStatusChipProps {
  className?: string
  detailsOpen?: boolean
  onToggleDetails?: () => void
}

const severityDotClass: Record<'success' | 'busy' | 'danger' | 'idle', string> = {
  success: 'bg-emerald-500',
  busy: 'bg-amber-400',
  danger: 'bg-destructive',
  idle: 'bg-muted-foreground/40',
}

export const AutomationStatusChip: React.FC<AutomationStatusChipProps> = ({
  className,
  detailsOpen,
  onToggleDetails,
}) => {
  const { status, llmUnifiedEnabled } = useAutomationStatus()

  if (!llmUnifiedEnabled || !status) {
    return null
  }

  const { label, hint, message, severity, isSpinner, icon: Icon } = status
  const hintText = hint || label
  const showToggle = typeof onToggleDetails === 'function'

  const actionContent = isSpinner ? (
    <Loader2 className='h-3 w-3 animate-spin text-muted-foreground' />
  ) : showToggle ? (
    detailsOpen ? (
      <ChevronUp className='h-3 w-3 text-muted-foreground' />
    ) : (
      <ChevronDown className='h-3 w-3 text-muted-foreground' />
    )
  ) : (
    <Icon className='h-3 w-3 text-muted-foreground' />
  )

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={onToggleDetails}
          aria-expanded={showToggle ? Boolean(detailsOpen) : undefined}
          className={cn(
            'group inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            !showToggle && 'cursor-default',
            className,
          )}
        >
          <span
            aria-hidden='true'
            className={cn(
              'inline-flex h-2.5 w-2.5 rounded-full transition-colors',
              severityDotClass[severity],
              isSpinner && 'animate-pulse',
            )}
          />
          <span className='text-xs font-semibold text-foreground'>{label}</span>
          <span className='hidden text-[10px] font-medium text-muted-foreground sm:inline'>
            {hintText}
          </span>
          {actionContent}
        </button>
      </TooltipTrigger>
      <TooltipContent side='bottom' className='max-w-xs text-left'>
        <p className='text-xs font-semibold text-primary-foreground'>{label}</p>
        <p className='text-xs text-primary-foreground/80'>
          {message ?? 'Chronicle automation is idle.'}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

function ChevronDown(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' {...props}>
      <path d='M3.5 6.5 8 11l4.5-4.5' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  )
}

function ChevronUp(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' {...props}>
      <path d='m3.5 9.5 4.5-4.5 4.5 4.5' strokeWidth='1.5' strokeLinecap='round' />
    </svg>
  )
}

