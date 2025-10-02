import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground border border-primary-border shadow-primary hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-secondary',
        outline: 'border border-border bg-transparent hover:bg-popover/70',
        ghost: 'bg-transparent hover:bg-popover',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive-border',
        magical: 'bg-gradient-to-r from-chart-4 to-chart-3 text-white border border-primary-border shadow-primary hover:opacity-90',
        cyber: 'bg-chart-3 text-primary-foreground hover:bg-chart-3/85 border border-primary-border',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-5 text-base',
        xl: 'h-14 px-6 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

function Button({ ref, className, variant, size, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

Button.displayName = 'Button'

export { Button }
