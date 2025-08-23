import { ReactNode } from 'react';
import { FrameCorners } from '@arwes/react-frames';
import { Animator } from '@arwes/react-animator';

interface FloatingFrameProps {
  x: number;  // left position (%)
  y: number;  // top position (%)
  w?: number; // width (%)
  h?: number; // height (%)
  children: ReactNode;
}

export function FloatingFrame({ x, y, w = 30, h = 30, children }: FloatingFrameProps) {
  return (
    <Animator duration={{ enter: 0.4, exit: 0.3 }}>
      <div
        style={{
          position: 'absolute',
          top: `${y}%`,
          left: `${x}%`,
          width: `${w}%`,
          height: `${h}%`,
          padding: '1rem',
          borderRadius: '0.5rem',
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // frosted-glass effect
        }}
      >
        <FrameCorners
          strokeWidth={2}
          style={{
            pointerEvents: 'none',
            '--arwes-frames-line-color': 'rgba(84,218,208,0.8)',
            '--arwes-frames-bg-color' : 'rgba(84,218,208,0.15)',
          } as React.CSSProperties}
        />
        {children}
      </div>
    </Animator>
  );
}
