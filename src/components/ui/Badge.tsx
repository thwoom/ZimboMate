import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white border-transparent',
        primary: 'bg-primary text-white border-transparent',
        secondary: 'bg-popover text-foreground border-border',
        outline: 'border-border bg-transparent text-foreground',
        destructive: 'bg-destructive text-white border-transparent',
        success: 'bg-[color:var(--chart-2)] text-white border-transparent',
        warning: 'bg-[color:var(--chart-4)] text-[color:var(--foreground)] border-transparent',
        magical:
          'bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-sm',
        health: 'bg-[color:var(--chart-2)] text-white border-transparent',
        mana: 'bg-[color:var(--chart-3)] text-white border-transparent',
        experience: 'bg-[color:var(--chart-4)] text-[color:var(--foreground)] border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {}

function Badge({ ref, className, variant, ...props }: BadgeProps & { ref?: React.RefObject<HTMLDivElement | null> }) {
  return <div ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
}
Badge.displayName = 'Badge'

export { Badge }
