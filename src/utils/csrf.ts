/**
 * CSRF Protection Utilities for Frontend
 *
 * Uses Double-Submit Cookie Pattern:
 * - Reads CSRF token from cookie (set by backend)
 * - Includes token in X-CSRF-Token header for POST/PUT/DELETE requests
 */

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// In-memory cache for token
let cachedToken: string | null = null;

/**
 * Get CSRF token from cookie
 */
export function getCSRFTokenFromCookie(): string | null {
  if (typeof document === 'undefined') {
    return cachedToken;
  }

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE_NAME) {
      cachedToken = decodeURIComponent(value);
      return cachedToken;
    }
  }
  return null;
}

/**
 * Get CSRF token - fetches from server if not in cookie
 */
export async function getCSRFToken(): Promise<string> {
  // Try to get from cookie first
  let token = getCSRFTokenFromCookie();

  if (token) {
    return token;
  }

  // Fetch from server if not available
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get CSRF token');
    }

    const data = await response.json();
    if (data.csrfToken) {
      cachedToken = data.csrfToken;
      return data.csrfToken;
    }

    throw new Error('No CSRF token received');
  } catch (error) {
    console.error('CSRF token error:', error);
    throw error;
  }
}

/**
 * Get current cached token
 */
export function getCurrentCSRFToken(): string | null {
  return getCSRFTokenFromCookie() || cachedToken;
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCSRFToken(): void {
  cachedToken = null;
}

/**
 * Get headers with CSRF token included
 */
export function getCSRFHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getCurrentCSRFToken();
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };

  if (token) {
    headers[CSRF_HEADER_NAME] = token;
  }

  return headers;
}

/**
 * Enhanced fetch with CSRF token automatically included
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';

  // Only add CSRF token for state-changing methods
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    let token = getCurrentCSRFToken();

    // If no token, try to fetch one
    if (!token) {
      try {
        token = await getCSRFToken();
      } catch (error) {
        console.warn('Could not get CSRF token:', error);
      }
    }

    if (token) {
      const headers = new Headers(options.headers);
      headers.set(CSRF_HEADER_NAME, token);
      options.headers = headers;
    }
  }

  // Always include credentials to send/receive cookies
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}

/**
 * Initialize CSRF token on app load
 */
export async function initializeCSRF(): Promise<void> {
  try {
    await getCSRFToken();
  } catch (error) {
    console.warn('Failed to initialize CSRF token:', error);
  }
}

export default {
  getCSRFToken,
  getCurrentCSRFToken,
  getCSRFTokenFromCookie,
  clearCSRFToken,
  getCSRFHeaders,
  csrfFetch,
  initializeCSRF,
};
