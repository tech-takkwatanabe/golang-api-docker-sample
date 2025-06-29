import getRefreshTokenExistsCookie from '@/utils/getRefreshTokenExistsCookie';

describe('getRefreshTokenExistsCookie', () => {
  const COOKIE_NAME = 'refreshTokenByGoBackendExists';

  // Mock document.cookie
  Object.defineProperty(document, 'cookie', {
    get: jest.fn(),
    configurable: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env.REACT_APP_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME before each test
    delete process.env.REACT_APP_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME;
  });

  it('should return true if the refresh token cookie exists', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      `${COOKIE_NAME}=true; otherCookie=value`
    );
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should return false if the refresh token cookie does not exist', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      'otherCookie=value'
    );
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should return true if the refresh token cookie exists with a custom name', () => {
    process.env.REACT_APP_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = 'myCustomRefreshCookie';
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      `myCustomRefreshCookie=true; otherCookie=value`
    );
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should return false if the refresh token cookie does not exist with a custom name', () => {
    process.env.REACT_APP_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME = 'myCustomRefreshCookie';
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      'otherCookie=value'
    );
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle empty cookie string', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue('');
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });

  it('should handle multiple cookies correctly', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      `cookie1=value1; ${COOKIE_NAME}=true; cookie2=value2`
    );
    expect(getRefreshTokenExistsCookie()).toBe(true);
  });

  it('should handle cookie name as part of another cookie value', () => {
    (Object.getOwnPropertyDescriptor(document, 'cookie')?.get as jest.Mock).mockReturnValue(
      `anotherCookie=${COOKIE_NAME}Value`
    );
    expect(getRefreshTokenExistsCookie()).toBe(false);
  });
});
