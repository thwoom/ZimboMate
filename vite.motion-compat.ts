// vite.motion-compat.ts
import type { Plugin } from "vite";

const VIRTUAL_ID = "\0motion-compat-entry";

export default function motionCompat(): Plugin {
  return {
    name: "motion-compat",
    enforce: "pre",

    // Intercept every bare "motion" import EXCEPT when the importer is our virtual module.
    resolveId(source, importer) {
      if (source === "motion" && importer !== VIRTUAL_ID) {
        return VIRTUAL_ID;
      }
      return null;
    },

    // Provide a virtual module that re-exports real Motion v12
    // and adds compat shims.
    load(id) {
      if (id !== VIRTUAL_ID) return null;

      // IMPORTANT: import/export from the *real* package here.
      // Because importer === VIRTUAL_ID, our resolveId guard above
      // will NOT intercept, so Vite resolves the actual Motion entry.
      return `
        export * from "motion";
        import { animate as _animate } from "motion";

        // v12 "timeline": use animate(sequence[, opts])
        export function timeline(sequence, opts) {
          return _animate(sequence, opts);
        }

        // v12 removed glide — provide inertia-based replacement
        export const glide = (velocity, power = 0.8, timeConstant = 700, bounceStiffness = 400) => {
          return { type: "inertia", velocity, power, timeConstant, bounceStiffness };
        };
      `;
    }
  };
}
