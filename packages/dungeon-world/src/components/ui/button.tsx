import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
};

const variantClasses: Record<string, string> = {
  default: 'bg-[--color-primary] text-[--color-primary-foreground] hover:opacity-90',
  secondary: 'bg-[--color-secondary] text-[--color-secondary-foreground] hover:opacity-90',
  ghost: 'bg-transparent text-[--color-foreground] hover:bg-[--color-accent]',
  destructive: 'bg-[--color-destructive] text-[--color-destructive-foreground] hover:opacity-90'
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-sm rounded-[--radius-sm] transition-[opacity] duration-[--motion-dur-fast] ease-[--motion-ease-out-cubic]',
  md: 'h-9 px-4 text-sm rounded-[--radius] transition-[opacity] duration-[--motion-dur-normal] ease-[--motion-ease-out-cubic]',
  lg: 'h-10 px-5 text-base rounded-[--radius-lg] transition-[opacity] duration-[--motion-dur-normal] ease-[--motion-ease-out-cubic]'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, className, variant = 'default', size = 'md', ...props }, ref) => {
    const prefersReduced = useReducedMotion();
    if (asChild) {
      const Comp = Slot as any;
      return (
        <Comp
          ref={ref as any}
          className={clsx(
            'inline-flex items-center justify-center whitespace-nowrap select-none outline-none',
            'shadow-sm focus-visible:ring-2 ring-[--color-ring] ring-offset-2 ring-offset-[--color-background]',
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        />
      );
    }
    const MotionButton = motion.button;
    return (
      <MotionButton
        ref={ref as any}
        className={clsx(
          'inline-flex items-center justify-center whitespace-nowrap select-none outline-none',
          'shadow-sm focus-visible:ring-2 ring-[--color-ring] ring-offset-2 ring-offset-[--color-background]',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        whileTap={prefersReduced ? undefined : { scale: 0.97 }}
        whileHover={prefersReduced ? undefined : { y: -1 }}
        transition={prefersReduced ? undefined : { duration: 0.15, ease: [0.33, 1, 0.68, 1] }}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;


