const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  data?: unknown;
  skipAutoRefresh?: boolean;
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { data, skipAutoRefresh = false, ...rest } = options;

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });

  // Attempt token refresh on 401 — but NOT recursively, and NOT on auth pages
  if (response.status === 401 && !skipAutoRefresh) {
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      // Retry original request once with fresh cookie
      const retryResponse = await fetch(`${API_URL}/api${endpoint}`, {
        ...rest,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...rest.headers,
        },
        ...(data ? { body: JSON.stringify(data) } : {}),
      });

      if (!retryResponse.ok) {
        const err = await retryResponse.json().catch(() => ({}));
        const message = err.message;
        throw new Error(
          Array.isArray(message) ? message[0] : message || 'Request failed',
        );
      }

      return retryResponse.json() as Promise<T>;
    }

    // Refresh failed — just throw. Middleware handles redirects for protected routes.
    // Do NOT use window.location here — that causes the infinite refresh loop.
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = err.message;
    throw new Error(
      Array.isArray(message) ? message[0] : message || 'Request failed',
    );
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
