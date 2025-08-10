// API Configuration
const isLocalHost = typeof window !== 'undefined' ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') : false;
const DEV_LOCAL_BASE = 'http://127.0.0.1:8000';

export const API_CONFIG = {
  BASE_URL: isLocalHost ? DEV_LOCAL_BASE : (import.meta.env.VITE_API_BASE_URL || 'https://api.example.com'),
  AUTH_BASE_URL: isLocalHost ? DEV_LOCAL_BASE : (import.meta.env.VITE_API_BASE_URL || 'https://api.example.com'),
  ENDPOINTS: {
    AUTH: '/api/v1/login',
    CREDIT_REPORT: '/credit-report',
    CREDIT_REPORT_BY_ID: (id: string) => `/credit-report/${id}`,
  },
  HEADERS: {} as Record<string, string>
};

// Helper: should we send auth header?
export const shouldSendAuth = (): boolean => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const envFlag = import.meta.env.VITE_SEND_AUTH_IN_DEV; // optional override
  if (typeof envFlag !== 'undefined') {
    return envFlag === 'true';
  }
  return !isLocal; // default: do not send Authorization on localhost
};

// Build headers for API calls
export const buildHeaders = (method?: string, hasBody?: boolean, token?: string, forceNoAuth?: boolean): HeadersInit => {
  const headers: Record<string, string> = { ...API_CONFIG.HEADERS };
  if (hasBody) headers['Content-Type'] = 'application/json';
  if (!forceNoAuth && shouldSendAuth()) {
    const tk = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '');
    if (tk) headers['Authorization'] = `Bearer ${tk}`;
  }
  return headers;
};

export const buildApiUrl = (endpoint: string): string => {
  const base = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash if present
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash if present
  return `${base}/${cleanEndpoint}`;
};
export const getAuthUrl = (): string => `${API_CONFIG.AUTH_BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`;
export const getCreditReportUrl = (): string => buildApiUrl(API_CONFIG.ENDPOINTS.CREDIT_REPORT);
export const getCreditReportByIdUrl = (id: string): string => buildApiUrl(API_CONFIG.ENDPOINTS.CREDIT_REPORT_BY_ID(id)); 