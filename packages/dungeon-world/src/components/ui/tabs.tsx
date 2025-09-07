import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '../../utils/motion';

export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List ref={ref} className={clsx('inline-flex h-10 items-center justify-center rounded-[--radius] bg-[--color-muted] p-1 text-[--color-muted-foreground]', className)} {...props} />
  )
);
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => {
    const prefersReduced = useReducedMotion();
    return (
      <TabsPrimitive.Trigger asChild {...props}>
        <motion.button
          ref={ref as any}
          whileTap={prefersReduced ? undefined : { scale: 0.97 }}
          whileHover={prefersReduced ? undefined : { scale: 1.02, y: -1 }}
          className={clsx(
            'inline-flex items-center justify-center whitespace-nowrap rounded-[--radius] px-3 py-1.5 text-sm font-medium ring-offset-[--color-background] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            'data-[state=active]:bg-[--color-background] data-[state=active]:text-[--color-foreground] data-[state=active]:shadow',
            className
          )}
        />
      </TabsPrimitive.Trigger>
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) => {
    const prefersReduced = useReducedMotion();
    return (
      <TabsPrimitive.Content asChild {...props}>
        <motion.div
          ref={ref as any}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? undefined : 'visible'}
          variants={fadeInUp}
          className={clsx('mt-2 ring-offset-[--color-background] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] focus-visible:ring-offset-2', className)}
        />
      </TabsPrimitive.Content>
    );
  }
);
TabsContent.displayName = 'TabsContent';


