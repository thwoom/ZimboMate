import * as React from 'react'

import { hudToolbar } from 'styled-system/recipes'
import { cn, getCurrentTheme, getAugmentedUIClasses, getAugmentedUIAttrs } from '@/lib/theme-utils'

export interface ToolbarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    React.ComponentProps<typeof hudToolbar> {
  theme?: 'classic' | 'cosmic' | 'moebius'
}

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, orientation, ...props }, ref) => {
    const theme = getCurrentTheme()
    const augClasses = getAugmentedUIClasses(theme, 'toolbar')
    const augAttrs = getAugmentedUIAttrs(theme, 'toolbar')
    
    return (
      <div
        className={cn(
          hudToolbar({ theme, orientation }),
          augClasses,
          className
        )}
        ref={ref}
        {...augAttrs}
        {...props}
      />
    )
  }
)
Toolbar.displayName = 'Toolbar'

export { Toolbar }
