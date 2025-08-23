/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import pandacss from '@pandacss/dev/postcss';
import motionCompat from './vite.motion-compat';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
const enableCompat = false; // Disabled since we're using Motion v10 consistently

export default defineConfig({
  plugins: [react(), ...(enableCompat ? [motionCompat()] : []), svgr({
    svgrOptions: {
      // SVGO optimization options
      svgoConfig: {
        plugins: [{
          name: 'removeViewBox',
          active: false
        }]
      }
    }
  })],
  optimizeDeps: {
    include: [
      '@emotion/react'
    ]
  },

  css: {
    postcss: {
      plugins: [pandacss()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "styled-system/recipes": path.resolve(__dirname, "./styled-system/recipes/index.mjs")
    }
  },
  test: {
    projects: [
      {
        name: 'unit',
        test: {
          include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          exclude: ['src/**/*.stories.{js,ts,jsx,tsx}']
        }
      },
      {
        extends: true,
        plugins: [
        // The plugin will run tests for the stories defined in your Storybook config
        // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{
              browser: 'chromium'
            }]
          },
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      }
    ]
  }
});