import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';

describe('getRefreshTokenExistsCookie', () => {
  const COOKIE_NAME = 'refreshTokenByGoBackendExists';
  const originalDocumentCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

  // Create a mock for document.cookie
  let cookieJar = '';

  beforeAll(() => {
    // Mock document.cookie getter and setter
    Object.defineProperty(document, 'cookie', {
      get: () => cookieJar,
      set: (value: string) => {
        // Get the key-value pair before any semicolon (ignoring attributes like path, domain, etc.)
        const [keyValue] = value.split(';');
        const [key, ...rest] = keyValue.split('=');

        if (key) {
          // Update or add the cookie
          const cookieEntries = cookieJar ? cookieJar.split('; ') : [];
          const existingIndex = cookieEntries.findIndex((entry) => entry.startsWith(`${key}=`));

          if (existingIndex >= 0) {
            cookieEntries[existingIndex] = `${key}=${rest.join('=')}`;
          } else {
            cookieEntries.push(`${key}=${rest.join('=')}`);
          }

          // Join with '; ' to match browser behavior
          cookieJar = cookieEntries.join('; ');
        }
      },
      configurable: true,
    });
  });

  beforeEach(() => {
    // Reset the cookie jar before each test
    cookieJar = '';
    // Reset environment variables
    delete process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME;
  });

  afterAll(() => {
    // Restore original document.cookie
    if (originalDocumentCookie) {
      Object.defineProperty(document, 'cookie', originalDocumentCookie);
    } else {
      delete (document as any).cookie;
    }
  });

  it('should return true if the refresh token cookie exists', () => {
    // The cookie value can be any non-empty string, the function only checks for the presence of the key
    document.cookie = `${COOKIE_NAME}=anyvalue`;
    document.cookie = 'otherCookie=value';
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should return false if the refresh token cookie does not exist', () => {
    document.cookie = 'otherCookie=value';
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should return true if the refresh token cookie exists with a custom name', () => {
    const customCookieName = 'myCustomRefreshCookie';
    process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = customCookieName;

    document.cookie = `${customCookieName}=true`;
    document.cookie = 'otherCookie=value';

    const result = getRefreshTokenExistsCookie();

    // Clean up
    delete process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME;

    expect(result).toBe(true);
  });

  it('should return false if the refresh token cookie does not exist with a custom name', () => {
    const customCookieName = 'myCustomRefreshCookie';
    process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = customCookieName;

    document.cookie = 'otherCookie=value';

    const result = getRefreshTokenExistsCookie();

    // Clean up
    delete process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME;

    expect(result).toBe(false);
  });

  it('should handle empty cookie string', () => {
    cookieJar = '';
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle multiple cookies correctly', () => {
    // Set the cookie name to the default for this test
    process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = COOKIE_NAME;

    // Set multiple cookies
    document.cookie = 'cookie1=value1';
    document.cookie = `${COOKIE_NAME}=true`;
    document.cookie = 'cookie2=value2';

    // The actual test - should find the refresh token cookie
    const result = getRefreshTokenExistsCookie();

    // Clean up
    delete process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME;

    expect(result).toBe(true);
  });

  it('should handle cookie name as part of another cookie value', () => {
    document.cookie = `anotherCookie=${COOKIE_NAME}Value`;

    expect(getRefreshTokenExistsCookie()).toBe(false);
  });
});
