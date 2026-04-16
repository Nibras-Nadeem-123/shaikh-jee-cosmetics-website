// CSRF Token management
let csrfToken: string | null = null;

// Get CSRF token from backend
export async function getCSRFToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/csrf-token`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get CSRF token');
    }

    const data = await response.json();
    if (data.csrfToken == null) {
      throw new Error('No CSRF token received');
    }
    csrfToken = data.csrfToken;
    return csrfToken!;
  } catch (error) {
    console.error('CSRF token error:', error);
    throw error;
  }
}

// Clear CSRF token (on logout)
export function clearCSRFToken() {
  csrfToken = null;
}

// Get current token (for including in requests)
export function getCurrentCSRFToken(): string | null {
  return csrfToken;
}
