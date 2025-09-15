import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const cardVariants = cva(
  'rounded-xl border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'shadow-md hover:shadow-lg',
        elevated: 'shadow-lg hover:shadow-xl',
        magical: 'character-card hover:magical-glow',
        cyber: 'cyber-card hover:cyber-glow',
        glass: 'glass-surface shadow-lg hover:shadow-xl',
        parchment: 'parchment-texture shadow-md hover:shadow-lg',
        spell: 'spell-book-page shadow-lg hover:shadow-xl hover:scale-[1.02]'
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md'
    }
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, style, ...props }, ref) => {
    
    // Define styles based on variant
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'elevated':
          return {
            backgroundColor: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-primary)',
            borderOpacity: 0.2,
            ...style
          }
        case 'magical':
          return {
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)',
            borderColor: 'var(--color-border)',
            ...style
          }
        case 'glass':
          return {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            ...style
          }
        case 'parchment':
          return {
            background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)',
            borderColor: 'var(--gold-200)',
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(168, 157, 126, 0.1) 0%, transparent 50%)
            `,
            ...style
          }
        default:
          return {
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-primary)',
            borderOpacity: 0.2,
            ...style
          }
      }
    }
    
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        style={getVariantStyles()}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, style, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-display text-xl font-semibold leading-none tracking-tight', className)}
    style={{ color: 'var(--color-text-primary)', ...style }}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, style, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm font-body', className)}
    style={{ color: 'var(--color-text-secondary)', ...style }}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-4', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }