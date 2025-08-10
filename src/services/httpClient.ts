import { API_CONFIG, buildApiUrl, shouldSendAuth } from '../config/apiConfig';
import { getValidAccessTokenOrRefresh, setTokens, clearTokens, ensureTokensFromLegacyStorage } from './tokenManager';

ensureTokensFromLegacyStorage();

export type ApiFetchOptions = {
  skipAuth?: boolean;
  alreadyRetried?: boolean;
};

function isOptionsMethod(init?: RequestInit): boolean {
  const method = (init?.method || 'GET').toUpperCase();
  return method === 'OPTIONS';
}

function isAuthError(status: number): boolean {
  return status === 401 || status === 403;
}

function toAbsoluteUrl(input: string): string {
  // If input already absolute (http/https), return as is
  if (/^https?:\/\//i.test(input)) return input;
  return buildApiUrl(input);
}

export async function apiFetch(input: string, init: RequestInit = {}, opts: ApiFetchOptions = {}): Promise<Response> {
  const url = toAbsoluteUrl(input);
  const headers = new Headers(init.headers || {});

  // Do not attach Authorization to OPTIONS or when explicitly skipped
  if (!isOptionsMethod(init) && !opts.skipAuth && shouldSendAuth()) {
    const access = await getValidAccessTokenOrRefresh(API_CONFIG.BASE_URL);
    if (access) headers.set('Authorization', `Bearer ${access}`);
  }

  const finalInit: RequestInit = { ...init, headers };
  let res = await fetch(url, finalInit);

  if (isAuthError(res.status) && !opts.alreadyRetried && !opts.skipAuth && shouldSendAuth()) {
    const refreshed = await getValidAccessTokenOrRefresh(API_CONFIG.BASE_URL);
    if (refreshed) {
      headers.set('Authorization', `Bearer ${refreshed}`);
      res = await fetch(url, { ...init, headers });
    } else {
      // If refresh failed, sign out tokens
      clearTokens();
    }
  }

  return res;
}

export function saveLoginTokensFromResponse(payload: any) {
  // Supports both shapes from Cognito-like and custom API
  const access = payload?.AuthenticationResult?.AccessToken || payload?.access_token;
  const refresh = payload?.AuthenticationResult?.RefreshToken || payload?.refresh_token;
  if (access) setTokens(access, refresh || null);
} 