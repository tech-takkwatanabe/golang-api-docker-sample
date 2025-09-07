/**
 * クッキー `VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME` の値を取得し、認証状態を確認する関数
 * @returns {boolean} クッキーに基づいた認証状態。
 */
const getRefreshTokenExistsCookie = (): boolean => {
  const cookieName = import.meta.env.VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME || 'refreshTokenByGoBackendExists';
  
  // Split cookies by semicolon and space to handle browser behavior
  const cookies = document.cookie
    .split(/;\s*/) // Split by semicolon followed by optional whitespace
    .filter(Boolean) // Remove any empty strings
    .reduce<Record<string, string>>((acc, cookie) => {
      const [key, ...rest] = cookie.split('=');
      if (key) {
        acc[key] = rest.join('=');
      }
      return acc;
    }, {});

  return cookieName in cookies;
};

export default getRefreshTokenExistsCookie;
