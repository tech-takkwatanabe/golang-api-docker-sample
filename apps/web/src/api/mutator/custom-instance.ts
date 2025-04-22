import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';

// 環境変数からAPIのベースURLを取得
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export function customInstance<T>(config: AxiosRequestConfig): Promise<T> {
  const source = axios.CancelToken.source();
  const token = localStorage.getItem('token');

  const defaultConfig: AxiosRequestConfig = {
    ...config,
    baseURL: API_URL,
    cancelToken: source.token,
    headers: {
      ...config.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  return axios(defaultConfig)
    .then((response) => response.data)
    .catch((error: AxiosError) => {
      if (error.response?.status === 401) {
        // トークンが無効な場合はログアウト処理など
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    });
}
