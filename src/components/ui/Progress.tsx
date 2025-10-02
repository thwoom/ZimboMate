import type { VariantProps } from 'class-variance-authority'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const progressVariants = cva(
  'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      variant: {
        default: '',
        health: 'bg-destructive/15',
        mana: 'bg-primary/10',
        experience: 'bg-chart-4/15',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const progressFillVariants = cva(
  'h-full w-full flex-1 bg-primary transition-all',
  {
    variants: {
      variant: {
        default: '',
        health: 'bg-chart-2',
        mana: 'bg-primary/100',
        experience: 'bg-chart-4/120',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
  VariantProps<typeof progressVariants> {}

function Progress({ ref, className, value, variant, ...props }: ProgressProps & { ref?: React.RefObject<React.ElementRef<typeof ProgressPrimitive.Root> | null> }) {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressVariants({ variant, className }))}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(progressFillVariants({ variant }))}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress, progressFillVariants, progressVariants }
