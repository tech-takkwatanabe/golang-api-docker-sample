import { describe, it, expect, beforeEach, afterAll, beforeAll, vi } from 'vitest';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';

describe('getRefreshTokenExistsCookie', () => {
  const DEFAULT_COOKIE_NAME = 'refreshTokenByGoBackendExists';
  const CUSTOM_COOKIE_NAME = 'customRefreshToken';
  const originalDocumentCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  const originalEnv = { ...process.env };

  // Create a mock for document.cookie
  let cookieJar = '';

  beforeAll(() => {
    // Mock document.cookie getter and setter
    Object.defineProperty(document, 'cookie', {
      get: () => cookieJar,
      set: (value: string) => {
        const [keyValue] = value.split(';');
        const [key, ...rest] = keyValue.split('=');

        if (key) {
          const cookieEntries = cookieJar ? cookieJar.split('; ') : [];
          const existingIndex = cookieEntries.findIndex((entry) => entry.startsWith(`${key}=`));
          const newEntry = `${key}=${rest.join('=')}`;

          if (existingIndex >= 0) {
            cookieEntries[existingIndex] = newEntry;
          } else {
            cookieEntries.push(newEntry);
          }
          cookieJar = cookieEntries.filter(Boolean).join('; ');
        }
      },
      configurable: true,
    });
  });

  beforeEach(() => {
    cookieJar = '';
    process.env = { ...originalEnv };
    delete process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME;
    vi.clearAllMocks();
  });

  afterAll(() => {
    if (originalDocumentCookie) {
      Object.defineProperty(document, 'cookie', originalDocumentCookie);
    } else {
      delete (document as Partial<Document> & { cookie?: string }).cookie;
    }
    process.env = originalEnv;
  });

  it('should return true when default cookie exists', () => {
    document.cookie = `${DEFAULT_COOKIE_NAME}=anyvalue`;
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should return true when custom cookie name is set via env var', () => {
    process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = CUSTOM_COOKIE_NAME;
    document.cookie = `${CUSTOM_COOKIE_NAME}=anyvalue`;
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should return false when cookie does not exist', () => {
    document.cookie = 'otherCookie=value';
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle empty cookie string', () => {
    cookieJar = '';
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle malformed cookie string', () => {
    cookieJar = '=; ;=value;key;';
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle cookie with empty value', () => {
    document.cookie = `${DEFAULT_COOKIE_NAME}=`;
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should handle cookie with special characters', () => {
    const specialValue = "!@#$%^&*()_+{}|:\\\"<>?[];\\',./`~";
    document.cookie = `${DEFAULT_COOKIE_NAME}=${encodeURIComponent(specialValue)}`;
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should handle multiple cookies with the same name', () => {
    // Add multiple cookies with the same name (should update the existing one)
    document.cookie = `${DEFAULT_COOKIE_NAME}=first`;
    document.cookie = `${DEFAULT_COOKIE_NAME}=second`;
    expect(getRefreshTokenExistsCookie()).toBe(true);
    expect(document.cookie).toContain(`${DEFAULT_COOKIE_NAME}=second`);
  });

  it('should handle custom cookie name via environment variable', () => {
    const customCookieName = 'custom_auth_cookie';
    process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = customCookieName;
    document.cookie = `${customCookieName}=test`;
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should handle non-existent cookie with custom name', () => {
    const customCookieName = 'non_existent_cookie';
    process.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = customCookieName;
    document.cookie = 'otherCookie=value';
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle empty cookie string', () => {
    cookieJar = '';
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle multiple different cookies', () => {
    document.cookie = 'cookie1=value1';
    document.cookie = 'cookie2=value2';
    document.cookie = `${DEFAULT_COOKIE_NAME}=exists`;
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should handle cookie name as part of another cookie value', () => {
    document.cookie = `anotherCookie=${DEFAULT_COOKIE_NAME}Value`;
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });
});
