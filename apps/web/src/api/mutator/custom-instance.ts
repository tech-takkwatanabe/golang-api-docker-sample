import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// 環境変数からAPIのベースURLを取得
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export async function customInstance<T>(config: AxiosRequestConfig): Promise<T> {
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

  try {
    const response = await axios(defaultConfig);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // トークンが無効な場合はログアウト処理など
      localStorage.removeItem('token');
    }
    return await Promise.reject(error);
  }
}
