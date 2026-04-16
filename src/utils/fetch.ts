import { getCSRFToken, getCurrentCSRFToken } from '@/utils/csrf';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function for authenticated requests with CSRF
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');
  const csrfToken = await getCSRFToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(csrfToken && { 'x-csrf-token': csrfToken }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle CSRF token errors
  if (response.status === 403) {
    const error = await response.json();
    if (error.message?.includes('CSRF')) {
      // Clear token and retry
      localStorage.removeItem('csrfToken');
      const newCsrfToken = await getCSRFToken();

      (headers as any)['x-csrf-token'] = newCsrfToken;

      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      return retryResponse.json();
    }
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
