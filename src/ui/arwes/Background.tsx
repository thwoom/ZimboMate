import { GridLines, Dots, MovingLines } from '@arwes/react-bgs';
import { useTheme } from '@emotion/react';

export function Background() {
  const theme: any = useTheme();
  const dotsColor = theme?.palette?.primary?.deco?.(3) ?? 'rgba(84, 218, 208, 0.08)';
  const linesColor = theme?.palette?.primary?.deco?.(1) ?? 'rgba(84, 218, 208, 0.12)';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -2 }}>
      {/* Single subtle background effect - just dots */}
      <Dots 
        color={dotsColor} 
        distance={120}
        size={1}
      />
      {/* Very subtle moving lines */}
      <MovingLines 
        lineColor={linesColor} 
        distance={400}
        speed={0.3}
        lineWidth={1}
      />
      {/* Dark overlay to make panels pop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1
      }} />
    </div>
  );
}

export default Background;
