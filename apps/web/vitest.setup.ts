import { expect, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { afterEach as afterEachHook } from 'vitest';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Run cleanup after each test case
afterEachHook(() => {
  cleanup();
});

// Mock global objects before all tests
beforeAll(() => {
  // Mock window.scrollTo
  window.scrollTo = vi.fn();

  // Mock ResizeObserver
  window.ResizeObserver = ResizeObserverMock;
});

// Mock console.error to make test output cleaner
const consoleError = console.error;
beforeAll(() => {
  console.error = (message, ...args) => {
    // Suppress specific error messages if needed
    if (message.includes('Something specific to ignore')) {
      return;
    }
    consoleError(message, ...args);
  };
});

afterAll(() => {
  console.error = consoleError;
});
