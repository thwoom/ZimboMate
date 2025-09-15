import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const tileVariants = cva(
  'relative rounded-lg transition-all duration-base',
  {
    variants: {
      variant: {
        default: 'glass border-border/50',
        elevated: 'glass-strong shadow-lg',
        subtle: 'glass-subtle',
        solid: 'bg-surface border border-border',
        ghost: 'hover:bg-surface-hover',
      },
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
      },
      rows: {
        1: 'row-span-1',
        2: 'row-span-2',
        3: 'row-span-3',
        4: 'row-span-4',
        5: 'row-span-5',
        6: 'row-span-6',
      },
      cols: {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
        5: 'col-span-5',
        6: 'col-span-6',
        full: 'col-span-full',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
      focus: {
        true: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rows: 1,
      cols: 1,
      interactive: false,
      focus: false,
    },
  }
)

export interface TileProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tileVariants> {
  asChild?: boolean
}

const Tile = React.forwardRef<HTMLDivElement, TileProps>(
  ({ className, variant, size, rows, cols, interactive, focus, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : 'div'
    
    return (
      <Comp
        className={cn(tileVariants({ variant, size, rows, cols, interactive, focus, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Tile.displayName = 'Tile'

export { Tile, tileVariants }