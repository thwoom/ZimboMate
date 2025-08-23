import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { hudButton } from 'styled-system/recipes'
import { cn, getCurrentTheme, getAugmentedUIClasses, getAugmentedUIAttrs } from '@/lib/theme-utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    React.ComponentProps<typeof hudButton> {
  asChild?: boolean
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'classic' | 'cosmic' | 'moebius'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, theme: themeProp, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const currentTheme = getCurrentTheme()
    const theme = themeProp || currentTheme
    const augClasses = getAugmentedUIClasses(theme, 'button')
    const augAttrs = getAugmentedUIAttrs(theme, 'button')
    
    return (
      <Comp
        className={cn(
          hudButton({ variant, theme, size }),
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
Button.displayName = 'Button'

export { Button }
