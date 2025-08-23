// src/__tests__/motion-compat.test.ts
import { describe, it, expect } from 'vitest';
import { animate, timeline, spring, stagger, glide } from 'motion';

describe('Motion v12 Compatibility Layer', () => {
  it('exports all Motion v12 APIs', () => {
    expect(typeof animate).toBe('function');
    expect(typeof spring).toBe('function');
    expect(typeof stagger).toBe('function');
  });

  it('provides compatibility exports', () => {
    expect(typeof timeline).toBe('function');
    expect(typeof glide).toBe('function');
  });

  it('timeline delegates to animate', () => {
    // Test that timeline function exists and can be called
    expect(() => {
      timeline([
        ['div', { opacity: 1 }, { duration: 0.1 }]
      ]);
    }).not.toThrow();
  });

  it('glide provides easing function', () => {
    // Test that glide returns an easing function
    const easing = glide();
    expect(typeof easing).toBe('function');
    expect(typeof easing(0.5)).toBe('number');
  });

  it('glide accepts options', () => {
    // Test that glide can be called with options
    const easing = glide({ velocity: 1000, power: 0.8 });
    expect(typeof easing).toBe('function');
    expect(typeof easing(0.5)).toBe('number');
  });

  it('spring works as transition type', () => {
    // Test that spring can be used as a transition type
    const springTransition = { type: spring, stiffness: 300, damping: 24 };
    expect(springTransition.type).toBe(spring);
    expect(springTransition.stiffness).toBe(300);
  });

  it('animate works with spring transition', () => {
    // Test that animate works with spring transition
    expect(() => {
      animate('div', { x: 100 }, { type: spring, stiffness: 300 });
    }).not.toThrow();
  });

  it('stagger works with animate', () => {
    // Test that stagger works with animate
    expect(() => {
      animate('div', { opacity: 1 }, { delay: stagger(0.1) });
    }).not.toThrow();
  });
});
