// types/motion-compat.d.ts
declare module "motion" {
  // Re-export all existing Motion v12 types
  export * from "motion";
  
  // Add compatibility exports for legacy APIs
  export function timeline(
    sequence: Parameters<typeof import("motion").animate>[0],
    opts?: Parameters<typeof import("motion").animate>[2]
  ): ReturnType<typeof import("motion").animate>;

  export type Easing = (t: number) => number;
  export const glide: (...args: any[]) => Easing;
  
  // Ensure these are available (they should be in Motion v12)
  export const animate: typeof import("motion").animate;
  export const spring: typeof import("motion").spring;
  export const stagger: typeof import("motion").stagger;
  export type AnimationControls = ReturnType<typeof import("motion").animate>;
}
