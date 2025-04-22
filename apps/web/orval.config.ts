import { defineConfig } from 'orval';

export default defineConfig({
  goAuth: {
    input: {
      target: '../api/docs/swagger.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/api',
      schemas: './src/api/models',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useInfiniteQueryParam: 'limit',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: ['npx prettier --write ./src/api/auth/auth.ts'],
    },
  },
});
