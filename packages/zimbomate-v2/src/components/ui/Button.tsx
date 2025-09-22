import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-(--color-primary) text-white hover:bg-(--color-primary)/90',
        secondary: 'bg-(--color-secondary) text-white hover:bg-(--color-secondary)/90',
        outline: 'border border-(--color-border) bg-transparent hover:bg-(--color-surface-elevated)',
        ghost: 'bg-transparent hover:bg-(--color-surface-elevated)',
        destructive: 'bg-(--red-600) text-white hover:bg-(--red-700)',
        magical: 'bg-gradient-to-r from-(--gold-500) to-(--magic-500) text-white shadow-magical hover:opacity-90',
        cyber: 'bg-(--cyber-600) text-white hover:bg-(--cyber-700)'
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-5 text-base',
        xl: 'h-14 px-6 text-base',
        icon: 'h-10 w-10 p-0'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }


