import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.{js,ts,jsx,tsx,mjs,cjs}', '!**/eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        loggerFn: false,
        extraFileExtensions: ['.json', '.html'],
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
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'react/function-component-definition': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
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
    ignores: [
      'node_modules/',
      'dist/',
      'lib/api/client/',
      'lib/auth/client/',
      'lib/admin-api/client/',
      'lib/cs-api/client/',
      'public/mockServiceWorker.js',
      'public/pdf.worker.min.js',
      '*.md',
      'package.json',
      'tsconfig.json',
      'public/index.html',
      'src/api/auth/*',
      'src/api/models/*',
      'public/manifest.json',
    ],
  },
  {
    name: 'prettier-config',
    rules: prettier.rules,
  },
];
