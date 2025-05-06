import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { postLoggedinLogout, postLoggedinRefresh } from '@/api/auth/auth';

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
    if (axios.isAxiosError(error) && error.response?.status === 401 && !config.url?.includes('/loggedin/refresh') && !config.url?.includes('/loggedin/logout')) {
      try {
        onUnauthorized?.();
        await postLoggedinRefresh(); // ✅ リフレッシュ試行
        const retryResponse = await axios(defaultConfig); // ✅ リトライ
        return retryResponse.data;
      } catch (refreshError) {
        try {
          await postLoggedinLogout();
        } catch (logoutError) {
          console.warn('Logout failed, possibly already logged out', logoutError);
        }

        alert('セッションの有効期限が切れました。もう一度ログインしてください。');
        window.location.href = '/login';

        return await Promise.reject(refreshError);
      }
    }

    return await Promise.reject(error);
  }
}
