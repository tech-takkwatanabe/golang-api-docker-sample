/// <reference types="@testing-library/jest-dom" />
/// <reference types="vitest" />

import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
declare module 'vitest' {
  type Assertion<T = any> = jest.Matchers<void, T> &
    TestingLibraryMatchers<typeof expect.stringContaining, T>;
  
  type AsymmetricMatchersContaining = jest.Matchers<void, any>;
    
  type ExpectStatic = jest.Expect & {
    <T>(actual: T): Assertion<T>;
  };
  
  type ViStatic = {
    fn: typeof jest.fn;
    mock: typeof jest.mock;
    clearAllMocks: typeof jest.clearAllMocks;
    resetAllMocks: typeof jest.resetAllMocks;
    restoreAllMocks: typeof jest.restoreAllMocks;
    spyOn: typeof jest.spyOn;
    mock: (path: string, factory?: () => unknown) => void;
    mocked: <T>(item: T, deep?: boolean) => jest.Mocked<T>;
  };
  
  // Global test variables
  const vi: ViStatic;
  const describe: (title: string, fn: () => void) => void;
  const it: (title: string, fn: (done?: () => void) => void | Promise<void>) => void;
  const test: (title: string, fn: (done?: () => void) => void | Promise<void>) => void;
  const expect: ExpectStatic;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
}
