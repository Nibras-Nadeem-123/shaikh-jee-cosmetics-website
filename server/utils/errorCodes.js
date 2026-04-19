/**
 * Centralized Error Codes and Types
 * Use these codes for consistent error handling across frontend and backend
 */

// Error code prefixes by category
// AUTH: Authentication/Authorization errors (1xxx)
// VAL: Validation errors (2xxx)
// RES: Resource errors (3xxx)
// PAY: Payment errors (4xxx)
// SRV: Server/System errors (5xxx)

export const ERROR_CODES = {
  // Authentication Errors (1xxx)
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_1001',
    message: 'Invalid email or password',
    statusCode: 401
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_1002',
    message: 'Token has expired. Please login again',
    statusCode: 401
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_1003',
    message: 'Invalid authentication token',
    statusCode: 401
  },
  AUTH_NO_TOKEN: {
    code: 'AUTH_1004',
    message: 'Authentication required. Please login',
    statusCode: 401
  },
  AUTH_ACCESS_DENIED: {
    code: 'AUTH_1005',
    message: 'Access denied. Insufficient permissions',
    statusCode: 403
  },
  AUTH_IP_BLOCKED: {
    code: 'AUTH_1006',
    message: 'Access denied from your IP address',
    statusCode: 403
  },
  AUTH_ACCOUNT_DISABLED: {
    code: 'AUTH_1007',
    message: 'Your account has been disabled',
    statusCode: 403
  },
  AUTH_EMAIL_NOT_VERIFIED: {
    code: 'AUTH_1008',
    message: 'Please verify your email address',
    statusCode: 403
  },

  // Validation Errors (2xxx)
  VAL_INVALID_INPUT: {
    code: 'VAL_2001',
    message: 'Invalid input data',
    statusCode: 400
  },
  VAL_REQUIRED_FIELD: {
    code: 'VAL_2002',
    message: 'Required field is missing',
    statusCode: 400
  },
  VAL_INVALID_EMAIL: {
    code: 'VAL_2003',
    message: 'Invalid email format',
    statusCode: 400
  },
  VAL_WEAK_PASSWORD: {
    code: 'VAL_2004',
    message: 'Password must be at least 8 characters',
    statusCode: 400
  },
  VAL_INVALID_PHONE: {
    code: 'VAL_2005',
    message: 'Invalid phone number format',
    statusCode: 400
  },
  VAL_INVALID_PINCODE: {
    code: 'VAL_2006',
    message: 'Invalid pincode',
    statusCode: 400
  },
  VAL_INVALID_QUANTITY: {
    code: 'VAL_2007',
    message: 'Invalid quantity specified',
    statusCode: 400
  },

  // Resource Errors (3xxx)
  RES_NOT_FOUND: {
    code: 'RES_3001',
    message: 'Resource not found',
    statusCode: 404
  },
  RES_USER_NOT_FOUND: {
    code: 'RES_3002',
    message: 'User not found',
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
  RES_CART_NOT_FOUND: {
    code: 'RES_3005',
    message: 'Cart not found',
    statusCode: 404
  },
  RES_REVIEW_NOT_FOUND: {
    code: 'RES_3006',
    message: 'Review not found',
    statusCode: 404
  },
  RES_ALREADY_EXISTS: {
    code: 'RES_3007',
    message: 'Resource already exists',
    statusCode: 409
  },
  RES_USER_EXISTS: {
    code: 'RES_3008',
    message: 'User with this email already exists',
    statusCode: 409
  },
  RES_OUT_OF_STOCK: {
    code: 'RES_3009',
    message: 'Product is out of stock',
    statusCode: 400
  },
  RES_INSUFFICIENT_STOCK: {
    code: 'RES_3010',
    message: 'Insufficient stock available',
    statusCode: 400
  },

  // Payment Errors (4xxx)
  PAY_FAILED: {
    code: 'PAY_4001',
    message: 'Payment failed. Please try again',
    statusCode: 402
  },
  PAY_INVALID_METHOD: {
    code: 'PAY_4002',
    message: 'Invalid payment method',
    statusCode: 400
  },
  PAY_VERIFICATION_FAILED: {
    code: 'PAY_4003',
    message: 'Payment verification failed',
    statusCode: 400
  },
  PAY_ORDER_CREATION_FAILED: {
    code: 'PAY_4004',
    message: 'Failed to create payment order',
    statusCode: 500
  },
  PAY_REFUND_FAILED: {
    code: 'PAY_4005',
    message: 'Refund processing failed',
    statusCode: 500
  },

  // Discount/Coupon Errors (4xxx continued)
  DISCOUNT_INVALID: {
    code: 'PAY_4010',
    message: 'Invalid discount code',
    statusCode: 400
  },
  DISCOUNT_EXPIRED: {
    code: 'PAY_4011',
    message: 'Discount code has expired',
    statusCode: 400
  },
  DISCOUNT_MIN_ORDER: {
    code: 'PAY_4012',
    message: 'Order total does not meet minimum requirement',
    statusCode: 400
  },
  DISCOUNT_ALREADY_USED: {
    code: 'PAY_4013',
    message: 'Discount code already used',
    statusCode: 400
  },
  DISCOUNT_LIMIT_REACHED: {
    code: 'PAY_4014',
    message: 'Discount code usage limit reached',
    statusCode: 400
  },

  // Server/System Errors (5xxx)
  SRV_INTERNAL_ERROR: {
    code: 'SRV_5001',
    message: 'Internal server error',
    statusCode: 500
  },
  SRV_DATABASE_ERROR: {
    code: 'SRV_5002',
    message: 'Database operation failed',
    statusCode: 500
  },
  SRV_EXTERNAL_SERVICE: {
    code: 'SRV_5003',
    message: 'External service unavailable',
    statusCode: 503
  },
  SRV_RATE_LIMITED: {
    code: 'SRV_5004',
    message: 'Too many requests. Please try again later',
    statusCode: 429
  },
  SRV_MAINTENANCE: {
    code: 'SRV_5005',
    message: 'Service under maintenance',
    statusCode: 503
  },
  SRV_EMAIL_FAILED: {
    code: 'SRV_5006',
    message: 'Failed to send email',
    statusCode: 500
  },
  SRV_FILE_UPLOAD_FAILED: {
    code: 'SRV_5007',
    message: 'File upload failed',
    statusCode: 500
  }
};

// Helper function to create error with code
export const createError = (errorType, customMessage = null) => {
  const error = ERROR_CODES[errorType] || ERROR_CODES.SRV_INTERNAL_ERROR;
  return {
    code: error.code,
    message: customMessage || error.message,
    statusCode: error.statusCode
  };
};

// Helper function to get error by code
export const getErrorByCode = (code) => {
  const entry = Object.entries(ERROR_CODES).find(([, value]) => value.code === code);
  return entry ? entry[1] : ERROR_CODES.SRV_INTERNAL_ERROR;
};

export default ERROR_CODES;
