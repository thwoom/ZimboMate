import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { hudToggle } from 'styled-system/recipes'
import { cn, getCurrentTheme, getAugmentedUIClasses } from '@/lib/theme-utils'

// Toggle Button (pressed/unpressed)
export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    React.ComponentProps<typeof hudToggle> {
  theme?: 'classic' | 'cosmic' | 'moebius'
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, ...props }, ref) => {
  const theme = getCurrentTheme()
  
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        className
      )}
      {...props}
    />
  )
})
Toggle.displayName = TogglePrimitive.Root.displayName

// Switch Component (on/off)
export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, ...props }, ref) => {
  const theme = getCurrentTheme()
  const augClasses = getAugmentedUIClasses(theme, 'toggle')
  
  return (
    <SwitchPrimitive.Root
      className={cn(
        hudToggle({ theme, state: props.checked ? 'checked' : 'unchecked' }),
        augClasses,
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
    </SwitchPrimitive.Root>
  )
})
Switch.displayName = SwitchPrimitive.Root.displayName

export { Toggle, Switch }
