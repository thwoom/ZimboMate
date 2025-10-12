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
    '*.md',
    'components.json',
    '.claude/**',
    '.cursor/**',
    '.vscode/**',
    'src-tauri/**',
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
    files: [
      'src/test/**/*.{ts,tsx,js,jsx}',
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  })
