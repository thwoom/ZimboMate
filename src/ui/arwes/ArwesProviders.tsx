import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, Global } from '@emotion/react';
import { AnimatorGeneralProvider } from '@arwes/react-animator';
import { createAppTheme } from '@arwes/theme';

// Create a proper Arwes theme with cosmic/moebius palette
const arwesTheme = createAppTheme({
  palette: {
    primary: { 
      main: '#54DAD0',
      deco: (index: number) => {
        const colors = [
          'rgba(84, 218, 208, 0.1)',   // 0 - very subtle
          'rgba(84, 218, 208, 0.15)',  // 1 - subtle
          'rgba(84, 218, 208, 0.2)',   // 2 - light
          'rgba(84, 218, 208, 0.3)',   // 3 - medium
          'rgba(84, 218, 208, 0.5)',   // 4 - strong
          'rgba(84, 218, 208, 0.8)',   // 5 - very strong
        ];
        return colors[index] || colors[2];
      }
    },
    secondary: { 
      main: '#8ff6ff',
      deco: (index: number) => {
        const colors = [
          'rgba(143, 246, 255, 0.1)',
          'rgba(143, 246, 255, 0.2)',
          'rgba(143, 246, 255, 0.3)',
        ];
        return colors[index] || colors[1];
      }
    },
    neutral: {
      main: '#001215'
    }
  },
  fontFamily: {
    sans: 'Tomorrow, -apple-system, sans-serif',
    mono: 'JetBrains Mono, monospace'
  }
});

// Optional: keep a UI-only toggle so existing components don't break.
// Remove this block if you don't need SoundToggle at all.
type SoundCtx = { enabled: boolean; toggle: () => void };
const SoundCtx = createContext<SoundCtx>({ enabled: true, toggle: () => {} });
export const useSoundToggle = () => useContext(SoundCtx);

// Basic baseline styles
const stylesBaseline = {
  '*, *::before, *::after': { boxSizing: 'border-box' },
  html: { height: '100%' },
  body: {
    minHeight: '100%',
    margin: 0,
    background: '#001215',
    color: '#8ff6ff',
    fontFamily: 'Inter, system-ui, Roboto, sans-serif'
  },
  a: { color: '#7cc7ff' }
};

export function ArwesProviders({ children }: { children: ReactNode }) {
  // UI-only toggle (doesn't control any audio now)
  const [enabled, setEnabled] = useState(true);
  const soundCtx = useMemo<SoundCtx>(() => ({
    enabled, toggle: () => setEnabled(v => !v)
  }), [enabled]);

  return (
    <ThemeProvider theme={arwesTheme}>
      <Global styles={stylesBaseline} />
      <AnimatorGeneralProvider 
        duration={{ 
          enter: 0.4, 
          exit: 0.3, 
          stagger: 0.05,
          delay: 0.1,
          offset: 0.05 
        }}
      >
        <SoundCtx.Provider value={soundCtx}>
          {children}
        </SoundCtx.Provider>
      </AnimatorGeneralProvider>
    </ThemeProvider>
  );
}
