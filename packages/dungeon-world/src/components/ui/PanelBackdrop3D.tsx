import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, useReducedMotion } from 'framer-motion';

interface PanelBackdrop3DProps {
  panelId: string;
}

export const PanelBackdrop3D: React.FC<PanelBackdrop3DProps> = ({ panelId }) => {
  const prefersReduced = useReducedMotion();
  const supportsWebGL = typeof document !== 'undefined' && !!document.createElement('canvas').getContext;
  if (!supportsWebGL) return null;

  const colorMap: Record<string, { major: string; minor: string }> = {
    'character-stats': { major: '#7C3AED', minor: '#4C1D95' },
    'equipment': { major: '#10B981', minor: '#047857' },
    'moves': { major: '#60A5FA', minor: '#1D4ED8' },
  };
  const colors = colorMap[panelId] || { major: '#00FFC8', minor: '#00A88A' };

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-0"
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={prefersReduced ? undefined : { opacity: 0.25 }}
      transition={prefersReduced ? undefined : { duration: 0.6 }}
      aria-hidden
    >
      <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 35 }}>
        <gridHelper args={[20, 20, colors.major, colors.minor]} />
      </Canvas>
    </motion.div>
  );
};

export default PanelBackdrop3D;


