import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';

type HUDButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
};

const variants: Record<string, string> = {
  primary: 'bg-[--color-primary] text-[--color-primary-foreground] hover:opacity-90',
  secondary: 'bg-[--color-secondary] text-[--color-secondary-foreground] hover:opacity-90',
  ghost: 'bg-transparent text-[--color-foreground] hover:bg-[--color-accent]',
  destructive: 'bg-[--color-destructive] text-[--color-destructive-foreground] hover:opacity-90'
};

const sizes: Record<string, string> = {
  sm: 'h-8 px-3 text-sm rounded-[--radius-sm] transition-[opacity] duration-[--motion-dur-fast]',
  md: 'h-9 px-4 text-sm rounded-[--radius] transition-[opacity] duration-[--motion-dur-normal]',
  lg: 'h-10 px-5 text-base rounded-[--radius-lg] transition-[opacity] duration-[--motion-dur-normal]'
};

export const HUDButton = React.forwardRef<HTMLButtonElement, HUDButtonProps>(
  ({ asChild, className, variant = 'primary', size = 'md', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref as any}
        className={clsx(
          'inline-flex items-center justify-center whitespace-nowrap select-none outline-none',
          'shadow-sm focus-visible:ring-2 ring-[--color-ring] ring-offset-2 ring-offset-[--color-background]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

HUDButton.displayName = 'HUDButton';

export default HUDButton;


