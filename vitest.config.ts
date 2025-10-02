import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    clearMocks: true,
    restoreMocks: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/**', 'node_modules/**', 'dist/**', 'app-screenshot-tester/**'],
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
        'src/utils/testing.tsx',
        'src/**/mock*.ts',
        'src/App.*.tsx',
      ],
      thresholds: {
        'global': {
          branches: 60,
          functions: 65,
          lines: 70,
          statements: 70,
        },
        'src/stores/': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        'src/services/': {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    benchmark: {
      include: ['**/*.{bench,benchmark}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
