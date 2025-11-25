import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: false,
  typescript: true,
  react: true,
  test: {
    rules: {
      'no-console': 'off',
    },
  },
  ignores: [
    'dist',
    'node_modules',
    'coverage',
    'playwright-report',
    'screenshots',
    'visual-*',
    'test-results',
    'logs',
    'lint-report.json',
    'docs/**',
    'zimbomate-v3-docs/**',
    '**/scripts/**',
    '*.md',
    'components.json',
    '.claude/**',
    '.cursor/**',
    '.vscode/**',
    'src-tauri/**',
    'scripts/**',
    'src/components/chronicle/**',
    'src/services/chronicle/**',
    'src/stores/chronicleStore.ts',
    'src/types/chronicle.ts',
    'src/utils/chronicle*',
    'src/components/game/ChronicleEnabledDiceRoller.tsx',
    'src/services/ChronicleActionListenerService.ts',
    'src/**/chronicle*.test.tsx',
  ],
})
  .append({
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*'],
              message:
                'Node built-ins are not available in the WebView. Use browser-safe utilities or Tauri commands.',
            },
          ],
          paths: [
            {
              name: 'process',
              message:
                'Access environment variables via import.meta.env or a browser-safe helper.',
            },
          ],
        },
      ],
    },
  })
  .append({
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  })
  .append({
    files: [
      'src/test/**/*.{ts,tsx,js,jsx}',
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  })
  .append({
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-exports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'import/consistent-type-specifier-style': 'off',
      'ts/consistent-type-definitions': 'off',
      'test/prefer-lowercase-title': 'off',
      'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
      'react-hooks-extra/no-unnecessary-use-prefix': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-refresh/only-export-components': 'off',
      'unicorn/prefer-type-error': 'off',
      'no-console': 'off',
      'regexp/no-useless-non-capturing-group': 'off',
      'regexp/no-unused-capturing-group': 'off',
      'regexp/no-dupe-characters-character-class': 'off',
      'unused-imports/no-unused-imports': 'off',
      'ts/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-cond-assign': 'off',
      'no-unused-vars': 'off',
      'react/no-array-index-key': 'off',
      'react/no-clone-element': 'off',
      'import/first': 'off',
      'eslint-comments/no-unused-disable': 'off',
    },
  })
