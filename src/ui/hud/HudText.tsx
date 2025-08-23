// src/ui/hud/HudText.tsx (or new primitives)
import { Animator, Text } from '@arwes/react';

export function HudHeading({ children }: { children: React.ReactNode }) {
  return (
    <Animator duration={{ enter: 0.6 }}>
      <Text as="h1" manager="decipher" fixed>{children}</Text>
    </Animator>
  );
}

export function HudBody({ children }: { children: React.ReactNode }) {
  return (
    <Animator>
      <Text as="p">{children}</Text>
    </Animator>
  );
}
