import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useReducedMotion } from 'framer-motion';

interface R3FHudOverlayProps {
  enabled?: boolean;
}

const Grid: React.FC = () => {
  return (
    <mesh>
      <planeGeometry args={[20, 20, 20, 20]} />
      <meshBasicMaterial color="rgba(120,120,255,0.2)" wireframe />
    </mesh>
  );
};

export const R3FHudOverlay: React.FC<R3FHudOverlayProps> = ({ enabled = true }) => {
  const prefersReduced = useReducedMotion();
  if (!enabled) return null;
  const supportsWebGL = typeof document !== 'undefined' && !!document.createElement('canvas').getContext;
  if (!supportsWebGL) return null;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0"
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={prefersReduced ? undefined : { opacity: 1 }}
      transition={prefersReduced ? undefined : { duration: 0.8 }}
      aria-hidden
    >
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 30 }}>
        <gridHelper args={[40, 40, '#5B5BD6', '#3A3AA8']} />
        <Grid />
      </Canvas>
    </motion.div>
  );
};

export default R3FHudOverlay;


