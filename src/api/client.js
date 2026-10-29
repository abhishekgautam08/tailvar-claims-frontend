export class ApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const TOKEN_STORAGE_KEY = 'tailvar_auth_token';

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

export const removeStoredToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Universal API request wrapper around fetch.
 * - Injects Base URL and Authorization Bearer token.
 * - Handles non-2xx status, network errors, and session expiry.
 *
 * @param {string} path - API endpoint path (e.g. "/auth/login", "/policies")
 * @param {Object} options - { method, body, auth }
 * @returns {Promise<any>}
 */
export const request = async (path, options = {}) => {
  const { method = 'GET', body, auth = true, headers = {} } = options;

  const cleanBase = BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const url = `${cleanBase}/${cleanPath}`;

  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (auth) {
    const token = getStoredToken();
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    method,
    headers: reqHeaders
  };

  if (body !== undefined && body !== null) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, fetchOptions);
  } catch (networkError) {
    throw new ApiError('Cannot reach the server. Please try again.', 0, 'NETWORK_ERROR');
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return null;
  }

  // Handle 401 Unauthorized for authenticated calls (session expired)
  if (res.status === 401 && auth && !path.includes('auth/login')) {
    removeStoredToken();
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login?expired=1';
    }
    throw new ApiError('Session expired. Please log in again.', 401, 'UNAUTHORIZED');
  }

  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (parseError) {
      data = null;
    }
  } else {
    try {
      const text = await res.text();
      data = text ? { message: text } : null;
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const code = data?.error?.code || (res.status === 404 ? 'NOT_FOUND' : res.status === 403 ? 'FORBIDDEN' : 'API_ERROR');
    const message = data?.error?.message || data?.message || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, code);
  }

  return data;
};
