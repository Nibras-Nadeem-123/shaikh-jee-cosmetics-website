/**
 * Sentry Server-Side Configuration
 * This file configures error tracking for Next.js server components
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',

    // Filter sensitive data
    beforeSend(event) {
      // Don't send events in test environment
      if (process.env.NODE_ENV === 'test') {
        return null;
      }

      // Scrub sensitive data from request body
      if (event.request?.data) {
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
        try {
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;

          sensitiveFields.forEach(field => {
            if (data[field]) {
              data[field] = '[REDACTED]';
            }
          });

          event.request.data = JSON.stringify(data);
        } catch {
          // If parsing fails, leave as is
        }
      }

      return event;
    },

    // Filter out noisy errors
    ignoreErrors: [
      // Network errors
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      // Auth errors (handled by app)
      'TokenExpiredError',
      'JsonWebTokenError',
    ],
  });
}

export default Sentry;
