/**
 * Centralized Error Codes and Types (Frontend)
 * Matches the backend error codes for consistent error handling
 */

export interface ErrorCode {
  code: string;
  message: string;
  statusCode: number;
}

export const ERROR_CODES = {
  // Authentication Errors (1xxx)
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_1001',
    message: 'Invalid email or password',
    statusCode: 401
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_1002',
    message: 'Session expired. Please login again',
    statusCode: 401
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_1003',
    message: 'Invalid authentication token',
    statusCode: 401
  },
  AUTH_NO_TOKEN: {
    code: 'AUTH_1004',
    message: 'Please login to continue',
    statusCode: 401
  },
  AUTH_ACCESS_DENIED: {
    code: 'AUTH_1005',
    message: 'You do not have permission to access this resource',
    statusCode: 403
  },

  // Validation Errors (2xxx)
  VAL_INVALID_INPUT: {
    code: 'VAL_2001',
    message: 'Please check your input and try again',
    statusCode: 400
  },
  VAL_REQUIRED_FIELD: {
    code: 'VAL_2002',
    message: 'Please fill in all required fields',
    statusCode: 400
  },
  VAL_INVALID_EMAIL: {
    code: 'VAL_2003',
    message: 'Please enter a valid email address',
    statusCode: 400
  },
  VAL_WEAK_PASSWORD: {
    code: 'VAL_2004',
    message: 'Password must be at least 8 characters',
    statusCode: 400
  },

  // Resource Errors (3xxx)
  RES_NOT_FOUND: {
    code: 'RES_3001',
    message: 'The requested item was not found',
    statusCode: 404
  },
  RES_PRODUCT_NOT_FOUND: {
    code: 'RES_3003',
    message: 'Product not found',
    statusCode: 404
  },
  RES_ORDER_NOT_FOUND: {
    code: 'RES_3004',
    message: 'Order not found',
    statusCode: 404
  },
  RES_OUT_OF_STOCK: {
    code: 'RES_3009',
    message: 'Sorry, this product is out of stock',
    statusCode: 400
  },

  // Payment Errors (4xxx)
  PAY_FAILED: {
    code: 'PAY_4001',
    message: 'Payment failed. Please try again',
    statusCode: 402
  },
  PAY_VERIFICATION_FAILED: {
    code: 'PAY_4003',
    message: 'Payment verification failed. Please contact support',
    statusCode: 400
  },
  DISCOUNT_INVALID: {
    code: 'PAY_4010',
    message: 'Invalid discount code',
    statusCode: 400
  },
  DISCOUNT_EXPIRED: {
    code: 'PAY_4011',
    message: 'This discount code has expired',
    statusCode: 400
  },

  // Server Errors (5xxx)
  SRV_INTERNAL_ERROR: {
    code: 'SRV_5001',
    message: 'Something went wrong. Please try again',
    statusCode: 500
  },
  SRV_RATE_LIMITED: {
    code: 'SRV_5004',
    message: 'Too many requests. Please wait a moment',
    statusCode: 429
  },
  SRV_MAINTENANCE: {
    code: 'SRV_5005',
    message: 'Service is under maintenance. Please try again later',
    statusCode: 503
  }
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODES;

/**
 * Get user-friendly error message from API error response
 */
export const getErrorMessage = (error: unknown): string => {
  // Handle API error response with code
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { code?: string; message?: string };

    // If we have a code, try to get the friendly message
    if (apiError.code) {
      const errorEntry = Object.values(ERROR_CODES).find(e => e.code === apiError.code);
      if (errorEntry) {
        return errorEntry.message;
      }
    }

    // Fall back to the error message
    if (apiError.message) {
      return apiError.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Default error message
  return 'Something went wrong. Please try again.';
};

/**
 * Check if error is of a specific type
 */
export const isErrorCode = (error: unknown, codeKey: ErrorCodeKey): boolean => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { code?: string };
    return apiError.code === ERROR_CODES[codeKey].code;
  }
  return false;
};

/**
 * Check if error requires re-authentication
 */
export const isAuthError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { code?: string; statusCode?: number };
    return apiError.statusCode === 401 ||
           apiError.code?.startsWith('AUTH_100') ||
           false;
  }
  return false;
};
