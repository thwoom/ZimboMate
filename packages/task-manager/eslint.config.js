import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Base configuration for all files
  js.configs.recommended,

     // TypeScript files
   {
     files: ['**/*.{ts,tsx}'],
     languageOptions: {
       parser: tsparser,
       parserOptions: {
         ecmaVersion: 2022,
         sourceType: 'module',
         ecmaFeatures: {
           jsx: true,
         },
         // project: './tsconfig.json', // Removed to avoid script file parsing errors
         // tsconfigRootDir: process.cwd(), // Removed to avoid script file parsing errors
       },
       globals: {
         // Browser globals
         window: 'readonly',
         document: 'readonly',
         console: 'readonly',
         localStorage: 'readonly',
         sessionStorage: 'readonly',
         navigator: 'readonly',
         performance: 'readonly',
         alert: 'readonly',
         confirm: 'readonly',
         setTimeout: 'readonly',
         clearTimeout: 'readonly',
         setInterval: 'readonly',
         clearInterval: 'readonly',
         // DOM types
         HTMLElement: 'readonly',
         HTMLInputElement: 'readonly',
         HTMLButtonElement: 'readonly',
         MediaQueryList: 'readonly',
         File: 'readonly',
         getComputedStyle: 'readonly',
         history: 'readonly',
         // Node.js globals (for some utility files)
         process: 'readonly',
         Buffer: 'readonly',
         global: 'readonly',
         module: 'readonly',
         require: 'readonly',
         exports: 'readonly',
         __dirname: 'readonly',
         __filename: 'readonly',
         NodeJS: 'readonly',
       },
     },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // ===== TypeScript Rules (Auto-fixable) =====
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // ===== React Rules (Auto-fixable) =====
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // TypeScript handles this
      'react/display-name': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-array-index-key': 'warn',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'warn',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-render-return-value': 'error',
      'react/no-string-refs': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'warn',
      'react/self-closing-comp': 'error',
      'react/sort-comp': 'off', // Too strict for modern React
      'react/style-prop-object': 'error',
      'react/void-dom-elements-no-children': 'error',

      // ===== React Hooks Rules =====
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ===== Accessibility Rules (Auto-fixable) =====
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',

      // ===== General JavaScript Rules (Auto-fixable) =====
      'no-unused-vars': 'off', // Use TypeScript version
      'no-var': 'error',
      'prefer-const': 'off', // Use TypeScript version
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'require-await': 'off', // Use TypeScript version
      'yoda': 'error',

      // ===== Code Quality Rules (Relaxed for existing codebase) =====
      'complexity': ['warn', 15],
      'max-depth': ['warn', 6],
      'max-lines': ['warn', 500],
      'max-lines-per-function': ['warn', 100],
      'max-params': ['warn', 7],
      'max-statements': ['warn', 30],

      // ===== Formatting Rules (Auto-fixable) =====
      'array-bracket-spacing': ['error', 'never'],
      'block-spacing': 'error',
      'brace-style': ['error', '1tbs'],
      'camelcase': ['error', { properties: 'never' }],
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': 'error',
      'comma-style': 'error',
      'computed-property-spacing': 'error',
      'eol-last': 'error',
      'func-call-spacing': 'error',
      // 'indent': ['warn', 2, { SwitchCase: 1 }], // Disabled due to stack overflow in large files
      'key-spacing': 'error',
      'keyword-spacing': 'error',
      // 'linebreak-style': ['error', 'unix'], // Disabled for Windows compatibility
      'max-len': ['warn', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreComments: true }],
      'no-mixed-spaces-and-tabs': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'space-before-blocks': 'error',
      'space-before-function-paren': ['error', 'never'],
      'space-in-parens': 'error',
      'space-infix-ops': 'error',
      'space-unary-ops': 'error',
      'spaced-comment': 'error',
    },
  },

  // Scripts and tools (more relaxed)
  {
     files: ['scripts/**/*', 'tools/**/*', 'ops/**/*', 'test/**/*'],
     languageOptions: {
       globals: {
         process: 'readonly',
         console: 'readonly',
         __dirname: 'readonly',
         __filename: 'readonly',
         Buffer: 'readonly',
         global: 'readonly',
         module: 'readonly',
         require: 'readonly',
         exports: 'readonly',
       },
     },
    rules: {
       'no-console': 'off',
       'max-lines': 'off',
       'max-lines-per-function': 'off',
       'no-undef': 'off', // Node.js globals
     },
   },

  // Test files (more relaxed)
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      'no-console': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.cjs',
      'vite.config.ts',
      'vitest.config.js',
      'playwright.config.ts',
      'docs/**',
      'scripts/**',
      'tools/**',
      'ops/**',
      'test-results/**',
      'playwright-report/**',
      'coverage/**',
      '**/*.d.ts',
      'claude-task-master/**',
    ],
  },
];
