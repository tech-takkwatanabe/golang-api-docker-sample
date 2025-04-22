import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';
import prettier from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.mjs', '**/*.cjs', '!**/eslint.config.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Logger: 'readonly',
        SpreadsheetApp: 'readonly',
      },
      parser: typescriptParser,
      parserOptions: {
        project: 'tsconfig.json',
        loggerFn: false,
        extraFileExtensions: ['.json', '.html'],
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: 'tsconfig.json',
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      unicorn: unicorn,
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
    ignores: ['node_modules/', 'dist/', 'lib/api/client/', 'lib/auth/client/', 'lib/admin-api/client/', 'lib/cs-api/client/', 'public/mockServiceWorker.js', 'public/pdf.worker.min.js', 'package.json', 'tsconfig.json', 'index.html', 'src/api/auth/*', 'src/api/models/*', '*.md'],
  },
  {
    name: 'prettier-config',
    rules: prettier.rules,
  },
];
