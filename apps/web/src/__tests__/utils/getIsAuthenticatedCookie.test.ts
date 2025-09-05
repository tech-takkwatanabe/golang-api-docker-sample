import getIsAuthenticatedCookie from '@/utils/getIsAuthenticatedCookie';

describe('getIsAuthenticatedCookie', () => {
  const COOKIE_NAME = 'isAuthenticatedByGoBackend';

  // Mock document.cookie
  Object.defineProperty(document, 'cookie', {
    get: jest.fn(),
    configurable: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset VITE_AUTH_CHECK_COOKIE_NAME before each test
    delete import.meta.env.VITE_AUTH_CHECK_COOKIE_NAME;
  });

  it('should return true if the authentication cookie exists', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      `${COOKIE_NAME}=true; otherCookie=value`
    );
    expect(getIsAuthenticatedCookie()).toBe(true);
  });

  it('should return false if the authentication cookie does not exist', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      'otherCookie=value'
    );
    expect(getIsAuthenticatedCookie()).toBe(false);
  });

  it('should return true if the authentication cookie exists with a custom name', () => {
    import.meta.env.VITE_AUTH_CHECK_COOKIE_NAME = 'myCustomAuthCookie';
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      `myCustomAuthCookie=true; otherCookie=value`
    );
    expect(getIsAuthenticatedCookie()).toBe(true);
  });

  it('should return false if the authentication cookie does not exist with a custom name', () => {
    import.meta.env.VITE_AUTH_CHECK_COOKIE_NAME = 'myCustomAuthCookie';
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      'otherCookie=value'
    );
    expect(getIsAuthenticatedCookie()).toBe(false);
  });

  it('should handle empty cookie string', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue('');
    expect(getIsAuthenticatedCookie()).toBe(false);
  });

  it('should handle multiple cookies correctly', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      `cookie1=value1; ${COOKIE_NAME}=true; cookie2=value2`
    );
    expect(getIsAuthenticatedCookie()).toBe(true);
  });

  it('should handle cookie name as part of another cookie value', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      `anotherCookie=${COOKIE_NAME}Value`
    );
    expect(getIsAuthenticatedCookie()).toBe(false);
  });
});
