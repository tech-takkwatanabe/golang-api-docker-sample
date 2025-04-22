/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_API_URL: string;
  // 他の環境変数があればここに追加
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};
