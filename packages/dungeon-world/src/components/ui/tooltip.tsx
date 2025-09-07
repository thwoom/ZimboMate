import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeIn, fadeInUp } from '../../utils/motion';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(
  ({ className, sideOffset = 6, ...props }, ref) => {
    const prefersReduced = useReducedMotion();
    return (
      <TooltipPrimitive.Content asChild sideOffset={sideOffset} {...props}>
        <motion.div
          ref={ref as any}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? undefined : 'visible'}
          variants={fadeInUp}
          className={clsx(
            'z-50 rounded-[--radius] bg-[--color-popover] px-3 py-2 text-sm text-[--color-popover-foreground] shadow-md border border-[--color-border]',
            className
          )}
        />
      </TooltipPrimitive.Content>
    );
  }
);
TooltipContent.displayName = 'TooltipContent';


