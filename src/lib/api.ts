import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/apiConfig';
import { ensureTokensFromLegacyStorage, getValidAccessTokenOrRefresh } from '@/services/tokenManager';

ensureTokensFromLegacyStorage();

const DEBUG = (import.meta.env.VITE_DEBUG_API === 'true' || import.meta.env.VITE_DEBUG_AUTH === 'true');

export const BASE_URL = API_CONFIG.BASE_URL || 'https://api.nivasa.io';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: false,
});

// Helper: safe JSON parse without throwing
export function safeParse(text: string): any | null {
  try {
    if (!text || text.trim().length === 0) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Attach request interceptor
api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();

  // Accept header (prefer JSON but allow text/plain)
  config.headers = config.headers || {};
  (config.headers as Record<string, string>)['Accept'] = 'application/json, text/plain, */*';

  // Skip Authorization for preflight
  if (method !== 'OPTIONS') {
    const token = await getValidAccessTokenOrRefresh(BASE_URL);
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  if (DEBUG) {
    const url = `${config.baseURL || ''}${config.url || ''}`;
    // eslint-disable-next-line no-console
    console.log('[api:req]', method, url);
  }

  return config;
});

// Attach response interceptor with robust data normalization
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const ct = String((response.headers?.['content-type'] || response.headers?.['Content-Type'] || '')).toLowerCase();

    if (response.status === 204) {
      // No content: normalize
      (response as any).data = { success: true };
      return response;
    }

    // Axios already parses JSON by default when content-type is application/json.
    // Normalize odd/non-JSON/empty payloads to a safe object to avoid consumer crashes.
    const data = response.data;
    if (ct.includes('application/json')) {
      if (typeof data === 'string') {
        const parsed = safeParse(data);
        (response as any).data = parsed ?? { success: true };
      } else if (data === '' || data == null) {
        (response as any).data = { success: true };
      }
      // else keep object as-is
    } else {
      if (typeof data === 'string') {
        const parsed = safeParse(data);
        (response as any).data = parsed ?? { success: true, persons: [], count: 0 };
      } else if (data == null) {
        (response as any).data = { success: true, persons: [], count: 0 };
      }
    }

    if (DEBUG) {
      const url = (response.config.baseURL || '') + (response.config.url || '');
      // eslint-disable-next-line no-console
      console.log('[api:res]', response.status, ct, url);
    }

    return response;
  },
  async (error: AxiosError) => {
    const response = error.response;
    const config = error.config as (AxiosRequestConfig & { _retry?: boolean });

    if (!response || !config) {
      return Promise.reject(error);
    }

    const status = response.status;
    const isAuthError = status === 401 || status === 403;

    if (isAuthError && !config._retry) {
      try {
        const token = await getValidAccessTokenOrRefresh(BASE_URL);
        if (token) {
          config._retry = true;
          config.headers = config.headers || {};
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
          return api.request(config);
        }
      } catch {
        // fallthrough to reject
      }
    }

    return Promise.reject(error);
  }
);

// Cancellation utility
export function createCancelableRequest<T = any>(config: AxiosRequestConfig) {
  const controller = new AbortController();
  const promise = api.request<T>({ ...config, signal: controller.signal });
  const cancel = () => controller.abort();
  return { promise, cancel };
}

// Persons API wrapper with safe defaults
export async function getPersons(params: { leadUuid: string; limit: number; offset: number }) {
  try {
    const { leadUuid, limit, offset } = params;
    const res = await api.get('/api/v1/persons', { params: { lead_uuid: leadUuid, limit, offset } });
    const data = (res.data || {}) as any;
    const persons = Array.isArray(data.persons) ? data.persons : Array.isArray(data.results) ? data.results : [];
    const count = Number(data.total_count ?? data.count ?? persons.length) || 0;
    return { success: true, persons, count, limit, offset, timestamp: new Date().toISOString() };
  } catch {
    return { success: false, persons: [], count: 0, limit: params.limit, offset: params.offset, timestamp: new Date().toISOString() };
  }
} 