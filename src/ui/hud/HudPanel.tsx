import { Animator, FrameSVGCorners } from '@arwes/react';

export default function HudPanel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <Animator>
        <FrameSVGCorners strokeWidth={2} />
      </Animator>
      <div style={{ position: 'relative', padding: 16 }}>{children}</div>
    </div>
  );
}
