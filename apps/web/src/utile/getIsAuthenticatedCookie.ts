/**
 * クッキー `isAuthenticatedByGoBackend` の値を取得し、認証状態を確認する関数
 * @returns {boolean} クッキーに基づいた認証状態。
 */
const getIsAuthenticatedCookie = (): boolean => {
  const cookies = document.cookie.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [key, ...rest] = cookie.trim().split('=');
    if (key) {
      acc[key] = rest.join('=');
    }
    return acc;
  }, {});

  return cookies.hasOwnProperty('isAuthenticatedByGoBackend');
};

export default getIsAuthenticatedCookie;
