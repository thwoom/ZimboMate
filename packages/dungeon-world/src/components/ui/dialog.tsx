import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeIn, scaleIn } from '../../utils/motion';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(
  ({ className, children, ...props }, ref) => {
    const prefersReduced = useReducedMotion();
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay asChild>
          <motion.div
            initial={prefersReduced ? false : 'hidden'}
            animate={prefersReduced ? undefined : 'visible'}
            exit={prefersReduced ? undefined : 'hidden'}
            variants={fadeIn}
            className="fixed inset-0 bg-black/50"
          />
        </DialogPrimitive.Overlay>
        <DialogPrimitive.Content asChild {...props}>
          <motion.div
            ref={ref as any}
            initial={prefersReduced ? false : 'hidden'}
            animate={prefersReduced ? undefined : 'visible'}
            exit={prefersReduced ? undefined : 'hidden'}
            variants={scaleIn}
            className={clsx(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-full max-w-lg rounded-[--radius-lg] border border-[--color-border] bg-[--color-card] p-6 text-[--color-card-foreground] shadow-xl',
              className
            )}
          >
            {children}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }
);
DialogContent.displayName = 'DialogContent';

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={clsx('mb-4 flex flex-col space-y-1.5', className)} {...props} />
);

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={clsx('text-lg font-semibold', className)} {...props} />
  )
);
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Description ref={ref} className={clsx('text-sm text-[--color-muted-foreground]', className)} {...props} />
  )
);
DialogDescription.displayName = 'DialogDescription';


