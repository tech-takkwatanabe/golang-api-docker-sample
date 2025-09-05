/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_API_URL: string;
  readonly VITE_AUTH_CHECK_COOKIE_NAME: string;
  readonly VITE_REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
