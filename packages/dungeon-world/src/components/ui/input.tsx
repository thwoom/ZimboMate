import * as React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'flex h-9 w-full rounded-[--radius] border border-[--color-border] bg-[--color-background] px-3 py-1 text-[--color-foreground] shadow-sm',
          'placeholder:text-[--color-muted-foreground] focus-visible:outline-none focus-visible:ring-2 ring-[--color-ring] ring-offset-2 ring-offset-[--color-background]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;


