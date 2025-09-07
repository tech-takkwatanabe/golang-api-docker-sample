/// <reference types="@testing-library/jest-dom" />

// Extend Vitest's expect with jest-dom matchers
declare global {
  // Add global test variables
  const vi: typeof import('vitest')['vi'] & {
    mocked: <T>(value: T) => T & {
      mockReturnValue: (value: any) => any;
      mockImplementation: (fn: (...args: any[]) => any) => any;
      mockRejectedValue: (value: any) => any;
      mockRejectedValueOnce: (value: any) => any;
      mockResolvedValue: (value: any) => any;
      mockResolvedValueOnce: (value: any) => any;
      mockReturnThis: () => any;
      mockReturnValueOnce: (value: any) => any;
      mockImplementationOnce: (fn: (...args: any[]) => any) => any;
    };
  };
  
  const describe: typeof import('vitest')['describe'];
  const it: typeof import('vitest')['it'];
  const test: typeof import('vitest')['test'];
  const expect: typeof import('vitest')['expect'] & typeof import('@testing-library/jest-dom/matchers');
  const beforeEach: typeof import('vitest')['beforeEach'];
  const afterEach: typeof import('vitest')['afterEach'];
  const beforeAll: typeof import('vitest')['beforeAll'];
  const afterAll: typeof import('vitest')['afterAll'];
  const jest: typeof import('vitest')['vi'];

  // Mock types
  interface MockedFunction<T extends (...args: any) => any> extends jest.MockInstance<ReturnType<T>, Parameters<T>> {
    mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
    mockImplementation: (fn: (...args: Parameters<T>) => ReturnType<T>) => MockedFunction<T>;
    mockRejectedValue: (value: any) => MockedFunction<T>;
    mockRejectedValueOnce: (value: any) => MockedFunction<T>;
    mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockedFunction<T>;
    mockResolvedValueOnce: (value: Awaited<ReturnType<T>>) => MockedFunction<T>;
    mockReturnThis: () => MockedFunction<T>;
    mockReturnValueOnce: (value: ReturnType<T>) => MockedFunction<T>;
    mockImplementationOnce: (fn: (...args: Parameters<T>) => ReturnType<T>) => MockedFunction<T>;
  }

  interface MockInstance<A extends any[] = any, R = any> {
    mockReturnValue: (value: R) => MockInstance<A, R>;
    mockImplementation: (fn: (...args: A) => R) => MockInstance<A, R>;
    mockRejectedValue: (value: any) => MockInstance<A, R>;
    mockRejectedValueOnce: (value: any) => MockInstance<A, R>;
    mockResolvedValue: (value: Awaited<R>) => MockInstance<A, R>;
    mockResolvedValueOnce: (value: Awaited<R>) => MockInstance<A, R>;
    mockReturnThis: () => MockInstance<A, R>;
    mockReturnValueOnce: (value: R) => MockInstance<A, R>;
    mockImplementationOnce: (fn: (...args: A) => R) => MockInstance<A, R>;
  }
}

declare module 'vitest' {
  interface JestAssertion<T = any>
    extends jest.Matchers<void, T>,
      jest.JestMatchers<T> {}
      
  interface CustomMatchers<R = unknown> {
    toBeInTheDocument(): R;
    toBeVisible(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace?: boolean }): R;
    toHaveClass(...classNames: string[]): R;
    toHaveAttribute(attr: string, value?: any): R;
  }

  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchers extends CustomMatchers {}
  interface ExpectStatic extends jest.Expect {}
}
declare const it: typeof import('vitest')['it'];
declare const expect: typeof import('vitest')['expect'];
declare const beforeEach: typeof import('vitest')['beforeEach'];
declare const afterEach: typeof import('vitest')['afterEach'];
declare const beforeAll: typeof import('vitest')['beforeAll'];
declare const afterAll: typeof import('vitest')['afterAll'];
