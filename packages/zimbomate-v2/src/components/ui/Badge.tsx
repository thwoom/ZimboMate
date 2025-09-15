import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 font-ui',
  {
    variants: {
      variant: {
        default: 'border-transparent',
        secondary: 'border-transparent',
        destructive: 'border-transparent text-white',
        success: 'border-transparent text-white',
        warning: 'border-transparent text-white',
        magical: 'border-transparent text-white shadow-sm hover:shadow-md',
        outline: 'bg-transparent',
        health: 'border-transparent text-white',
        mana: 'border-transparent text-white',
        experience: 'border-transparent text-white'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  // Define styles based on variant
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--color-surface-elevated)',
          color: 'var(--color-text-secondary)',
          ...style
        }
      case 'destructive':
        return {
          backgroundColor: 'var(--red-500)',
          ...style
        }
      case 'success':
        return {
          backgroundColor: 'var(--nature-500)',
          ...style
        }
      case 'warning':
        return {
          backgroundColor: 'var(--gold-500)',
          ...style
        }
      case 'magical':
        return {
          background: 'linear-gradient(to right, var(--gold-500), var(--magic-500))',
          ...style
        }
      case 'outline':
        return {
          borderColor: 'var(--color-primary)',
          borderWidth: '1px',
          borderStyle: 'solid',
          color: 'var(--color-text-primary)',
          ...style
        }
      case 'health':
        return {
          backgroundColor: 'var(--nature-500)',
          ...style
        }
      case 'mana':
        return {
          backgroundColor: 'var(--magic-500)',
          ...style
        }
      case 'experience':
        return {
          backgroundColor: 'var(--gold-500)',
          ...style
        }
      default:
        return {
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary)',
          opacity: 0.1,
          ...style
        }
    }
  }

  return (
    <div 
      className={cn(badgeVariants({ variant }), className)} 
      style={getVariantStyles()}
      {...props} 
    />
  )
}

export { Badge, badgeVariants }