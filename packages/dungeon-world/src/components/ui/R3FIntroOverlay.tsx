import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useReducedMotion } from 'framer-motion';

const IntroScene: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 30, 10, 10]} />
      <meshBasicMaterial color="#00FFC8" wireframe opacity={0.2} transparent />
    </mesh>
  );
};

export const R3FIntroOverlay: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  const prefersReduced = useReducedMotion();
  if (!enabled) return null;
  const supportsWebGL = typeof document !== 'undefined' && !!document.createElement('canvas').getContext;
  if (!supportsWebGL) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[1000]"
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={prefersReduced ? undefined : { opacity: 1 }}
      transition={prefersReduced ? undefined : { duration: 0.8 }}
      aria-hidden
    >
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 25 }}>
        <IntroScene />
      </Canvas>
    </motion.div>
  );
};

export default R3FIntroOverlay;


