import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, buildApiUrl, shouldSendAuth } from '../config/apiConfig';
import { getValidAccessTokenOrRefresh, setTokens, clearTokens, ensureTokensFromLegacyStorage } from './tokenManager';

ensureTokensFromLegacyStorage();

export type ApiFetchOptions = {
  skipAuth?: boolean;
  alreadyRetried?: boolean;
};

function isOptionsMethod(method?: string): boolean {
  return (method || 'GET').toUpperCase() === 'OPTIONS';
}

function toAbsoluteUrl(input: string): string {
  if (/^https?:\/\//i.test(input)) return input;
  return buildApiUrl(input);
}

// Create a single Axios instance
const api: AxiosInstance = axios.create({
  // We pass absolute URLs, so baseURL is optional
  timeout: 30000,
  withCredentials: false,
});

// Attach request interceptor
api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();
  // Enforce JSON for POST/PUT/PATCH when data is a plain object
  if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && config.headers) {
    const hdrs = config.headers as Record<string, string>;
    if (!hdrs['Content-Type']) hdrs['Content-Type'] = 'application/json';
  }

  // Custom flag to skip auth
  const skipAuth = (config as any)._skipAuth === true;

  if (!isOptionsMethod(method) && !skipAuth && shouldSendAuth()) {
    const token = await getValidAccessTokenOrRefresh(API_CONFIG.BASE_URL);
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`; // exact casing
    }
  }
  return config;
});

// Response interceptor for reactive refresh + retry once
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const response = error.response;
    const config = error.config as (AxiosRequestConfig & { _retry?: boolean; _skipAuth?: boolean });

    if (!response || !config) {
      return Promise.reject(error);
    }

    const status = response.status;
    const isAuthError = status === 401 || status === 403;

    if (isAuthError && !config._retry && !config._skipAuth && shouldSendAuth()) {
      try {
        const refreshed = await getValidAccessTokenOrRefresh(API_CONFIG.BASE_URL);
        if (refreshed) {
          config._retry = true;
          (config.headers as Record<string, string>) = {
            ...(config.headers as Record<string, string>),
            Authorization: `Bearer ${refreshed}`,
          };
          return api.request(config);
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    }

    return Promise.reject(error);
  }
);

// Helper for login token storage (kept for existing call sites)
export function saveLoginTokensFromResponse(payload: any) {
  const access = payload?.AuthenticationResult?.AccessToken || payload?.access_token;
  const refresh = payload?.AuthenticationResult?.RefreshToken || payload?.refresh_token;
  if (access) setTokens(access, refresh || null);
}

// Wrapper that accepts fetch-like signature but uses Axios under the hood
export async function apiFetch(input: string, init: RequestInit = {}, opts: ApiFetchOptions = {}): Promise<Response> {
  const url = toAbsoluteUrl(input);

  const method = (init.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {};
  // Normalize headers
  const initHeaders = new Headers(init.headers || {});
  initHeaders.forEach((v, k) => { headers[k] = v; });

  // Axios expects `data` instead of `body`
  const data = init.body as any;

  try {
    const res = await api.request({
      url,
      method,
      headers,
      data,
      _skipAuth: opts.skipAuth === true,
    } as any);

    // Adapt AxiosResponse to Fetch-like Response
    const blob = new Blob([typeof res.data === 'string' ? res.data : JSON.stringify(res.data)], { type: 'application/json' });
    const fetchLike = new Response(blob, {
      status: res.status,
      statusText: res.statusText,
      headers: new Headers(res.headers as any),
    });
    return fetchLike;
  } catch (err: any) {
    if (err?.response) {
      const r = err.response as AxiosResponse;
      const blob = new Blob([typeof r.data === 'string' ? r.data : JSON.stringify(r.data)], { type: 'application/json' });
      return new Response(blob, { status: r.status, statusText: r.statusText, headers: new Headers(r.headers as any) });
    }
    throw err;
  }
} 