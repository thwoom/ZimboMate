import { cva } from 'class-variance-authority'

export const cardVariants = cva(
  'rounded-xl border-2 bg-card text-card-foreground shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-border bg-card hover:shadow-md',
        surface: 'border-border bg-popover hover:shadow-md',
        elevated: 'border-transparent bg-popover shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 hover:-translate-y-0.5',
        muted: 'border-border bg-muted text-muted-foreground hover:bg-muted/90',
        magical: 'card-magical',
        parchment: 'card-parchment',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
