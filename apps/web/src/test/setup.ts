import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
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

// Mock environment variables
vi.stubGlobal('process', {
  env: {
    NODE_ENV: 'test',
  },
});
