import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { postLoggedinRefresh, postLoggedinLogout } from '../auth/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

type CustomAxiosRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
};

export async function customInstance<T>(
  config: AxiosRequestConfig,
  extraOptions?: AxiosRequestConfig
): Promise<T> {
  const defaultConfig: AxiosRequestConfig = {
    ...config,
    ...extraOptions,
    withCredentials: true,
    baseURL: API_URL,
  };

  try {
    const response = await axiosInstance(defaultConfig);
    return response.data;
  } catch (error) {
    const originalRequest = config as CustomAxiosRequestConfig;
    const path = new URL(config.url!, API_URL).pathname;

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !['/loggedin/refresh', '/loggedin/logout', '/login'].includes(path)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push(() => resolve(axiosInstance(defaultConfig)));
        });
      }

      isRefreshing = true;
      try {
        await postLoggedinRefresh();

        isRefreshing = false;
        pendingRequests.forEach((cb) => cb());
        pendingRequests = [];

        const retryResponse = await axiosInstance(defaultConfig);
        return retryResponse.data;
      } catch (refreshError) {
        isRefreshing = false;
        pendingRequests = [];
        alert('セッションの有効期限が切れました。もう一度ログインしてください。');
        try {
          await postLoggedinLogout();
        } catch (logoutError) {
          console.warn('Logout failed after refresh failure', logoutError);
        }

        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
}
