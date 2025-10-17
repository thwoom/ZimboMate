import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-primary text-foreground border-primary-border hover:bg-primary/90',
        primary: 'bg-primary text-foreground border-primary-border hover:bg-primary/90',
        secondary: 'bg-popover text-foreground border-border hover:bg-popover/80',
        outline: 'border-border bg-transparent text-foreground hover:bg-popover/50',
        destructive:
          'bg-destructive text-destructive-foreground border-destructive-border hover:bg-destructive/90',
        success:
          'bg-[color:var(--chart-2)] text-[color:var(--primary-foreground)] border-transparent hover:bg-[color:var(--chart-2)]/90',
        warning:
          'bg-[color:var(--chart-4)] text-[color:var(--foreground)] border-transparent hover:bg-[color:var(--chart-4)]/90',
        magical:
          'bg-gradient-to-r from-primary to-accent text-primary-foreground border-primary-border shadow-sm hover:shadow-md',
        health:
          'bg-[color:var(--chart-2)] text-[color:var(--primary-foreground)] border-transparent hover:bg-[color:var(--chart-2)]/90',
        mana:
          'bg-[color:var(--chart-3)] text-[color:var(--primary-foreground)] border-transparent hover:bg-[color:var(--chart-3)]/90',
        experience:
          'bg-[color:var(--chart-4)] text-[color:var(--foreground)] border-transparent hover:bg-[color:var(--chart-4)]/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
