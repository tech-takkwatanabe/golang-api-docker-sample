import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend the Window interface with our mocks
declare global {
  interface Window {
    ResizeObserver: typeof ResizeObserver;
    scrollTo: {
      (options?: ScrollToOptions): void;
      (x: number, y: number): void;
    };
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    cancelAnimationFrame: (handle: number) => void;
  }
}

// Run cleanup after each test case
afterEach(() => {
  cleanup();
  // Reset cookie jar after each test
  Object.defineProperty(document, 'cookie', {
    value: '',
    writable: true,
  });
});

// Mock window.matchMedia
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

// Mock document.cookie
let cookieJar: Record<string, string> = {};
Object.defineProperty(document, 'cookie', {
  get() {
    return Object.entries(cookieJar)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  },
  set(value: string) {
    if (!value) return false;
    
    const [keyValue] = value.split(';');
    const [key, ...values] = keyValue.split('=');
    
    if (key && values.length > 0) {
      cookieJar[key.trim()] = values.join('=');
    }
    
    return true;
  },
  configurable: true,
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Add global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock requestAnimationFrame
window.requestAnimationFrame = (callback) => {
  return window.setTimeout(callback, 0);
};

// Mock cancelAnimationFrame
window.cancelAnimationFrame = (id) => {
  window.clearTimeout(id);
};

// Mock environment variables
Object.defineProperty(process, 'env', {
  value: {
    NODE_ENV: 'test',
  },
  writable: true,
});
