import React from 'react'
import { cn } from '@/lib/utils'

export interface RightRailProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Right rail container for secondary content (composer, automation log, drawers).
 */
export default function RightRail({
  header,
  footer,
  className,
  children,
  ...rest
}: RightRailProps): JSX.Element {
  return (
    <aside
      data-slot='right-rail'
      className={cn('flex min-w-0 flex-col gap-3', className)}
      {...rest}
    >
      {header ? (
        <div className='sticky top-0 z-10 bg-background/80 pb-2 backdrop-blur'>
          {header}
        </div>
      ) : null}
      <div className='min-w-0'>{children}</div>
      {footer ? <div className='pt-2'>{footer}</div> : null}
    </aside>
  )
}
