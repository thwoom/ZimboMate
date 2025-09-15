import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'enchanted-button text-white shadow-lg hover:shadow-xl',
        secondary: 'border hover:opacity-80',
        ghost: 'hover:opacity-80',
        destructive: 'text-white shadow-lg hover:opacity-90',
        outline: 'border bg-transparent hover:opacity-80',
        magical: 'magical-border text-white shadow-lg hover:shadow-xl hover:scale-105',
        cyber: 'text-white shadow-lg hover:shadow-xl'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 py-3 text-base',
        xl: 'h-14 px-8 py-4 text-lg',
        icon: 'h-10 w-10'
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    // Define styles based on variant
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'secondary':
          return {
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-primary)',
            borderWidth: '1px',
            borderStyle: 'solid',
            ...style
          }
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            ...style
          }
        case 'destructive':
          return {
            backgroundColor: 'var(--red-500)',
            color: 'white',
            ...style
          }
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderColor: 'var(--color-primary)',
            borderWidth: '1px',
            borderStyle: 'solid',
            color: 'var(--color-text-primary)',
            ...style
          }
        case 'magical':
          return {
            background: 'linear-gradient(135deg, var(--gold-500) 0%, var(--magic-500) 100%)',
            color: 'white',
            ...style
          }
        case 'cyber':
          return {
            background: 'linear-gradient(135deg, var(--cyber-500) 0%, var(--neon-500) 100%)',
            color: 'white',
            ...style
          }
        default: // primary
          return {
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            color: 'white',
            ...style
          }
      }
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={getVariantStyles()}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }