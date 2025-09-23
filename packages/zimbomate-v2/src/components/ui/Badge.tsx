import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-(--color-primary) text-white border-transparent',
        primary: 'bg-(--color-primary) text-white border-transparent',
        secondary: 'bg-(--color-surface-elevated) text-(--color-text-primary) border-(--color-border)',
        outline: 'border-(--color-border) bg-transparent text-(--color-text-primary)',
        destructive: 'bg-(--color-danger) text-white border-transparent',
        success: 'bg-[color:var(--color-success)] text-white border-transparent',
        warning: 'bg-[color:var(--color-warning)] text-[color:var(--color-text-primary)] border-transparent',
        magical:
          'bg-gradient-to-r from-(--color-primary) to-(--color-accent) text-white border-transparent shadow-sm',
        health: 'bg-[color:var(--color-success)] text-white border-transparent',
        mana: 'bg-[color:var(--color-mana)] text-white border-transparent',
        experience: 'bg-[color:var(--color-experience)] text-[color:var(--color-text-primary)] border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
  )
)
Badge.displayName = 'Badge'

export { Badge }


