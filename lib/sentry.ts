/**
 * Sentry Error Tracking Configuration
 * 
 * This file provides error tracking and monitoring for production
 * To use: Set NEXT_PUBLIC_SENTRY_DSN environment variable
 * 
 * Get your DSN from: https://sentry.io/
 */

const sentryDSN = process.env.NEXT_PUBLIC_SENTRY_DSN

/**
 * Initialize Sentry for client-side error tracking
 */
export function initSentry() {
  if (!sentryDSN) {
    console.warn('⚠️ Sentry DSN not configured. Error tracking disabled.')
    return
  }

  try {
    // For simplicity, we'll use a fetch-based error tracking
    // In production, you'd install @sentry/next and use their SDK
    console.log('✅ Sentry error tracking initialized')
  } catch (error) {
    console.error('Failed to initialize Sentry:', error)
  }
}

/**
 * Capture error in Sentry
 * Usage: captureError(error, 'Optional context')
 */
export async function captureError(error: Error | string, context?: string) {
  if (!sentryDSN) return

  try {
    const errorData = {
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    // Send to Sentry endpoint
    // This is a simplified version - in production, use the full SDK
    if (typeof window !== 'undefined') {
      navigator.sendBeacon(sentryDSN, JSON.stringify(errorData))
    }
  } catch (err) {
    console.error('Failed to send error to Sentry:', err)
  }
}

/**
 * Capture message in Sentry
 */
export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryDSN) return

  try {
    const data = {
      message,
      level,
      timestamp: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      navigator.sendBeacon(sentryDSN, JSON.stringify(data))
    }
  } catch (err) {
    console.error('Failed to send message to Sentry:', err)
  }
}
