import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-config-prettier';
import storybook from 'eslint-plugin-storybook';

export default [
  // TypeScript files configuration
  {
    files: ['**/*.{ts,tsx}', '*.{ts,tsx}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/public/**',
      '**/lib/api/client/**',
      '**/lib/auth/client/**',
      '**/lib/admin-api/client/**',
      '**/lib/cs-api/client/**'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          modules: true
        }
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      unicorn,
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'off',
      'no-const-assign': 'error',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/function-component-definition': 'off',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'unicorn/filename-case': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  
  // JavaScript files configuration
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/public/**',
      '**/lib/api/client/**',
      '**/lib/auth/client/**',
      '**/lib/admin-api/client/**',
      '**/lib/cs-api/client/**'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      unicorn,
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'off',
      'no-const-assign': 'error',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'unicorn/filename-case': 'off',
    },
  },
  
  // Prettier configuration (must be last to override other configs)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      ...prettier.rules,
    },
  },
  
  // Storybook specific rules
  {
    files: ['**/*.stories.@(js|jsx|ts|tsx)'],
    plugins: {
      storybook,
    },
    rules: {
      'storybook/hierarchy-separator': 'error',
      'storybook/default-exports': 'error',
    },
  },
];
