/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: [...configDefaults.exclude, '**/node_modules/**'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.d.ts',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      ],
    },
    // Enable rich output for better test debugging
    reporters: ['default'],
    // Add jsdom environment variables
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000',
      },
    },
    // Enable watch mode in development
    watch: process.env.CI !== 'true',
    // Configure global test timeout
    testTimeout: 10000,
    // Isolate environment for each test file
    isolate: true,
    // Mock modules by default
    deps: {
      optimizer: {
        web: {
          include: ['@testing-library/user-event'],
        },
      },
    },
    // Environment variables
    env: {
      NODE_ENV: 'test',
    },
  },
});
