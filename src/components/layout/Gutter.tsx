import React from 'react'
import { cn } from '@/lib/utils'

export interface GutterProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal'
}

/**
 * Visual gutter. Drag/resizing can be layered later without changing layout call sites.
 */
export default function Gutter({
  orientation = 'vertical',
  className,
  ...rest
}: GutterProps): JSX.Element {
  const isVertical = orientation === 'vertical'
  return (
    <div
      data-slot='gutter'
      className={cn(
        'bg-border/60 group relative select-none',
        isVertical ? 'h-full w-[2px]' : 'h-[2px] w-full',
        className,
      )}
      role='separator'
      aria-orientation={orientation}
      {...rest}
    >
      {/* hit area for easier pointer targeting */}
      <div
        className={cn(
          'absolute inset-0',
          isVertical
            ? 'w-3 -translate-x-1/2 left-1/2'
            : 'h-3 -translate-y-1/2 top-1/2',
        )}
        aria-hidden='true'
      />
    </div>
  )
}
