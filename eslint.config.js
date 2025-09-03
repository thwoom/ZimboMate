import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// TypeScript-aware ESLint configuration for Dungeon World
export default tseslint.config(
  { 
    ignores: [
      'dist/',
      'node_modules/',
      'test-results/',
      'playwright-report/',
      'coverage/',
      '*.config.js',
      '*.config.ts'
    ] 
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        performance: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        FormData: 'readonly',
        Performance: 'readonly',
        Window: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        prompt: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        screen: 'readonly',
        history: 'readonly',
        getComputedStyle: 'readonly',
        // DOM Types
        Event: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly',
        MessageEvent: 'readonly',
        AudioContext: 'readonly',
        MediaQueryList: 'readonly',
        Node: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
        // Node globals for build scripts
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        NodeJS: 'readonly'
      }
    },
    rules: {
      // Focus on runtime-critical issues only
      'no-undef': 'error',
      'no-unused-vars': 'off', // Use TypeScript version instead
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-empty': 'warn',
      
      // Disable overly strict rules for now
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off'
    }
  }
);
