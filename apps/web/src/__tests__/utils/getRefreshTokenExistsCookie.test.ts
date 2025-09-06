import { describe, it, expect, beforeEach, vi, afterAll, beforeAll } from 'vitest';
import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';

describe('getRefreshTokenExistsCookie', () => {
  const COOKIE_NAME = 'refreshTokenByGoBackendExists';
  const originalDocumentCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
  const originalEnv = { ...import.meta.env };

  // Mock document.cookie
  const mockCookie = {
    get: vi.fn(),
    set: vi.fn(),
  };

  beforeAll(() => {
    Object.defineProperty(document, 'cookie', {
      get: mockCookie.get,
      set: mockCookie.set,
      configurable: true,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME before each test
    if (import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME) {
      delete import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME;
    }
  });

  afterAll(() => {
    if (originalDocumentCookie) {
      Object.defineProperty(document, 'cookie', originalDocumentCookie);
    } else {
      delete (document as any).cookie;
    }
    // Restore original env values
    Object.entries(originalEnv).forEach(([key, value]) => {
      (import.meta.env as any)[key] = value;
    });
  });

  it('should return true if the refresh token cookie exists', () => {
    // The cookie value can be any non-empty string, the function only checks for the presence of the key
    mockCookie.get.mockReturnValue(`${COOKIE_NAME}=anyvalue; otherCookie=value`);
    expect(getRefreshTokenExistsCookie()).toBe(true);
    expect(mockCookie.get).toHaveBeenCalled();
  });

  it('should return false if the refresh token cookie does not exist', () => {
    mockCookie.get.mockReturnValue('otherCookie=value');
    expect(getRefreshTokenExistsCookie()).toBe(false);
    expect(mockCookie.get).toHaveBeenCalled();
  });

  it('should return true if the refresh token cookie exists with a custom name', () => {
    const customCookieName = 'myCustomRefreshCookie';
    // @ts-ignore - We're intentionally modifying a readonly property for testing
    import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = customCookieName;
    mockCookie.get.mockReturnValue(`${customCookieName}=true; otherCookie=value`);
    expect(getRefreshTokenExistsCookie()).toBe(true);
    expect(mockCookie.get).toHaveBeenCalled();
  });

  it('should return false if the refresh token cookie does not exist with a custom name', () => {
    const customCookieName = 'myCustomRefreshCookie';
    // @ts-ignore - We're intentionally modifying a readonly property for testing
    import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = customCookieName;
    mockCookie.get.mockReturnValue('otherCookie=value');
    expect(getRefreshTokenExistsCookie()).toBe(false);
    expect(mockCookie.get).toHaveBeenCalled();
  });

  it('should handle empty cookie string', () => {
    mockCookie.get.mockReturnValue('');
    expect(getRefreshTokenExistsCookie()).toBe(false);
    expect(mockCookie.get).toHaveBeenCalled();
  });

  it('should handle multiple cookies correctly', () => {
    // Simulate the exact format that document.cookie would return
    mockCookie.get.mockReturnValue(`cookie1=value1; ${COOKIE_NAME}=true; cookie2=value2`);
    expect(getRefreshTokenExistsCookie()).toBe(true);
    expect(mockCookie.get).toHaveBeenCalled();
  });

  it('should handle cookie name as part of another cookie value', () => {
    mockCookie.get.mockReturnValue(`anotherCookie=${COOKIE_NAME}Value`);
    
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });
});
