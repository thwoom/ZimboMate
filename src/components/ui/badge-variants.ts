import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent',
        primary: 'bg-primary text-primary-foreground border-transparent',
        secondary: 'bg-popover text-foreground border-border',
        outline: 'border-border bg-transparent text-foreground',
        destructive:
          'bg-destructive text-destructive-foreground border-transparent',
        success:
          'bg-[color:var(--chart-2)] text-[color:var(--primary-foreground)] border-transparent',
        warning:
          'bg-[color:var(--chart-4)] text-[color:var(--foreground)] border-transparent',
        magical:
          'bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-sm',
        health:
          'bg-[color:var(--chart-2)] text-[color:var(--primary-foreground)] border-transparent',
        mana:
          'bg-[color:var(--chart-3)] text-[color:var(--primary-foreground)] border-transparent',
        experience:
          'bg-[color:var(--chart-4)] text-[color:var(--foreground)] border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
