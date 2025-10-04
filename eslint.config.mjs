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
