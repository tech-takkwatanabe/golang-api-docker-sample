import { describe, it, expect, beforeEach, vi } from 'vitest';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';

describe('getRefreshTokenExistsCookie', () => {
  const COOKIE_NAME = 'refreshTokenByGoBackendExists';

  // Mock document.cookie
  Object.defineProperty(document, 'cookie', {
    get: vi.fn(),
    configurable: true,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME before each test
    if (import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME) {
      delete import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME;
    }
  });

  it('should return true if the refresh token cookie exists', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as ReturnType<typeof vi.fn>).mockReturnValue(
      `${COOKIE_NAME}=true; otherCookie=value`
    );
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should return false if the refresh token cookie does not exist', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as ReturnType<typeof vi.fn>).mockReturnValue(
      'otherCookie=value'
    );
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should return true if the refresh token cookie exists with a custom name', () => {
    import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = 'myCustomRefreshCookie';
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as ReturnType<typeof vi.fn>).mockReturnValue(
      `myCustomRefreshCookie=true; otherCookie=value`
    );
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should return false if the refresh token cookie does not exist with a custom name', () => {
    import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = 'myCustomRefreshCookie';
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as ReturnType<typeof vi.fn>).mockReturnValue(
      'otherCookie=value'
    );
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle empty cookie string', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as ReturnType<typeof vi.fn>).mockReturnValue('');
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle multiple cookies correctly', () => {
    // Set the cookie value directly since we're using the mock from setup.ts
    document.cookie = `cookie1=value1; ${COOKIE_NAME}=true; cookie2=value2`;
    
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should handle cookie name as part of another cookie value', () => {
    document.cookie = `anotherCookie=${COOKIE_NAME}Value`;
    
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });
});
