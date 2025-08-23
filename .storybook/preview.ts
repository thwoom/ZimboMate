import type { Preview } from '@storybook/react-vite'
import '../design/tokens.css'
import 'augmented-ui/augmented-ui.css'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    // Global decorators for theme switching
    backgrounds: {
      disable: true, // We use our own theme system
    },
  },

  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'classic',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'classic', title: 'Classic', left: '🏛️' },
          { value: 'cosmic', title: 'Cosmic', left: '🌌' },
          { value: 'moebius', title: 'Moebius', left: '⚡' },
        ],
        dynamicTitle: true,
      },
    },
    reducedMotion: {
      description: 'Toggle reduced motion for accessibility testing',
      defaultValue: false,
      toolbar: {
        title: 'Reduced Motion',
        icon: 'play',
        items: [
          { value: false, title: 'Motion Enabled', left: '▶️' },
          { value: true, title: 'Reduced Motion', left: '⏸️' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const { theme, reducedMotion } = context.globals;
      
      // Apply theme to document
      document.documentElement.removeAttribute('data-theme');
      if (theme !== 'classic') {
        document.documentElement.setAttribute('data-theme', theme);
      }
      
      // Apply reduced motion
      if (reducedMotion) {
        document.documentElement.setAttribute('data-reduce-motion', 'true');
      } else {
        document.documentElement.removeAttribute('data-reduce-motion');
      }
      
      return Story();
    },
  ],
};

export default preview;