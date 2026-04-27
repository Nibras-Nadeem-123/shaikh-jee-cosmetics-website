/**
 * Sentry Utility Functions for Frontend
 * Provides helper functions for error tracking and user context
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Check if Sentry is enabled
 */
export const isSentryEnabled = (): boolean => {
  return !!process.env.NEXT_PUBLIC_SENTRY_DSN;
};

/**
 * Capture an exception with additional context
 */
export const captureException = (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: Sentry.SeverityLevel;
  }
) => {
  if (!isSentryEnabled()) {
    console.error('Error (Sentry disabled):', error);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.level) {
      scope.setLevel(context.level);
    }

    Sentry.captureException(error);
  });
};

/**
 * Capture a message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
) => {
  if (!isSentryEnabled()) {
    console.log(`Message (Sentry disabled): ${message}`);
    return;
  }

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
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
export const setUser = (user: {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
} | null) => {
  if (!isSentryEnabled()) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
      // Custom data
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Add a breadcrumb for tracking user actions
 */
export const addBreadcrumb = (breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}) => {
  if (!isSentryEnabled()) return;

  Sentry.addBreadcrumb({
    timestamp: Date.now() / 1000,
    ...breadcrumb,
  });
};

/**
 * Track a user action as a breadcrumb
 */
export const trackAction = (action: string, data?: Record<string, unknown>) => {
  addBreadcrumb({
    message: action,
    category: 'user-action',
    level: 'info',
    data,
  });
};

/**
 * Track a navigation event
 */
export const trackNavigation = (from: string, to: string) => {
  addBreadcrumb({
    message: `Navigation: ${from} -> ${to}`,
    category: 'navigation',
    level: 'info',
    data: { from, to },
  });
};

/**
 * Track an API call
 */
export const trackApiCall = (
  method: string,
  url: string,
  status?: number,
  duration?: number
) => {
  addBreadcrumb({
    message: `API: ${method} ${url}`,
    category: 'api',
    level: status && status >= 400 ? 'error' : 'info',
    data: { method, url, status, duration },
  });
};

/**
 * Start a performance span
 */
export const startSpan = <T>(
  name: string,
  callback: () => T | Promise<T>,
  options?: {
    op?: string;
    description?: string;
  }
): T | Promise<T> => {
  if (!isSentryEnabled()) {
    return callback();
  }

  return Sentry.startSpan(
    {
      name,
      op: options?.op || 'function',
      attributes: options?.description ? { description: options.description } : undefined,
    },
    callback
  );
};

/**
 * Set a tag that will be sent with all events
 */
export const setTag = (key: string, value: string) => {
  if (!isSentryEnabled()) return;
  Sentry.setTag(key, value);
};

/**
 * Set extra data that will be sent with all events
 */
export const setExtra = (key: string, value: unknown) => {
  if (!isSentryEnabled()) return;
  Sentry.setExtra(key, value);
};

export default {
  isSentryEnabled,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  trackAction,
  trackNavigation,
  trackApiCall,
  startSpan,
  setTag,
  setExtra,
};
