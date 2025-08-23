# Motion v12 Migration Guide for ZimboMate

This guide provides a comprehensive migration path from legacy Motion "timeline + glide" patterns to Motion v12 idioms for the ZimboMate project.

## Current State

✅ **Motion v12 is already installed** (`motion@12.23.12`)  
✅ **Compatibility shim exists** at `src/shims/motion-compat.ts`  
✅ **No legacy code to migrate** - the codebase is ready for Motion v12 patterns  

## Migration Cheatsheet

### 1. Imports (Target End-State)

```typescript
// ✅ Target end-state (no shim needed)
import { animate, spring, stagger } from "motion";

// ❌ Legacy imports (use shim during transition)
import { timeline, glide } from "src/shims/motion-compat";
```

### 2. Replace timeline() → animate(sequence)

```typescript
// ❌ Before (legacy)
import { timeline } from "src/shims/motion-compat";

const tl = timeline([
  [".panel", { opacity: 1 }, { duration: 0.3 }],
  [".title", { y: [20, 0], opacity: [0, 1] }, { at: 0.1, duration: 0.4 }]
]);

tl.finished.then(() => console.log("done"));

// ✅ After (Motion v12)
import { animate } from "motion";

const controls = animate([
  [".panel", { opacity: 1 }, { duration: 0.3 }],
  [".title", { y: [20, 0], opacity: [0, 1] }, { at: 0.1, duration: 0.4 }]
]);

controls.finished.then(() => console.log("done"));
```

### 3. Replace glide() → { type: "inertia" }

```typescript
// ❌ Before (legacy)
import { animate, glide } from "src/shims/motion-compat";

animate(".cursor", { x: 600 }, { 
  easing: glide({ velocity: 1200, power: 0.8 }) 
});

// ✅ After (Motion v12)
import { animate } from "motion";

animate(".cursor", { x: 600 }, {
  type: "inertia",
  velocity: 1200,
  power: 0.8,
  timeConstant: 350,
  bounceStiffness: 300 // optional
});

// 🔧 Helper for migration
import { glideToInertia } from "src/shims/motion-compat";

animate(".cursor", { x: 600 }, glideToInertia({ 
  velocity: 1200, 
  power: 0.8 
}));
```

### 4. Common Patterns

#### A) Staggered Animations (Unchanged)
```typescript
import { animate, stagger } from "motion";

animate(".item", 
  { opacity: [0, 1], y: [8, 0] }, 
  { delay: stagger(0.05) }
);
```

#### B) Spring Animations (Unchanged)
```typescript
import { animate, spring } from "motion";

animate(".panel", { x: 0 }, { 
  easing: spring({ stiffness: 300, damping: 24 }) 
});
```

#### C) Controlled Sequences
```typescript
const controls = animate([
  [".leftPane", { x: [-20, 0], opacity: [0, 1] }, { duration: 0.35 }],
  [".rightPane", { x: [20, 0], opacity: [0, 1] }, { at: 0 }]
]);

// Control API remains the same
controls.pause();
controls.play();
controls.stop();
await controls.finished;
```

## ZimboMate-Specific Patterns

### HUD Animations with Motion Tokens

```typescript
import { animate, spring } from "motion";
import { inertiaPresets } from "src/shims/motion-compat";

// Use design tokens for consistent timing
const hudPanelEntry = animate(".hud-panel", {
  opacity: [0, 1],
  y: [20, 0],
  scale: [0.95, 1]
}, {
  duration: 0.3, // From motion tokens
  easing: spring({ stiffness: 300, damping: 24 })
});

// Inertia for drag interactions
const dragEnd = animate(".draggable", { x: 0, y: 0 }, inertiaPresets.bouncy);
```

### Reduced Motion Compliance

```typescript
import { animate } from "motion";

// Respect prefers-reduced-motion
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

animate(".element", { opacity: 1 }, {
  duration: shouldReduceMotion ? 0 : 0.3,
  easing: shouldReduceMotion ? "linear" : "ease-out"
});
```

### Arwes Integration

```typescript
// Coordinate with Arwes Animator lifecycle
import { animate } from "motion";

const arwesEnhancedAnimation = (element: string, isArwesActive: boolean) => {
  if (isArwesActive) {
    // Let Arwes handle the animation
    return Promise.resolve();
  }
  
  // Fallback to Motion v12
  return animate(element, { opacity: 1 }, { duration: 0.3 }).finished;
};
```

## Migration Workflow

### Phase 1: Keep the Shim (Current State)
- ✅ Shim provides compatibility layer
- ✅ New code can use Motion v12 patterns directly
- ✅ Legacy patterns work through shim

### Phase 2: Migrate Existing Code (When Found)
1. **Find legacy imports**: Search for `timeline` and `glide` imports
2. **Replace timeline calls**: Convert to `animate(sequence)`
3. **Replace glide calls**: Convert to inertia options
4. **Test thoroughly**: Ensure animations feel the same

### Phase 3: Remove the Shim (Future)
1. **Verify no legacy usage**: No imports from motion-compat
2. **Remove shim file**: Delete `src/shims/motion-compat.ts`
3. **Update imports**: Direct imports from "motion"

## Inertia Tuning Guide

Replace glide "feel" with inertia parameters:

| Glide Feel | Inertia Config |
|------------|----------------|
| Floaty then settle | `{ velocity: 1000, power: 0.8, timeConstant: 300 }` |
| Quick snap | `{ velocity: 1400, power: 0.9, timeConstant: 200 }` |
| Bouncy edge | `{ velocity: 1000, power: 0.8, timeConstant: 300, bounceStiffness: 300 }` |
| Gentle drift | `{ velocity: 600, power: 0.7, timeConstant: 400 }` |

## TypeScript Support

```typescript
// Motion v12 has excellent TypeScript support
import type { AnimationControls } from "motion";

const controls: AnimationControls = animate([
  [".element", { x: 100 }, { duration: 0.3 }]
]);

// Inertia options are fully typed
const inertiaOptions: {
  type: "inertia";
  velocity: number;
  power: number;
  timeConstant: number;
  bounceStiffness?: number;
} = {
  type: "inertia",
  velocity: 1000,
  power: 0.8,
  timeConstant: 300
};
```

## Performance Considerations

### Reduced Motion Detection
```typescript
// Global reduced motion detector (as planned in SPACE_HUD_PLAN.md)
export const useReducedMotion = () => {
  const [shouldReduce, setShouldReduce] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setShouldReduce(mediaQuery.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return shouldReduce;
};
```

### Motion Token Integration
```typescript
// Use CSS custom properties for consistent timing
const motionTokens = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5
  },
  easing: {
    ease: "ease",
    easeOut: "ease-out",
    spring: spring({ stiffness: 300, damping: 24 })
  }
};
```

## Testing Animations

```typescript
// Test that animations complete
test('panel animation completes', async () => {
  const controls = animate('.panel', { opacity: 1 }, { duration: 0.1 });
  await controls.finished;
  
  expect(document.querySelector('.panel')).toHaveStyle('opacity: 1');
});

// Test reduced motion compliance
test('respects reduced motion preference', () => {
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn(() => ({ matches: true }))
  });
  
  const controls = animate('.element', { x: 100 }, { 
    duration: shouldReduceMotion ? 0 : 0.3 
  });
  
  // Should complete immediately when reduced motion is enabled
  expect(controls.duration).toBe(0);
});
```

## Next Steps

1. **Start using Motion v12 patterns** in new components
2. **Leverage the improved shim** for any legacy code discovered
3. **Follow the Space-HUD motion philosophy** from the project plan
4. **Integrate with design tokens** for consistent timing
5. **Test accessibility** with reduced motion preferences

The codebase is already well-positioned for Motion v12! The improved shim provides a safety net while encouraging modern patterns.
