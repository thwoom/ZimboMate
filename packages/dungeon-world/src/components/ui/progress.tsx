import * as React from 'react';
import clsx from 'clsx';

export interface ProgressProps extends React.ComponentPropsWithoutRef<'progress'> {
  value: number;
  max: number;
}

export const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(
  ({ className, value, max, ...props }, ref) => {
    return (
      <progress
        ref={ref}
        className={clsx('h-2 w-full overflow-hidden rounded-[--radius] bg-[--color-muted] accent-[--color-primary]', className)}
        value={value}
        max={max}
        {...props}
      />
    );
  }
);

Progress.displayName = 'Progress';

export default Progress;


