import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, ...props }, ref) => {
  const prefersReduced = useReducedMotion();
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={clsx('peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-[--color-border] bg-[--color-muted] transition-colors data-[state=checked]:bg-[--color-primary] focus-visible:outline-none focus-visible:ring-2 ring-[--color-ring] ring-offset-2 ring-offset-[--color-background] disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          className="pointer-events-none block h-5 w-5 translate-x-0 rounded-full bg-[--color-card] shadow-sm data-[state=checked]:translate-x-4"
          layout={!prefersReduced}
          transition={prefersReduced ? undefined : { type: 'spring', stiffness: 500, damping: 35 }}
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = 'Switch';

export default Switch;


