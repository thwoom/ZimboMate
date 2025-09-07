import * as React from 'react';
import clsx from 'clsx';
import { motion, useReducedMotion } from 'framer-motion';
import { getVariant } from '../../utils/motion';

export interface HUDFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'cosmic' | 'glitch';
}

export const HUDFrame: React.FC<HUDFrameProps> = ({ className, variant = 'default', children, ...props }) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : 'hidden'}
      animate={prefersReduced ? undefined : 'visible'}
      variants={getVariant('fadeUp')}
      className={clsx(
        'relative rounded-[--radius-lg] border border-[--color-border] bg-[--color-card] text-[--color-card-foreground] shadow-sm',
        'before:pointer-events-none before:absolute before:inset-0 before:opacity-10 before:bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.08)_51%)] before:bg-[length:100%_2px]',
        variant === 'cosmic' && 'after:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(50%_50%_at_50%_0%,rgba(99,102,241,0.25),transparent)]',
        className
      )}
      {...props}
    >
      {children}
      <svg className="pointer-events-none absolute inset-0 opacity-20" aria-hidden width="100%" height="100%">
        <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="4" y="4" width="calc(100% - 8px)" height="calc(100% - 8px)" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </motion.div>
  );
};

export default HUDFrame;


