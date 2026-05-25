const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ── Token storage (works same-domain AND cross-domain) ────────────────
export function getAccessToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  // Also set as JS-readable cookie so Next.js middleware can read it
  const maxAge = 15 * 60; // 15 minutes
  document.cookie = `access_token=${accessToken}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function clearTokens() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  document.cookie = 'access_token=; path=/; max-age=0';
}

// ── Fetch wrapper ─────────────────────────────────────────────────────
interface FetchOptions extends RequestInit {
  data?: unknown;
  skipAutoRefresh?: boolean;
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { data, skipAutoRefresh = false, ...rest } = options;

  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...rest,
    credentials: 'include', // still send cookies for same-domain dev
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  if (response.status === 401 && !skipAutoRefresh) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.access_token) {
          setTokens(
            refreshData.access_token,
            refreshData.refresh_token || refreshToken,
          );
        }
        // Retry
        const newToken = getAccessToken();
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(rest.headers as Record<string, string>),
        };
        if (newToken) retryHeaders['Authorization'] = `Bearer ${newToken}`;

        const retryRes = await fetch(`${API_URL}/api${endpoint}`, {
          ...rest,
          credentials: 'include',
          headers: retryHeaders,
          ...(data ? { body: JSON.stringify(data) } : {}),
        });

        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({}));
          throw new Error(
            Array.isArray(err.message)
              ? err.message[0]
              : err.message || 'Request failed',
          );
        }
        return retryRes.json() as Promise<T>;
      }
    }
    clearTokens();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.message;
    throw new Error(Array.isArray(msg) ? msg[0] : msg || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: 'GET', ...options }),
  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: 'POST', data, ...options }),
  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: 'PATCH', data, ...options }),
  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: 'DELETE', ...options }),
};
