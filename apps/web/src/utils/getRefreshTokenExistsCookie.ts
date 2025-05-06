/**
 * クッキー `REACT_APP_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME` の値を取得し、認証状態を確認する関数
 * @returns {boolean} クッキーに基づいた認証状態。
 */
const getRefreshTokenExistsCookie = (): boolean => {
  const cookies = document.cookie.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [key, ...rest] = cookie.trim().split('=');
    if (key) {
      acc[key] = rest.join('=');
    }
    return acc;
  }, {});

  const cookieName = process.env.REACT_APP_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME || 'refreshTokenByGoBackendExists';

  return cookies.hasOwnProperty(cookieName);
};

export default getRefreshTokenExistsCookie;
