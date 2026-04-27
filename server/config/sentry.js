/**
 * Sentry Error Tracking Configuration
 * Provides error monitoring and performance tracking
 */

import * as Sentry from '@sentry/node';

// Track if Sentry is initialized
let isInitialized = false;

/**
 * Initialize Sentry for the Express server
 */
export const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return { isEnabled: false };
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0',

      // Performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Profiling (optional, requires @sentry/profiling-node)
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Don't send events in test environment
        if (process.env.NODE_ENV === 'test') {
          return null;
        }

        // Scrub sensitive data from request body
        if (event.request?.data) {
          const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
          sensitiveFields.forEach(field => {
            if (event.request.data[field]) {
              event.request.data[field] = '[REDACTED]';
            }
          });
        }

        return event;
      },

      // Filter out noisy errors
      ignoreErrors: [
        // Network errors
        'ECONNREFUSED',
        'ECONNRESET',
        'ETIMEDOUT',
        // Common client errors
        'TokenExpiredError',
        'JsonWebTokenError',
        // Rate limiting
        'Too many requests',
      ],

      // Integrations
      integrations: [
        // HTTP integration for tracking outgoing requests
        Sentry.httpIntegration(),
        // Express integration
        Sentry.expressIntegration({ app }),
        // MongoDB integration
        Sentry.mongoIntegration(),
      ],
    });

    isInitialized = true;
    console.log('✅ Sentry error tracking initialized');

    return { isEnabled: true, Sentry };
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error.message);
    return { isEnabled: false };
  }
};

/**
 * Sentry request handler - should be first middleware
 */
export const sentryRequestHandler = () => {
  if (!isInitialized) {
    return (req, res, next) => next();
  }
  return Sentry.expressIntegration().setupExpressErrorHandler;
};

/**
 * Sentry error handler - should be before other error handlers
 */
export const sentryErrorHandler = () => {
  if (!isInitialized) {
    return (err, req, res, next) => next(err);
  }
  return Sentry.expressErrorHandler();
};

/**
 * Capture an exception manually
 */
export const captureException = (error, context = {}) => {
  if (!isInitialized) {
    console.error('Sentry not initialized, error not captured:', error.message);
    return;
  }

  Sentry.withScope((scope) => {
    // Add extra context
    if (context.user) {
      scope.setUser({
        id: context.user._id?.toString(),
        email: context.user.email,
        username: context.user.name,
      });
    }

    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    scope.setLevel(context.level || 'error');

    Sentry.captureException(error);
  });
};

/**
 * Capture a message manually
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!isInitialized) {
    console.log(`Sentry not initialized, message not captured: ${message}`);
    return;
  }

  Sentry.withScope((scope) => {
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureMessage(message, level);
  });
};

/**
 * Set user context for all subsequent events
 */
export const setUser = (user) => {
  if (!isInitialized || !user) return;

  Sentry.setUser({
    id: user._id?.toString(),
    email: user.email,
    username: user.name,
    role: user.role,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUser = () => {
  if (!isInitialized) return;
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (breadcrumb) => {
  if (!isInitialized) return;

  Sentry.addBreadcrumb({
    timestamp: Date.now() / 1000,
    ...breadcrumb,
  });
};

/**
 * Start a performance transaction
 */
export const startTransaction = (name, op = 'custom') => {
  if (!isInitialized) return null;

  return Sentry.startSpan({ name, op });
};

/**
 * Check if Sentry is enabled
 */
export const isSentryEnabled = () => isInitialized;

export default {
  initSentry,
  sentryRequestHandler,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
  isSentryEnabled,
};
