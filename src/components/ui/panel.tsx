import * as React from 'react'

import { hudPanel } from 'styled-system/recipes'
import { cn, getCurrentTheme, getAugmentedUIClasses, getAugmentedUIAttrs } from '@/lib/theme-utils'

export interface PanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    React.ComponentProps<typeof hudPanel> {
  theme?: 'classic' | 'cosmic' | 'moebius'
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, size, ...props }, ref) => {
    const theme = getCurrentTheme()
    const augClasses = getAugmentedUIClasses(theme, 'panel')
    const augAttrs = getAugmentedUIAttrs(theme, 'panel')
    
    return (
      <div
        className={cn(
          hudPanel({ theme, size }),
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
Panel.displayName = 'Panel'

export { Panel }
