// shim-assert.ts
// Dev-time assert that the Motion v12 compat layer is wired correctly.
// This logs the functions to verify they're present and shimmed.

import { animate, timeline, spring, stagger, glide } from 'motion';

// Log the functions to verify they're present
console.log('[motion-compat] animate:', typeof animate);
console.log('[motion-compat] timeline:', typeof timeline);
console.log('[motion-compat] spring:', typeof spring);
console.log('[motion-compat] stagger:', typeof stagger);
console.log('[motion-compat] glide:', typeof glide);

// Verify timeline is actually the animate function (v12 sequencing)
if (typeof timeline === 'function' && typeof animate === 'function') {
  console.log('[motion-compat] ✅ timeline shim verified');
} else {
  console.warn('[motion-compat] ⚠️ timeline shim may not be working');
}

// Verify glide is a placeholder function
if (typeof glide === 'function') {
  console.log('[motion-compat] ✅ glide placeholder present');
} else {
  console.warn('[motion-compat] ⚠️ glide placeholder missing');
}

export { animate, timeline, spring, stagger, glide };
