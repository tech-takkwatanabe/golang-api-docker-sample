import { postLoggedinRefresh, postLoggedinLogout } from '../auth/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export type RequestConfig = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
  responseType?: 'json' | 'blob' | 'text';
  baseURL?: string;
  withCredentials?: boolean;
};

type CustomRequestConfig = RequestConfig & {
  _retry?: boolean;
};

export class HttpError<TData = unknown> extends Error {
  readonly name = 'HttpError';
  readonly status: number;
  readonly response: { status: number; data: TData };
  readonly config: RequestConfig;

  constructor(status: number, data: TData, config: RequestConfig) {
    super(`Request failed with status ${status}`);
    this.status = status;
    this.response = { status, data };
    this.config = config;
  }
}

export const isHttpError = <T = unknown>(error: unknown): error is HttpError<T> => {
  return error instanceof HttpError;
};

type PendingRequest = {
  retry: () => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let pendingRequests: PendingRequest[] = [];

const buildUrl = (config: RequestConfig): string => {
  const base = (config.baseURL ?? API_URL).replace(/\/+$/, '');
  const path = config.url.startsWith('/') ? config.url : `/${config.url}`;
  const url = new URL(base + path);
  if (config.params) {
    for (const [key, value] of Object.entries(config.params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, String(v));
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }
  return url.toString();
};

const buildBody = (
  data: unknown,
  headers: Record<string, string>
): { body: BodyInit | undefined; headers: Record<string, string> } => {
  if (data === undefined || data === null) {
    return { body: undefined, headers };
  }
  if (
    data instanceof FormData ||
    data instanceof Blob ||
    data instanceof ArrayBuffer ||
    data instanceof URLSearchParams ||
    typeof data === 'string'
  ) {
    return { body: data as BodyInit, headers };
  }
  const hasContentType = Object.keys(headers).some((h) => h.toLowerCase() === 'content-type');
  const nextHeaders = hasContentType ? headers : { ...headers, 'Content-Type': 'application/json' };
  return { body: JSON.stringify(data), headers: nextHeaders };
};

const parseResponse = async <T>(
  response: Response,
  responseType?: RequestConfig['responseType']
): Promise<T> => {
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined as T;
  }
  if (responseType === 'blob') {
    return (await response.blob()) as T;
  }
  if (responseType === 'text') {
    return (await response.text()) as T;
  }
  const contentType = response.headers.get('Content-Type') ?? '';
  if (responseType === 'json' || contentType.includes('application/json')) {
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
  return (await response.text()) as T;
};

const parseErrorBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('Content-Type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : undefined;
    }
    return await response.text();
  } catch {
    return undefined;
  }
};

const doFetch = async <T>(config: RequestConfig): Promise<T> => {
  const url = buildUrl(config);
  const method = (config.method ?? 'GET').toUpperCase();
  const { body, headers } = buildBody(config.data, { ...(config.headers ?? {}) });

  const response = await fetch(url, {
    method,
    headers,
    body,
    credentials: config.withCredentials === false ? 'same-origin' : 'include',
    signal: config.signal,
  });

  if (!response.ok) {
    const data = await parseErrorBody(response);
    throw new HttpError(response.status, data, config);
  }

  return parseResponse<T>(response, config.responseType);
};

/**
 * Send an HTTP request built from the provided config and optional overrides, handling 401-driven session refresh and queuing/retrying concurrent requests during refresh.
 *
 * The `config` and `extraOptions` are shallow-merged; `extraOptions` values take precedence. Headers are merged with `extraOptions.headers` overriding `config.headers`. The resolved `baseURL` is `extraOptions.baseURL ?? config.baseURL ?? API_URL`.
 *
 * If a request fails with a 401 and the request has not been retried and is not a refresh/logout/login path, this function will attempt a single session refresh. While a refresh is in flight, concurrent requests will be queued and replayed after a successful refresh. On refresh failure the function alerts the user, attempts logout, navigates to `/login`, and rejects with the refresh error.
 *
 * @param config - The primary request configuration
 * @param extraOptions - Optional overrides merged into `config`; values here take precedence
 * @returns The parsed response value of type `T`
 */
export async function customInstance<T>(
  config: RequestConfig,
  extraOptions?: Partial<RequestConfig>
): Promise<T> {
  const merged: CustomRequestConfig = {
    ...config,
    ...extraOptions,
    headers: { ...(config.headers ?? {}), ...(extraOptions?.headers ?? {}) },
    baseURL: extraOptions?.baseURL ?? config.baseURL ?? API_URL,
  };

  try {
    return await doFetch<T>(merged);
  } catch (error) {
    const originalRequest = config as CustomRequestConfig;
    const path = new URL(config.url, API_URL).pathname;

    if (
      isHttpError(error) &&
      error.status === 401 &&
      !originalRequest._retry &&
      !['/loggedin/refresh', '/loggedin/logout', '/login'].includes(path)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          pendingRequests.push({
            retry: () => {
              doFetch<T>(merged).then(resolve, reject);
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        await postLoggedinRefresh();

        isRefreshing = false;
        const queued = pendingRequests;
        pendingRequests = [];
        queued.forEach(({ retry }) => retry());

        return await doFetch<T>(merged);
      } catch (refreshError) {
        isRefreshing = false;
        const queued = pendingRequests;
        pendingRequests = [];
        queued.forEach(({ reject }) => reject(refreshError));
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
