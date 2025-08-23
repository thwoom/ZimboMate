import { GridLines, Dots, MovingLines } from '@arwes/react-bgs';
import { useTheme } from '@emotion/react';

export function Background() {
  const theme: any = useTheme();
  const gridColor  = theme?.palette?.primary?.deco?.(2) ?? 'rgba(84, 218, 208, 0.15)';
  const dotsColor  = theme?.palette?.primary?.deco?.(3) ?? 'rgba(84, 218, 208, 0.1)';
  const linesColor = theme?.palette?.primary?.deco?.(1) ?? 'rgba(84, 218, 208, 0.2)';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -2 }}>
      <GridLines lineColor={gridColor} />
      <Dots color={dotsColor} />
      <MovingLines lineColor={linesColor} />
    </div>
  );
}

export default Background;
