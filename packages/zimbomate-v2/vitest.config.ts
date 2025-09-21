import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'app-screenshot-tester/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/*.test.*',
        '**/*.spec.*',
        'src/utils/testing.tsx', // Test utilities
        'src/**/mock*.ts',       // Mock data files
        'src/App.*.tsx'          // Demo/experimental app files
      ],
      thresholds: {
        global: {
          branches: 60,    // Lower for gaming app with complex UI
          functions: 65,
          lines: 70,
          statements: 70
        },
        'src/stores/': {
          branches: 80,    // Higher coverage for critical state management
          functions: 85,
          lines: 85,
          statements: 85
        },
        'src/services/': {
          branches: 75,    // Higher coverage for business logic
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // Performance testing
    benchmark: {
      include: ['**/*.{bench,benchmark}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})