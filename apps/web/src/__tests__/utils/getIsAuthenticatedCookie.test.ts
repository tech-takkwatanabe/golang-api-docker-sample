import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import getIsAuthenticatedCookie from '../../utils/getIsAuthenticatedCookie';

// Mock the environment variables
const COOKIE_NAME = 'isAuthenticatedByGoBackend';

// Save the original import.meta.env
const originalEnv = { ...import.meta.env };

// Create a mock for document.cookie
let cookieJar = '';

describe('getIsAuthenticatedCookie', () => {
  // Store the actual document.cookie implementation
  const originalDocumentCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

  beforeAll(() => {
    // Mock document.cookie getter and setter
    Object.defineProperty(document, 'cookie', {
      get: () => cookieJar,
      set: (value: string) => {
        // Get the key-value pair before any semicolon (ignoring attributes like path, domain, etc.)
        const [keyValue] = value.split(';');
        const [key, ...rest] = keyValue.split('=');
        
        if (!key) return; // Skip if no key
        
        // Split the existing cookies and clean them up
        const cookieEntries = cookieJar 
          ? cookieJar.split('; ').filter(Boolean)
          : [];
        
        // Find if this cookie already exists
        const existingIndex = cookieEntries.findIndex(entry => 
          entry.startsWith(`${key}=`)
        );
        
        const newValue = `${key}=${rest.join('=')}`;
        
        // Update or add the cookie
        if (existingIndex >= 0) {
          cookieEntries[existingIndex] = newValue;
        } else {
          cookieEntries.push(newValue);
        }
        
        // Join with '; ' to match browser behavior
        cookieJar = cookieEntries.join('; ');
      },
      configurable: true,
    });
  });

  beforeEach(() => {
    // Reset the cookie jar before each test
    cookieJar = '';
    // Reset environment variables
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv },
      writable: true
    });
  });

  afterAll(() => {
    // Restore original document.cookie
    if (originalDocumentCookie) {
      Object.defineProperty(document, 'cookie', originalDocumentCookie);
    } else {
      delete (document as { cookie?: string }).cookie;
    }
    // Restore original env values
    Object.entries(originalEnv).forEach(([key, value]) => {
      (import.meta.env as Record<string, string>)[key] = value;
    });
  });

  it('should return true if the authentication cookie exists', () => {
    // The cookie value can be any non-empty string, the function only checks for the presence of the key
    document.cookie = `${COOKIE_NAME}=anyvalue`;
    document.cookie = 'otherCookie=value';
    expect(getIsAuthenticatedCookie()).toBe(true);
  });

  it('should return false if the authentication cookie does not exist', () => {
    document.cookie = 'otherCookie=value';
    expect(getIsAuthenticatedCookie()).toBe(false);
  });

  it('should return true if the authentication cookie exists with a custom name', () => {
    const customCookieName = 'myCustomAuthCookie';
    
    // Set the environment variable before the test runs
    process.env.VITE_AUTH_CHECK_COOKIE_NAME = customCookieName;
    
    // Set the cookie
    document.cookie = `${customCookieName}=true`;
    document.cookie = 'otherCookie=value';
    
    // The function should now look for the custom cookie name
    const result = getIsAuthenticatedCookie();
    
    expect(result).toBe(true);
    
    // Clean up
    delete process.env.VITE_AUTH_CHECK_COOKIE_NAME;
  });

  it('should return false if the authentication cookie does not exist with a custom name', () => {
    const customCookieName = 'myCustomAuthCookie';
    
    // Set the environment variable before the test runs
    process.env.VITE_AUTH_CHECK_COOKIE_NAME = customCookieName;
    
    document.cookie = 'otherCookie=value';
    expect(getIsAuthenticatedCookie()).toBe(false);
    
    // Clean up
    delete process.env.VITE_AUTH_CHECK_COOKIE_NAME;
  });

  it('should handle empty cookie string', () => {
    cookieJar = '';
    expect(getIsAuthenticatedCookie()).toBe(false);
  });

  it('should handle multiple cookies correctly', () => {
    // Set the cookie name to the default for this test
    process.env.VITE_AUTH_CHECK_COOKIE_NAME = COOKIE_NAME;
    
    // Set multiple cookies
    document.cookie = 'cookie1=value1';
    document.cookie = `${COOKIE_NAME}=true`;
    document.cookie = 'cookie2=value2';
    
    // The actual test - should find the auth cookie
    const result = getIsAuthenticatedCookie();
    
    // Verify the cookie jar has the expected cookies
    const cookies = cookieJar.split('; ');
    
    expect(result).toBe(true);
    expect(cookies).toContain('cookie1=value1');
    expect(cookies).toContain(`${COOKIE_NAME}=true`);
    expect(cookies).toContain('cookie2=value2');
  });

  it('should handle cookie name as part of another cookie value', () => {
    document.cookie = `anotherCookie=${COOKIE_NAME}Value`;
    expect(getIsAuthenticatedCookie()).toBe(false);
  });
});
