# Motion v12 Quick Reference for ZimboMate

## Import Patterns

```typescript
// ✅ Direct Motion v12 (preferred)
import { animate, spring, stagger } from "motion";

// 🔧 Compatibility shim (during transition)
import { timeline, glide } from "../shims/motion-compat";

// 🎯 ZimboMate utilities (recommended)
import { hudAnimations, motionTokens } from "../lib/motion-utils";
```

## Common Patterns

### Basic Animation
```typescript
import { animate } from "motion";

// Simple property animation
animate(".element", { opacity: 1, x: 100 }, { duration: 0.3 });

// Keyframe animation
animate(".element", { 
  x: [0, 100, 0], 
  rotate: [0, 180, 360] 
}, { duration: 1 });
```

### Sequences (replaces timeline)
```typescript
import { animate } from "motion";

const controls = animate([
  [".panel", { opacity: 1 }, { duration: 0.3 }],
  [".title", { y: [20, 0] }, { at: 0.1, duration: 0.4 }],
  [".content", { opacity: [0, 1] }, { at: 0.2 }]
]);

await controls.finished;
```

### Inertia (replaces glide)
```typescript
import { animate } from "motion";

// Old way (deprecated)
animate(el, { x: 100 }, { easing: glide({ velocity: 1200 }) });

// New way (Motion v12)
animate(el, { x: 100 }, {
  type: "inertia",
  velocity: 1200,
  power: 0.8,
  timeConstant: 300
});

// ZimboMate preset
import { inertiaPresets } from "../lib/motion-utils";
animate(el, { x: 100 }, inertiaPresets.bouncy);
```

### Stagger
```typescript
import { animate, stagger } from "motion";

animate(".item", { opacity: 1, y: 0 }, {
  delay: stagger(0.1)
});
```

### Springs
```typescript
import { animate, spring } from "motion";

animate(".element", { scale: 1.2 }, {
  easing: spring({ stiffness: 300, damping: 24 })
});
```

## ZimboMate HUD Patterns

### Panel Animations
```typescript
import { hudAnimations } from "../lib/motion-utils";

// Panel entry
hudAnimations.panelEntry(".hud-panel", { direction: "up" });

// Panel exit  
hudAnimations.panelExit(".hud-panel", { direction: "down" });
```

### List Animations
```typescript
// Staggered list reveal
hudAnimations.listStagger(".list-item");

// Character sheet sequence
sequenceBuilders.characterSheetReveal({
  background: ".bg",
  portrait: ".portrait", 
  stats: ".stat",
  moves: ".move"
});
```

### Interactive Feedback
```typescript
// Button press
hudAnimations.buttonPress(".button");

// Hover glow
hudAnimations.hoverGlow(".interactive", { glowColor: "#54DAD0" });

// Dice roll
hudAnimations.diceRoll(".dice", { rolls: 3 });
```

## Motion Tokens

```typescript
import { motionTokens } from "../lib/motion-utils";

// Durations
motionTokens.duration.fast     // 0.15s
motionTokens.duration.normal   // 0.3s
motionTokens.duration.slow     // 0.5s

// Easing
motionTokens.easing.spring.normal
motionTokens.easing.easeOut

// Stagger
motionTokens.stagger.normal    // 0.05s
```

## Accessibility

```typescript
import { useReducedMotion, getMotionDuration } from "../lib/motion-utils";

// Respect user preferences
const reducedMotion = useReducedMotion();
const duration = getMotionDuration("normal", true); // Auto-adjusts

animate(".element", { opacity: 1 }, {
  duration: reducedMotion ? 0 : 0.3
});
```

## Animation Controls

```typescript
const controls = animate(".element", { x: 100 });

// Control playback
controls.play();
controls.pause();
controls.stop();

// Wait for completion
await controls.finished;

// Get current time
console.log(controls.currentTime);
```

## Error Handling

```typescript
try {
  const controls = animate(".element", { x: 100 });
  await controls.finished;
} catch (error) {
  console.log("Animation was cancelled or failed");
}
```

## Performance Tips

1. **Use transform properties** (x, y, scale, rotate) for best performance
2. **Batch DOM queries** before animations
3. **Cancel unused animations** to free memory
4. **Use will-change** CSS property for complex animations
5. **Respect reduced motion** preferences

## Migration Checklist

- [ ] Replace `timeline()` calls with `animate(sequence)`
- [ ] Replace `glide()` with inertia options
- [ ] Use ZimboMate motion utilities for consistency
- [ ] Test with reduced motion enabled
- [ ] Verify animations work on mobile devices
- [ ] Remove motion-compat shim when migration complete
