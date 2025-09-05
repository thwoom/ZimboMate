import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'test/**/*.test.ts',
      'test/**/*.test.tsx',
    ],
    exclude: [
      'tests/**', // playwright e2e
      'test/e2e/**',
      'test/**/plan.e2e.test.ts',
      'test/**/parser.spec.ts',
      'test/**/prd.int.test.ts',
      'test/task-manager.test.js',
    ],
    reporters: ['verbose'],
    setupFiles: ['test/setup.ts']
  },
});
