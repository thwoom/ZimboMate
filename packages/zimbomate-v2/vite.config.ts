import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize for production
      babel: {
        plugins: process.env.NODE_ENV === 'production' ? [
          ['babel-plugin-react-remove-properties', { properties: ['data-testid'] }]
        ] : []
      }
    }),
    tailwindcss()
  ],
  server: {
    port: 3000,
    strictPort: true,
    open: false
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Production optimizations
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          animation: ['framer-motion', 'lottie-react'],
          utils: ['zustand', '@tanstack/react-query', 'clsx']
        }
      }
    },
    // Increase chunk size warning limit for 3D assets
    chunkSizeWarningLimit: 1000,
    // Source maps for debugging in production
    sourcemap: process.env.NODE_ENV === 'development'
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
      '@tanstack/react-query'
    ],
    // Exclude these from pre-bundling
    exclude: ['@testing-library/react']
  },
  // Performance optimizations
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})