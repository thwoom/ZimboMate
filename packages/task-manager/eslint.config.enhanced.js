import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// 🦄 Advanced plugins for technical debt cleanup
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  { 
    // 🎯 FOCUS ON CORE APPLICATION CODE ONLY
    ignores: [
      // Build outputs
      'dist/',
      'node_modules/',
      '*.config.js',
      '*.config.cjs',
      
      // Scripts and tools (temporary - will be fixed later)
      'scripts/',
      'tools/',
      'ops/',
      
      // Test outputs
      'test-results/',
      'playwright-report/',
      'coverage/',
      
      // Generated files
      '*.d.ts',
      
      // Legacy files that need major refactoring
      'claude-task-master/',
      
      // Documentation
      '*.md',
      'docs/',
      
      // Config files
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
    ] 
  },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    // 🎯 ONLY TARGET CORE APPLICATION FILES
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
      },
    },
    plugins: {
      unicorn,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // 🧹 UNUSED IMPORTS - Auto-remove unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      
      // 📋 IMPORT SORTING - Auto-sort imports
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      
      // 🦄 UNICORN RULES - Modern JS patterns (auto-fixable)
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/throw-new-error': 'error',
      
      // 🔧 AUTO-FIXABLE TYPESCRIPT RULES
      'prefer-const': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      
      // 🚫 EMPTY BLOCKS - Add TODO comments
      'no-empty': 'error',
      
      // ⚠️ WARNINGS (manual review)
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-case-declarations': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      
      // Turn off conflicting rules
      '@typescript-eslint/no-unused-vars': 'off', // Use unused-imports instead
    },
  }
);