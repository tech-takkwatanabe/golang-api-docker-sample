// apps/web/src/api/mutator/custom-instance.ts
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { postLoggedinRefresh } from '../auth/auth'; // 相対パスは適宜調整

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export async function customInstance<T>(config: AxiosRequestConfig, onUnauthorized?: () => void): Promise<T> {
  const source = axios.CancelToken.source();

  const defaultConfig: AxiosRequestConfig = {
    ...config,
    baseURL: API_URL,
    cancelToken: source.token,
    withCredentials: true,
  };

  try {
    const response = await axios(defaultConfig);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // リフレッシュを試みる
      try {
        await postLoggedinRefresh();
        // リトライ
        const retryResponse = await axios(defaultConfig);
        return retryResponse.data;
      } catch (refreshError) {
        // 再試行後も失敗した場合
        onUnauthorized?.();
        return await Promise.reject(refreshError);
      }
    }

    return await Promise.reject(error);
  }
}
