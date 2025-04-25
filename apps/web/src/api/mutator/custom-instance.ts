import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { readTokenFromCookie } from '@/utils/cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export async function customInstance<T>(config: AxiosRequestConfig): Promise<T> {
  const source = axios.CancelToken.source();
  const token = readTokenFromCookie();

  const defaultConfig: AxiosRequestConfig = {
    ...config,
    baseURL: API_URL,
    cancelToken: source.token,
    headers: {
      ...config.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true, // バックエンドのsetCookieを受け取るために必要
  };

  try {
    const response = await axios(defaultConfig);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // トークンが無効な場合はログアウト処理など
      document.cookie = 'accessTokenFromGoBackend=; Max-Age=0; path=/'; // 無効なトークンを削除
    }
    return await Promise.reject(error);
  }
}
