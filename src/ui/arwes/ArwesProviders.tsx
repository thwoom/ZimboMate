import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, Global, css } from '@emotion/react';
import { AnimatorGeneralProvider } from '@arwes/react-animator';

// Optional: keep a UI-only toggle so existing components don't break.
// Remove this block if you don't need SoundToggle at all.
type SoundCtx = { enabled: boolean; toggle: () => void };
const SoundCtx = createContext<SoundCtx>({ enabled: true, toggle: () => {} });
export const useSoundToggle = () => useContext(SoundCtx);

const theme = {};
const stylesBaseline = css({
  '*, *::before, *::after': { boxSizing: 'border-box' },
  html: { height: '100%' },
  body: {
    minHeight: '100%',
    margin: 0,
    background: '#000',
    color: '#8ff6ff',                // <— text & SVG currentColor
    fontFamily: 'Inter, system-ui, Roboto, sans-serif'
  },
  a: { color: '#7cc7ff' }
});

export function ArwesProviders({ children }: { children: ReactNode }) {
  // UI-only toggle (doesn't control any audio now)
  const [enabled, setEnabled] = useState(true);
  const soundCtx = useMemo<SoundCtx>(() => ({
    enabled, toggle: () => setEnabled(v => !v)
  }), [enabled]);

  return (
    <ThemeProvider theme={theme}>
      <Global styles={stylesBaseline} />
      <AnimatorGeneralProvider duration={{ enter: 0.2, exit: 0.2, stagger: 0.04 }}>
        <SoundCtx.Provider value={soundCtx}>
          {children}
        </SoundCtx.Provider>
      </AnimatorGeneralProvider>
    </ThemeProvider>
  );
}
