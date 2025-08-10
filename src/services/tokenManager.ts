export type DecodedJwt = {
  exp?: number;
  token_use?: string;
  [key: string]: any;
};

const STORAGE_KEYS = {
  access: 'accessToken',
  refresh: 'refreshToken',
};

const TOKEN_SKEW_SECONDS = Number(import.meta.env.VITE_TOKEN_SKEW_SECONDS || 60);

let inMemoryAccessToken: string | null = null;
let inFlightRefresh: Promise<string | null> | null = null;

function decodeJwt(token: string | null | undefined): DecodedJwt | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function nowEpoch(): number {
  return Math.floor(Date.now() / 1000);
}

export function getStoredAccessToken(): string | null {
  return inMemoryAccessToken || sessionStorage.getItem(STORAGE_KEYS.access) || localStorage.getItem(STORAGE_KEYS.access) || null;
}

export function getStoredRefreshToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.refresh) || localStorage.getItem(STORAGE_KEYS.refresh) || null;
}

export function setTokens(accessToken: string, refreshToken?: string | null) {
  inMemoryAccessToken = accessToken || null;
  if (accessToken) sessionStorage.setItem(STORAGE_KEYS.access, accessToken);
  if (refreshToken) sessionStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
}

export function clearTokens() {
  inMemoryAccessToken = null;
  sessionStorage.removeItem(STORAGE_KEYS.access);
  sessionStorage.removeItem(STORAGE_KEYS.refresh);
  localStorage.removeItem(STORAGE_KEYS.access);
  localStorage.removeItem(STORAGE_KEYS.refresh);
}

function isAccessTokenValid(token: string | null): boolean {
  if (!token) return false;
  const decoded = decodeJwt(token);
  if (!decoded) return false;
  // Must be an access token
  if (decoded.token_use && decoded.token_use !== 'access') return false;
  const exp = decoded.exp || 0;
  return nowEpoch() < exp - TOKEN_SKEW_SECONDS;
}

async function refreshAccessTokenOnce(baseUrl: string): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/v1/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({} as any));
    const newAccess: string | undefined = data?.access_token || data?.AccessToken;
    const newRefresh: string | undefined = data?.refresh_token || data?.RefreshToken;
    if (newAccess) {
      setTokens(newAccess, newRefresh || refreshToken);
      return newAccess;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getValidAccessTokenOrRefresh(baseUrl: string): Promise<string | null> {
  const current = getStoredAccessToken();
  if (isAccessTokenValid(current)) {
    inMemoryAccessToken = current;
    return current;
  }
  // Coalesce refresh requests
  if (!inFlightRefresh) {
    inFlightRefresh = refreshAccessTokenOnce(baseUrl).finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

export function ensureTokensFromLegacyStorage() {
  // Migrate from localStorage if needed
  const lsAccess = localStorage.getItem(STORAGE_KEYS.access);
  if (lsAccess && !sessionStorage.getItem(STORAGE_KEYS.access)) {
    sessionStorage.setItem(STORAGE_KEYS.access, lsAccess);
  }
  const lsRefresh = localStorage.getItem(STORAGE_KEYS.refresh);
  if (lsRefresh && !sessionStorage.getItem(STORAGE_KEYS.refresh)) {
    sessionStorage.setItem(STORAGE_KEYS.refresh, lsRefresh);
  }
  inMemoryAccessToken = sessionStorage.getItem(STORAGE_KEYS.access);
} 