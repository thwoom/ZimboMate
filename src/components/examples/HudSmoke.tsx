// HudSmoke.tsx
import { Animator } from "@arwes/react-animator";
import { FrameCorners } from "@arwes/react-frames";
import * as Frames from '@arwes/react-frames';
import { animate, timeline, spring, stagger, glide } from "motion";

// Verify exports at runtime (sanity check)
if (import.meta.env.DEV) {
  console.log('arwes/react-frames exports:', Object.keys(Frames)); // should include "FrameCorners"
  console.log(
    "[motion compat]",
    typeof animate,
    typeof timeline,
    typeof spring,
    typeof stagger,
    typeof glide
  ); // -> function function function function function
  
  // Sanity assert - Motion compat must be active
  if (typeof animate !== "function" || typeof timeline !== "function" || typeof glide !== "function") {
    throw new Error("Motion compat not active.");
  }
}

export function HudSmoke() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Animator>
        <div style={{ width: 400, maxWidth: '90vw' }}>
          <FrameCorners
            strokeWidth={2}
            style={{ color: '#7fdcff' }}
          >
            <div style={{ padding: 24, background: 'rgba(0, 18, 21, 0.9)' }}>
              <h3 className="text-xl font-bold text-[#54DAD0] mb-4 tracking-wide uppercase">
                HUD Frame Online
              </h3>
              <p className="text-gray-300">
                This frame is now floating in the center of the screen, allowing you to see the beautiful background behind it.
              </p>
            </div>
          </FrameCorners>
        </div>
      </Animator>
    </div>
  );
}
