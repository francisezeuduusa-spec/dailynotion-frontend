/**
 * api.ts — DailyNotion real API layer
 * All calls go to VITE_API_URL (your Render backend).
 * Access token is attached to every request automatically.
 * On 401 TOKEN_EXPIRED the client silently refreshes and retries.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// ─────────────────────────────────────────────
// Token storage (memory + localStorage fallback)
// ─────────────────────────────────────────────
// Read tokens from localStorage on every module load
// This ensures tokens survive full page reloads from OAuth redirects
const _storedAccess = localStorage.getItem('dn_access_token');
const _storedRefresh = localStorage.getItem('dn_refresh_token');
let _accessToken: string | null = _storedAccess && _storedAccess !== 'null' && _storedAccess !== 'undefined' ? _storedAccess : null;
let _refreshToken: string | null = _storedRefresh && _storedRefresh !== 'null' && _storedRefresh !== 'undefined' ? _storedRefresh : null;

export const tokenStore = {
  setTokens(access: string, refresh: string) {
    _accessToken = access;
    _refreshToken = refresh;
    localStorage.setItem('dn_access_token', access);
    localStorage.setItem('dn_refresh_token', refresh);
  },
  clearTokens() {
    _accessToken = null;
    _refreshToken = null;
    localStorage.removeItem('dn_access_token');
    localStorage.removeItem('dn_refresh_token');
    // Also clear any stale string values that could corrupt the check
    localStorage.setItem('dn_access_token', '');
    localStorage.setItem('dn_refresh_token', '');
  },
  getAccessToken: () => _accessToken,
  getRefreshToken: () => _refreshToken,
};

// ─────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────
const BASE_URL = 'https://dailynotion-backend.onrender.com';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token on every request
// Re-reads from localStorage each time in case token was set
// after module load (e.g. after an OAuth redirect)
client.interceptors.request.use((config) => {
  let token = tokenStore.getAccessToken();
  // Fallback: if in-memory token is null, try localStorage directly
  if (!token) {
    const stored = localStorage.getItem('dn_access_token');
    if (stored && stored !== 'null' && stored !== 'undefined' && stored !== '') {
      token = stored;
      _accessToken = stored; // restore in-memory copy
    }
  }
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401 TOKEN_EXPIRED, then retry once
let _isRefreshing = false;
let _refreshQueue: Array<(token: string) => void> = [];

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ code?: string }>) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    const isTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry;

    if (!isTokenExpired) return Promise.reject(error);

    if (_isRefreshing) {
      // Queue up while a refresh is in flight
      return new Promise((resolve) => {
        _refreshQueue.push((newToken: string) => {
          if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(client(original));
        });
      });
    }

    original._retry = true;
    _isRefreshing = true;

    try {
      const refreshToken = tokenStore.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
      tokenStore.setTokens(data.accessToken, data.refreshToken);

      _refreshQueue.forEach((cb) => cb(data.accessToken));
      _refreshQueue = [];

      if (original.headers) original.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return client(original);
    } catch (refreshError) {
      tokenStore.clearTokens();
      _refreshQueue = [];
      window.location.hash = '/login';
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  }
);

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const authApi = {
  signup: (fullName: string, email: string, password: string) =>
    client.post('/api/auth/signup', { full_name: fullName, email, password }),

  login: (email: string, password: string) =>
    client.post('/api/auth/login', { email, password }),

  logout: (refreshToken: string) =>
    client.post('/api/auth/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    client.post('/api/auth/refresh', { refreshToken }),

  me: () => client.get('/api/auth/me'),

  updateProfile: (fullName: string) =>
    client.put('/api/auth/me', { full_name: fullName }),

  changePassword: (currentPassword: string, newPassword: string) =>
    client.post('/api/auth/change-password', { currentPassword, newPassword }),

  deleteAccount: (confirmation: string) =>
    client.delete('/api/auth/account', { data: { confirmation } }),

  // Google OAuth — redirect browser to backend URL
  getGoogleAuthUrl: () => `${BASE_URL}/api/auth/google`,
};

// ─────────────────────────────────────────────
// PLANS & BILLING
// ─────────────────────────────────────────────
export const billingApi = {
  getPlans: () => client.get('/api/plans'),

  selectPlan: (plan: string) =>
    client.post('/api/plans/select', { plan }),

  createCheckout: (plan: string, interval: string, seats: number) =>
    client.post('/api/billing/checkout', { plan, interval, seats }),

  getSubscription: () => client.get('/api/billing/subscription'),

  openPortal: () => client.post('/api/billing/portal'),
};

// ─────────────────────────────────────────────
// NOTION
// ─────────────────────────────────────────────
export const notionApi = {
  // Returns the OAuth URL to redirect the browser to
  getAuthUrl: () => client.get('/api/notion/auth-url'),

  getDatabases: () => client.get('/api/notion/databases'),

  selectDatabases: (data: {
    journal_db_id: string;
    journal_db_name: string;
    tasks_db_id: string;
    tasks_db_name: string;
    notes_db_id?: string;
    notes_db_name?: string;
    habits_db_id?: string;
    habits_db_name?: string;
  }) => client.post('/api/notion/databases/select', data),

  getConfig: () => client.get('/api/notion/config'),

  disconnect: () => client.delete('/api/notion/disconnect'),
};

// ─────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────
export const onboardingApi = {
  getStatus: () => client.get('/api/onboarding/status'),
  complete: () => client.post('/api/onboarding/complete'),
};

// ─────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────
export const templatesApi = {
  list: () => client.get('/api/templates'),

  create: (name: string, body: string, isDefault: boolean) =>
    client.post('/api/templates', { name, body, is_default: isDefault }),

  update: (id: string, updates: { name?: string; body?: string; is_default?: boolean }) =>
    client.put(`/api/templates/${id}`, updates),

  delete: (id: string) => client.delete(`/api/templates/${id}`),

  onboardingSelect: (payload: { use_default?: boolean; default_template_name?: string; template_id?: string }) =>
    client.post('/api/templates/onboarding-select', payload),
};

// ─────────────────────────────────────────────
// SCHEDULE
// ─────────────────────────────────────────────
export const scheduleApi = {
  get: () => client.get('/api/schedule'),

  save: (generateTime: string, timezone: string) =>
    client.post('/api/schedule', { generate_time: generateTime, timezone }),

  toggle: () => client.patch('/api/schedule/toggle'),
};

// ─────────────────────────────────────────────
// JOURNAL
// ─────────────────────────────────────────────
export const journalApi = {
  generate: () => client.post('/api/journal/generate'),

  getRuns: (page = 1, limit = 20) =>
    client.get(`/api/journal/runs?page=${page}&limit=${limit}`),

  getLatestRun: () => client.get('/api/journal/runs/latest'),

  getStats: () => client.get('/api/journal/stats'),
};
