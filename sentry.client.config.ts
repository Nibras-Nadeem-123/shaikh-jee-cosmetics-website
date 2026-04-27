/**
 * Sentry Client-Side Configuration
 * This file configures error tracking for the browser
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay - capture 10% of sessions, 100% on errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',

    // Filter sensitive data
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
        return null;
      }

      // Scrub sensitive data
      if (event.request?.cookies) {
        event.request.cookies = '[REDACTED]';
      }

      return event;
    },

    // Filter out noisy errors
    ignoreErrors: [
      // Browser extensions
      'chrome-extension://',
      'moz-extension://',
      // Network errors
      'Failed to fetch',
      'NetworkError',
      'Network request failed',
      'Load failed',
      // User interactions
      'ResizeObserver loop',
      // Common non-issues
      'AbortError',
      'cancelled',
      // Script errors from third parties
      'Script error',
    ],

    // Don't capture errors from these URLs
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
    ],

    integrations: [
      // Replay integration for session recording
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      // Browser tracing for performance
      Sentry.browserTracingIntegration({
        // Track navigation
        enableInp: true,
      }),
      // Feedback widget (optional)
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        showBranding: false,
        buttonLabel: 'Report an Issue',
        submitButtonLabel: 'Send Report',
        formTitle: 'Report an Issue',
        messagePlaceholder: 'Describe what happened...',
      }),
    ],
  });
}

export default Sentry;
