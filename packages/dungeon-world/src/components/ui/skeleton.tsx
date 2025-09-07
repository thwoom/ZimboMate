import * as React from 'react';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={clsx('animate-pulse rounded-md bg-[--color-muted]', className)}
      initial={prefersReduced ? undefined : { opacity: 0.6 }}
      animate={prefersReduced ? undefined : { opacity: 1 }}
      transition={prefersReduced ? undefined : { duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
      {...props}
    />
  );
};

export default Skeleton;


