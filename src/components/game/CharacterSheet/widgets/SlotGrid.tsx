import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/lib/utils'

const cell = cva(
  'border-border grid place-items-center rounded-md border text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  {
    variants: {
      state: {
        empty: 'bg-muted/30 text-muted-foreground',
        filled: 'bg-card text-foreground',
        error: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: { state: 'empty' },
  },
)

export interface Slot {
  id: string
  label: string
  itemName?: string
}

export interface SlotGridProps extends VariantProps<typeof cell> {
  className?: string
  slots: Slot[]
  onDrop?: (slotId: string, itemId: string) => void
}

export default function SlotGrid({
  className,
  slots,
  state,
}: SlotGridProps): JSX.Element {
  return (
    <div className={cn('grid grid-cols-2 gap-2 md:grid-cols-3', className)}>
      {slots.map((s) => (
        <button
          type='button'
          key={s.id}
          className={cell({ state: s.itemName ? 'filled' : state })}
          aria-label={
            s.itemName ? `${s.label}: ${s.itemName}` : `${s.label}: empty`
          }
        >
          <span className='truncate'>{s.itemName ?? s.label}</span>
        </button>
      ))}
    </div>
  )
}
