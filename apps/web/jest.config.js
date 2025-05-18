/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.tsx?$': ['babel-jest'],
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
