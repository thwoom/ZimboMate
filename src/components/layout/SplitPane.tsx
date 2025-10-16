import React from 'react'
import { cn } from '@/lib/utils'

export interface SplitPaneProps {
  left: React.ReactNode
  right: React.ReactNode
  className?: string
  leftMinWidth?: number // px
  showGutter?: boolean
}

/**
 * Responsive two-pane layout that stacks on small viewports and locks a minimum
 * width for the left pane on md+ screens. Styling sticks to token utilities.
 */
export default function SplitPane({
  left,
  right,
  className,
  leftMinWidth = 520,
  showGutter = true,
}: SplitPaneProps): JSX.Element {
  const gridClass = showGutter
    ? 'md:grid-cols-[var(--folio-width)_12px_minmax(0,1fr)]'
    : 'md:grid-cols-[var(--folio-width)_minmax(0,1fr)]'
  
  const gapClass = showGutter ? 'gap-4 md:gap-0' : 'gap-4'

  return (
    <section
      data-slot='split-pane'
      className={cn(
        'grid w-full items-start',
        gapClass,
        gridClass,
        className,
      )}
      style={{ '--folio-width': `${leftMinWidth}px` } as React.CSSProperties}
      role='group'
      aria-label='Two pane workspace'
    >
      <div className='md:h-full'>
        {left}
      </div>
      {showGutter ? (
        <div
          data-slot='split-pane-gutter'
          className='bg-border/60 hidden h-full w-[2px] rounded md:block'
          role='separator'
          aria-orientation='vertical'
          aria-label='Pane divider'
        />
      ) : null}
      <div className='min-w-0 md:h-full'>{right}</div>
    </section>
  )
}
