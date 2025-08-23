import * as React from 'react'

import { hudPill } from 'styled-system/recipes'
import { cn, getCurrentTheme, getAugmentedUIClasses } from '@/lib/theme-utils'

export interface HudPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    React.ComponentProps<typeof hudPill> {
  theme?: 'classic' | 'cosmic' | 'moebius'
}

const HudPill = React.forwardRef<HTMLSpanElement, HudPillProps>(
  ({ className, variant, ...props }, ref) => {
    const theme = getCurrentTheme()
    const augClasses = getAugmentedUIClasses(theme, 'pill')
    
    return (
      <span
        className={cn(
          hudPill({ variant, theme }),
          augClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
HudPill.displayName = 'HudPill'

export { HudPill }
