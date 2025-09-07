/// <reference types="vitest" />

// Extend the global Jest namespace with Vitest types
declare global {
  // Extend the Mocked type to include mock methods
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

  // Extend the vi namespace to include our custom mocks
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

  // Extend the vi namespace
  namespace Vi {
    interface MockedFunction<T extends (...args: any) => any> extends globalThis.MockedFunction<T> {}
    interface MockInstance<A extends any[] = any, R = any> extends globalThis.MockInstance<A, R> {}
  }
}

// Extend the vitest module
declare module 'vitest' {
  interface MockInstance<A extends any[] = any, R = any> extends globalThis.MockInstance<A, R> {}
  interface MockedFunction<T extends (...args: any) => any> extends globalThis.MockedFunction<T> {}
}
