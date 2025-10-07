import { cva } from 'class-variance-authority'

export const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow',
  {
    variants: {
      variant: {
        default: 'border-border bg-card',
        surface: 'border-border bg-popover',
        elevated: 'border-transparent bg-popover shadow-lg shadow-primary/10',
        muted: 'border-border bg-muted text-muted-foreground',
        magical: 'card-magical',
        parchment: 'card-parchment',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
