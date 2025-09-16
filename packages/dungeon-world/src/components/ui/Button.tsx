import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default: 'bg-(--color-primary) text-(--color-text-inverse) hover:bg-(--color-primary-hover) focus-visible:ring-(--color-primary) glass-hover',
        destructive: 'bg-(--color-danger) text-(--color-text-inverse) hover:bg-(--color-danger-hover) focus-visible:ring-(--color-danger) glass-hover',
        outline: 'border border-(--color-border) bg-transparent hover:bg-(--color-surface-hover) hover:text-(--color-text-primary) focus-visible:ring-(--color-primary) glass-border',
        secondary: 'bg-(--color-surface-elevated) text-(--color-text-primary) hover:bg-(--color-surface-hover) focus-visible:ring-(--color-primary) glass-subtle',
        ghost: 'hover:bg-(--color-surface-hover) hover:text-(--color-text-primary) focus-visible:ring-(--color-primary) glass-hover',
        link: 'text-(--color-primary) underline-offset-4 hover:underline focus-visible:ring-(--color-primary)',
        success: 'bg-(--color-success) text-(--color-text-inverse) hover:bg-(--color-success-hover) focus-visible:ring-(--color-success) glass-hover',
        warning: 'bg-(--color-warning) text-(--color-text-inverse) hover:bg-(--color-warning-hover) focus-visible:ring-(--color-warning) glass-hover',
        glass: 'glass text-(--color-text-primary) hover:glass-strong focus-visible:ring-(--color-primary)',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        xs: 'h-8 rounded px-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      onClick?.(e)
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }