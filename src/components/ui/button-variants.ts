import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground border-2 border-primary-border shadow-primary hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-secondary hover:-translate-y-0.5 active:translate-y-0',
        outline: 'border-2 border-border bg-transparent hover:bg-popover/70 hover:border-primary/50',
        ghost: 'bg-transparent hover:bg-popover hover:shadow-sm',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-destructive-border hover:-translate-y-0.5 active:translate-y-0',
        magical:
          'bg-gradient-to-br from-chart-4 to-chart-3 text-white border-2 border-primary-border shadow-primary hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
        cyber:
          'bg-chart-3 text-primary-foreground hover:bg-chart-3/85 border-2 border-primary-border hover:-translate-y-0.5 active:translate-y-0',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
        xl: 'h-14 px-6 text-lg',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)
