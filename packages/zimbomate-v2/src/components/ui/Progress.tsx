import React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const progressVariants = cva(
  'relative h-2 w-full overflow-hidden rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-(--color-surface-elevated)',
        health: 'bg-(--parchment-200)',
        mana: 'bg-(--magic-200)',
        experience: 'bg-(--gold-200)'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

const progressFillVariants = cva(
  'h-full w-full flex-1 transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-(--color-primary)',
        health: 'health-bar-full',
        'health-injured': 'health-bar-injured',
        'health-critical': 'health-bar-critical',
        mana: 'mana-bar',
        experience: 'bg-gradient-to-r from-(--gold-600) to-(--gold-400)'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  showLabel?: boolean
  label?: string
  fillVariant?: VariantProps<typeof progressFillVariants>['variant']
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, variant, value = 0, max = 100, showLabel = false, label, fillVariant, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    // Auto-determine health bar variant based on percentage
    let autoFillVariant = fillVariant
    if (variant === 'health' && !fillVariant) {
      if (percentage <= 25) {
        autoFillVariant = 'health-critical'
      } else if (percentage <= 50) {
        autoFillVariant = 'health-injured'
      } else {
        autoFillVariant = 'health'
      }
    } else if (!fillVariant) {
      autoFillVariant = variant
    }

    // Define progress background styles
    const getProgressStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'health':
          return { backgroundColor: 'var(--parchment-200)' }
        case 'mana':
          return { backgroundColor: 'var(--magic-200)' }
        case 'experience':
          return { backgroundColor: 'var(--gold-200)' }
        default:
          return { backgroundColor: 'var(--color-surface-elevated)' }
      }
    }

    // Define fill styles
    const getFillStyles = (): React.CSSProperties => {
      switch (autoFillVariant) {
        case 'health':
          return { backgroundColor: 'var(--nature-500)' }
        case 'health-injured':
          return { backgroundColor: 'var(--yellow-500)' }
        case 'health-critical':
          return { backgroundColor: 'var(--red-500)' }
        case 'mana':
          return { backgroundColor: 'var(--magic-500)' }
        case 'experience':
          return { background: 'linear-gradient(to right, var(--gold-600), var(--gold-400))' }
        default:
          return { backgroundColor: 'var(--color-primary)' }
      }
    }

    // Animation variants for the progress fill
    const fillVariants = {
      initial: { width: 0 },
      animate: { 
        width: `${percentage}%`,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          duration: 0.8
        }
      }
    }

    // Pulse animation for critical health
    const pulseVariants = percentage <= 25 && variant === 'health' ? {
      animate: {
        opacity: [1, 0.6, 1],
        transition: {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    } : {}

    return (
      <div className="space-y-1">
        {(showLabel || label) && (
          <motion.div 
            className="flex justify-between items-center"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span 
              className="text-sm font-medium font-ui"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {label || `${variant?.charAt(0).toUpperCase()}${variant?.slice(1)}`}
            </span>
            <motion.span 
              className="text-sm font-mono"
              style={{ color: 'var(--color-text-secondary)' }}
              key={`${value}-${max}`}
              initial={{ scale: 1.2, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {value}/{max}
            </motion.span>
          </motion.div>
        )}
        <div
          ref={ref}
          className={cn(progressVariants({ variant, className }))}
          style={getProgressStyles()}
          {...props}
        >
          <motion.div
            className={cn(progressFillVariants({ variant: autoFillVariant }))}
            style={{ 
              ...getFillStyles(),
              transformOrigin: 'left',
              borderRadius: 'inherit'
            }}
            variants={fillVariants}
            initial="initial"
            animate="animate"
            {...pulseVariants}
          />
          
          {/* Shimmer effect for mana and experience bars */}
          {(variant === 'mana' || variant === 'experience') && percentage > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    )
  }
)
Progress.displayName = 'Progress'

export { Progress, progressVariants, progressFillVariants }