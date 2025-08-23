/**
 * Motion v12 Utilities for ZimboMate
 * 
 * This module provides Motion v12 utilities specifically designed for the ZimboMate
 * Space-HUD interface, integrating with design tokens and accessibility requirements.
 */

import { animate, spring, stagger, type AnimationControls } from "motion";

// Re-export AnimationControls for external use
export type { AnimationControls };

// Design token integration (matches SPACE_HUD_PLAN.md requirements)
export const motionTokens = {
  duration: {
    instant: 0.001,
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
  },
  easing: {
    linear: "linear",
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    // Spring presets for consistent feel (v12: use as transition objects, not easing functions)
    spring: {
      gentle: { type: spring, stiffness: 200, damping: 20 },
      normal: { type: spring, stiffness: 300, damping: 24 },
      snappy: { type: spring, stiffness: 400, damping: 28 },
      bouncy: { type: spring, stiffness: 300, damping: 18 },
    },
  },
  stagger: {
    tight: 0.02,
    normal: 0.05,
    loose: 0.1,
    dramatic: 0.15,
  },
} as const;

// Inertia presets for different interaction feels
export const inertiaPresets = {
  gentle: { 
    type: "inertia" as const, 
    velocity: 600, 
    power: 0.7, 
    timeConstant: 250 
  },
  standard: { 
    type: "inertia" as const, 
    velocity: 1000, 
    power: 0.8, 
    timeConstant: 300 
  },
  strong: { 
    type: "inertia" as const, 
    velocity: 1400, 
    power: 0.9, 
    timeConstant: 350 
  },
  bouncy: { 
    type: "inertia" as const, 
    velocity: 1000, 
    power: 0.8, 
    timeConstant: 300, 
    bounceStiffness: 300 
  },
  floaty: { 
    type: "inertia" as const, 
    velocity: 800, 
    power: 0.6, 
    timeConstant: 400 
  },
} as const;

// Reduced motion detection hook (React-compatible)
export const useReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Get motion-safe duration (respects reduced motion preference)
export const getMotionDuration = (
  duration: keyof typeof motionTokens.duration,
  respectReducedMotion = true
): number => {
  if (respectReducedMotion && useReducedMotion()) {
    return motionTokens.duration.instant;
  }
  return motionTokens.duration[duration];
};

// HUD-specific animation patterns
export const hudAnimations = {
  /**
   * Panel slide-in animation for HUD components
   */
  panelEntry: (
    target: string | Element | Element[],
    options: { 
      direction?: "up" | "down" | "left" | "right";
      respectReducedMotion?: boolean;
    } = {}
  ): AnimationControls => {
    const { direction = "up", respectReducedMotion = true } = options;
    
    const transforms = {
      up: { y: [20, 0] },
      down: { y: [-20, 0] },
      left: { x: [20, 0] },
      right: { x: [-20, 0] },
    };
    
    return animate(target, {
      opacity: [0, 1],
      scale: [0.95, 1],
      ...transforms[direction],
    }, {
      duration: getMotionDuration("normal", respectReducedMotion),
      ...motionTokens.easing.spring.normal,
    });
  },

  /**
   * Panel slide-out animation
   */
  panelExit: (
    target: string | Element | Element[],
    options: { 
      direction?: "up" | "down" | "left" | "right";
      respectReducedMotion?: boolean;
    } = {}
  ): AnimationControls => {
    const { direction = "down", respectReducedMotion = true } = options;
    
    const transforms = {
      up: { y: [0, -20] },
      down: { y: [0, 20] },
      left: { x: [0, -20] },
      right: { x: [0, 20] },
    };
    
    return animate(target, {
      opacity: [1, 0],
      scale: [1, 0.95],
      ...transforms[direction],
    }, {
      duration: getMotionDuration("fast", respectReducedMotion),
      easing: motionTokens.easing.easeIn,
    });
  },

  /**
   * Staggered list animation for character lists, inventory, etc.
   */
  listStagger: (
    target: string | Element | Element[],
    options: {
      staggerDelay?: keyof typeof motionTokens.stagger;
      respectReducedMotion?: boolean;
    } = {}
  ): AnimationControls => {
    const { staggerDelay = "normal", respectReducedMotion = true } = options;
    
    return animate(target, {
      opacity: [0, 1],
      y: [8, 0],
    }, {
      delay: stagger(motionTokens.stagger[staggerDelay]),
      duration: getMotionDuration("normal", respectReducedMotion),
      ...motionTokens.easing.spring.gentle,
    });
  },

  /**
   * Button press feedback animation
   */
  buttonPress: (
    target: string | Element | Element[],
    options: { respectReducedMotion?: boolean } = {}
  ): AnimationControls => {
    const { respectReducedMotion = true } = options;
    
    return animate(target, {
      scale: [1, 0.95, 1],
    }, {
      duration: getMotionDuration("fast", respectReducedMotion),
      ...motionTokens.easing.spring.snappy,
    });
  },

  /**
   * Hover glow effect for interactive elements
   */
  hoverGlow: (
    target: string | Element | Element[],
    options: { 
      glowColor?: string;
      respectReducedMotion?: boolean;
    } = {}
  ): AnimationControls => {
    const { glowColor = "#54DAD0", respectReducedMotion = true } = options;
    
    return animate(target, {
      boxShadow: [
        "0 0 0 rgba(84, 218, 208, 0)",
        `0 0 20px ${glowColor}40, 0 0 40px ${glowColor}20`,
      ],
    }, {
      duration: getMotionDuration("normal", respectReducedMotion),
      easing: motionTokens.easing.easeOut,
    });
  },

  /**
   * Dice roll animation sequence
   */
  diceRoll: (
    target: string | Element | Element[],
    options: { 
      rolls?: number;
      respectReducedMotion?: boolean;
    } = {}
  ): AnimationControls => {
    const { rolls = 3, respectReducedMotion = true } = options;
    
    if (respectReducedMotion && useReducedMotion()) {
      // Simple opacity flash for reduced motion
      return animate(target, {
        opacity: [1, 0.7, 1],
      }, {
        duration: motionTokens.duration.fast,
      });
    }
    
    // Full dice roll animation
    return animate(target, {
      rotateX: [0, 360 * rolls],
      rotateY: [0, 360 * rolls * 0.7],
      scale: [1, 1.1, 1],
    }, {
      duration: motionTokens.duration.slow,
      ...motionTokens.easing.spring.bouncy,
    });
  },
};

// Sequence builders for complex animations
export const sequenceBuilders = {
  /**
   * HUD startup sequence - panels appear in order
   */
  hudStartup: (
    panels: Array<string | Element | Element[]>,
    options: { respectReducedMotion?: boolean } = {}
  ): AnimationControls => {
    const { respectReducedMotion = true } = options;
    
    const sequence = panels.map((panel, index) => [
      panel,
      { opacity: [0, 1], y: [20, 0], scale: [0.95, 1] },
      { 
        at: index * 0.1,
        duration: getMotionDuration("normal", respectReducedMotion),
        ...motionTokens.easing.spring.normal,
      },
    ]);
    
    return animate(sequence as any);
  },

  /**
   * Character sheet reveal sequence
   */
  characterSheetReveal: (
    elements: {
      background: string | Element | Element[];
      portrait: string | Element | Element[];
      stats: string | Element | Element[];
      moves: string | Element | Element[];
    },
    options: { respectReducedMotion?: boolean } = {}
  ): AnimationControls => {
    const { respectReducedMotion = true } = options;
    
    const duration = getMotionDuration("normal", respectReducedMotion);
    
    return animate([
      // Background fades in first
      [elements.background, { opacity: [0, 1] }, { duration }],
      
      // Portrait slides in from left
      [elements.portrait, { 
        opacity: [0, 1], 
        x: [-30, 0] 
      }, { 
        at: 0.1, 
        duration,
        ...motionTokens.easing.spring.normal 
      }],
      
      // Stats appear with stagger
      [elements.stats, { 
        opacity: [0, 1], 
        y: [10, 0] 
      }, { 
        at: 0.2, 
        duration,
        delay: stagger(motionTokens.stagger.normal),
        easing: motionTokens.easing.easeOut 
      }],
      
      // Moves slide in from right
      [elements.moves, { 
        opacity: [0, 1], 
        x: [30, 0] 
      }, { 
        at: 0.3, 
        duration,
        ...motionTokens.easing.spring.gentle 
      }],
    ] as any);
  },
};

// Utility for creating custom inertia configurations
export const createInertiaConfig = (options: {
  velocity?: number;
  power?: number;
  timeConstant?: number;
  bounceStiffness?: number;
}) => ({
  type: "inertia" as const,
  velocity: options.velocity ?? 1000,
  power: options.power ?? 0.8,
  timeConstant: options.timeConstant ?? 300,
  ...(options.bounceStiffness && { bounceStiffness: options.bounceStiffness }),
});

// Animation control utilities
export const animationUtils = {
  /**
   * Wait for multiple animations to complete
   */
  waitForAll: async (controls: AnimationControls[]): Promise<void> => {
    await Promise.all(controls.map(control => control.finished));
  },

  /**
   * Cancel all animations in a group
   */
  cancelAll: (controls: AnimationControls[]): void => {
    controls.forEach(control => control.stop());
  },

  /**
   * Pause all animations in a group
   */
  pauseAll: (controls: AnimationControls[]): void => {
    controls.forEach(control => control.pause());
  },

  /**
   * Resume all animations in a group
   */
  resumeAll: (controls: AnimationControls[]): void => {
    controls.forEach(control => control.play());
  },
};

// Export types for TypeScript users
export type MotionDuration = keyof typeof motionTokens.duration;
export type MotionEasing = keyof typeof motionTokens.easing;
export type StaggerDelay = keyof typeof motionTokens.stagger;
export type InertiaPreset = keyof typeof inertiaPresets;
export type HudDirection = "up" | "down" | "left" | "right";

// Default export with all utilities
export default {
  motionTokens,
  inertiaPresets,
  useReducedMotion,
  getMotionDuration,
  hudAnimations,
  sequenceBuilders,
  createInertiaConfig,
  animationUtils,
};
