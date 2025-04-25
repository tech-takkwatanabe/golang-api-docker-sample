export const readTokenFromCookie = (cookieName = 'accessTokenFromGoBackend'): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const deleteCookie = (cookieName: string) => {
  document.cookie = `${cookieName}=; Max-Age=0; path=/`;
};
