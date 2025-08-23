import { Animator, GridLines, Dots, MovingLines } from '@arwes/react';
import { useTheme } from '@emotion/react';

export default function Background() {
  const theme = useTheme() as any;
  return (
    <Animator>
      <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
        <GridLines lineColor={theme.colors.primary.deco(0)} />
        <Dots color={theme.colors.primary.deco(1)} />
        <MovingLines lineColor={theme.colors.primary.deco(2)} />
      </div>
    </Animator>
  );
}
