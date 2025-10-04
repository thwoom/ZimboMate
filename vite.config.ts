import path from 'node:path'
import process from 'node:process'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
    }),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    strictPort: true,
    open: false, // Let user handle opening
    host: '127.0.0.1',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      src: path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Production optimizations
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          animation: ['framer-motion', 'lottie-react'],
          utils: ['zustand', '@tanstack/react-query', 'clsx'],
        },
      },
    },
    // Increase chunk size warning limit for 3D assets
    chunkSizeWarningLimit: 1000,
    // Source maps for debugging in production
    sourcemap: process.env.NODE_ENV === 'development',
  },
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'zustand',
      '@tanstack/react-query',
    ],
    // Exclude these from pre-bundling
    exclude: ['@testing-library/react'],
  },
  // Performance optimizations
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
