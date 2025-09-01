import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging
    sourcemap: false,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  // Optimize development server
  server: {
    hmr: {
      overlay: false
    }
  },
  // Optimize CSS
  css: {
    devSourcemap: false
  }
});