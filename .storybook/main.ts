import type { StorybookConfig } from '@storybook/react-vite';
import motionCompat from '../vite.motion-compat';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  viteFinal: async (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), motionCompat()],
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "styled-system/recipes": require("path").resolve(__dirname, "../styled-system/recipes/index.mjs")
      }
    }
  })
};
export default config;