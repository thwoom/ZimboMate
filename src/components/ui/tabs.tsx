import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { hudTabs, hudTabsTrigger } from 'styled-system/recipes'
import { cn, getCurrentTheme, getAugmentedUIClasses } from '@/lib/theme-utils'

interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
    React.ComponentProps<typeof hudTabs> {
  theme?: 'classic' | 'cosmic' | 'moebius'
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ className, orientation, ...props }, ref) => {
  const theme = getCurrentTheme()
  
  return (
    <TabsPrimitive.Root
      ref={ref}
      orientation={orientation}
      className={cn(className)}
      {...props}
    />
  )
})
Tabs.displayName = TabsPrimitive.Root.displayName

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  orientation?: 'horizontal' | 'vertical'
  theme?: 'classic' | 'cosmic' | 'moebius'
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, orientation, ...props }, ref) => {
  const theme = getCurrentTheme()
  const augClasses = getAugmentedUIClasses(theme, 'tabs')
  
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        hudTabs({ theme, orientation }),
        augClasses,
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const theme = getCurrentTheme()
  
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        hudTabsTrigger({ theme, state: 'inactive' }),
        'data-[state=active]:' + hudTabsTrigger({ theme, state: 'active' }).split(' ').slice(-3).join(' '),
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
