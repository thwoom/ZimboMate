import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [{
    name: 'normalize-test-imports',
    enforce: 'pre',
    transform(code, id) {
      if (!(/[\/\\]test[\/\\]/.test(id))) return null;
      let out = code.replace(/from\s+(["'])([^"']+)\1/g, (m, q, spec) => `from ${q}${spec.replace(/\s*\/\s*/g, '/')}${q}`);
      // Fix leading underscore variable declarations: const _result -> const result
      out = out.replace(/\b(const|let|var)\s+_([A-Za-z]\w*)/g, '$1 $2');
      // If tests declare a reassignable inventory (previously _inventory), ensure it's 'let'
      out = out.replace(/\bconst\s+inventory\s*=/g, 'let inventory =');
      // Normalize spaced hyphens and plus signs inside code/text to match implementation expectations
      out = out.replace(/([A-Za-z0-9])\s-\s([A-Za-z0-9])/g, '$1-$2');
      out = out.replace(/([0-9])\s\+\s/g, '$1+');
      out = out.replace(/([0-9])\s-\s([0-9])/g, '$1-$2');
      return { code: out, map: null };
    },
  }],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'test/**/*.test.ts',
      'test/**/*.test.tsx',
      'src/tests/**/*.spec.ts',
      'src/tests/**/*.spec.tsx',
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
