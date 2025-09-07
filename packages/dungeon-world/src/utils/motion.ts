import { Variants } from 'framer-motion';

// Shared motion timings. These can be wired to CSS variables later if needed.
export const MotionDurations = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
} as const;

export const MotionEasings = {
  inOut: [0.4, 0.0, 0.2, 1],
  outCubic: [0.33, 1, 0.68, 1],
  inCubic: [0.32, 0, 0.67, 0],
} as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: MotionDurations.normal, ease: MotionEasings.inOut } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: MotionDurations.normal, ease: MotionEasings.outCubic } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: MotionDurations.normal, ease: MotionEasings.outCubic } },
};

export const hudGlowPulse: Variants = {
  rest: { boxShadow: '0 0 0 rgba(0,0,0,0)' },
  pulse: {
    boxShadow: '0 0 24px rgba(99,102,241,0.25)',
    transition: { duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: MotionEasings.inOut },
  },
};

// Container/child helpers
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const itemFadeIn: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: MotionDurations.fast, ease: MotionEasings.outCubic } },
};

export type MotionVariantKey = 'fade' | 'fadeUp' | 'scale';

export function getVariant(key: MotionVariantKey): Variants {
  switch (key) {
    case 'fadeUp':
      return fadeInUp;
    case 'scale':
      return scaleIn;
    case 'fade':
    default:
      return fadeIn;
  }
}


