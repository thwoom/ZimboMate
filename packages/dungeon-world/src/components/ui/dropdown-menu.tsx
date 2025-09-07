import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '../../utils/motion';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuItem = DropdownMenuPrimitive.Item;

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(
  ({ className, sideOffset = 6, ...props }, ref) => {
    const prefersReduced = useReducedMotion();
    return (
      <DropdownMenuPrimitive.Content asChild sideOffset={sideOffset} {...props}>
        <motion.div
          ref={ref as any}
          initial={prefersReduced ? false : 'hidden'}
          animate={prefersReduced ? undefined : 'visible'}
          variants={fadeInUp}
          className={clsx('z-50 min-w-[8rem] overflow-hidden rounded-[--radius] border border-[--color-border] bg-[--color-popover] p-1 text-[--color-popover-foreground] shadow-md', className)}
        />
      </DropdownMenuPrimitive.Content>
    );
  }
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

// Removed duplicate legacy exports to avoid conflicts with motion-enabled version above


