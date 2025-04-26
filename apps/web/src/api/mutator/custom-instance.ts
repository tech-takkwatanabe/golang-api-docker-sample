import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export async function customInstance<T>(config: AxiosRequestConfig, onUnauthorized?: () => void): Promise<T> {
  const source = axios.CancelToken.source();

  const defaultConfig: AxiosRequestConfig = {
    ...config,
    baseURL: API_URL,
    cancelToken: source.token,
    withCredentials: true, // バックエンドのsetCookieを受け取るために必要
  };

  try {
    const response = await axios(defaultConfig);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // トークンが無効な場合はログアウト処理など
      onUnauthorized?.();
    }
    return await Promise.reject(error);
  }
}
