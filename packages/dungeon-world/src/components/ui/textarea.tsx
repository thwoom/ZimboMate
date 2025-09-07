import * as React from 'react';
import clsx from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(
          'w-full rounded-[--radius] border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] shadow-sm',
          'placeholder:text-[--color-muted-foreground] focus-visible:outline-none focus-visible:ring-2 ring-[--color-ring] ring-offset-2 ring-offset-[--color-background]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;


