import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, Global } from '@emotion/react';
import type { CSSObject } from '@emotion/react';
import {
  createAppTheme,
  createAppStylesBaseline,
  AnimatorGeneralProvider
} from '@arwes/react';

// Optional: keep a UI-only toggle so existing components don't break.
// Remove this block if you don't need SoundToggle at all.
type SoundCtx = { enabled: boolean; toggle: () => void };
const SoundCtx = createContext<SoundCtx>({ enabled: true, toggle: () => {} });
export const useSoundToggle = () => useContext(SoundCtx);

const theme = createAppTheme();
const stylesBaseline = createAppStylesBaseline(theme);

export function ArwesProviders({ children }: { children: ReactNode }) {
  // UI-only toggle (doesn't control any audio now)
  const [enabled, setEnabled] = useState(true);
  const soundCtx = useMemo<SoundCtx>(() => ({
    enabled, toggle: () => setEnabled(v => !v)
  }), [enabled]);

  return (
    <ThemeProvider theme={theme}>
      <Global styles={stylesBaseline as Record<string, CSSObject>} />
      <AnimatorGeneralProvider duration={{ enter: 0.24, exit: 0.18, stagger: 0.05 }}>
        <SoundCtx.Provider value={soundCtx}>
          {children}
        </SoundCtx.Provider>
      </AnimatorGeneralProvider>
    </ThemeProvider>
  );
}
