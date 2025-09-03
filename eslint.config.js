import antfu from '@antfu/eslint-config'

export default antfu({
  // Enable React support for your project
  react: true,
  
  // Enable TypeScript support (auto-detected)
  typescript: true,
  
  // Enable formatting (replaces Prettier)
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier'
  },
  
  // Customize rules for your project
  rules: {
    // Allow console.log in development
    'no-console': 'warn',
    
    // Relax some opinionated rules if needed
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    
    // TypeScript specific adjustments
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
  },
  
  // Ignore patterns
  ignores: [
    'dist/',
    'node_modules/',
    'coverage/',
    'test-results/',
    'playwright-report/',
    '*.config.js',
    '*.config.ts',
    'scripts/',
    'tools/',
    'claude-task-master/',
    'packages/*/dist/',
  ]
})