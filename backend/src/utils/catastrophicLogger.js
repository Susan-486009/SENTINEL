/**
 * catastrophicLogger.js — Structured JSON Logger & Process Safeguard
 * 
 * Captures logs with uniform metadata: timestamp, severity, requestId, route,
 * stack trace, userId, ip, userAgent, and environment.
 */

import { config } from '../config/config.js';

/**
 * Log a structured JSON event to stdout.
 * @param {object} logObject
 */
export const logStructured = ({
  level = 'INFO',
  message,
  requestId = null,
  route = null,
  userId = null,
  ip = null,
  userAgent = null,
  error = null,
  metadata = {}
}) => {
  const logEvent = {
    timestamp: new Date().toISOString(),
    severity: level.toUpperCase(),
    environment: config.env || 'development',
    message,
    requestId,
    route,
    userId,
    ip,
    userAgent,
    ...(error && {
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    }),
    ...metadata,
  };

  // Exclude stack trace if in production and not critical severity
  if (config.env === 'production' && level !== 'CRITICAL' && level !== 'ERROR') {
    delete logEvent.stack;
  }

  console.log(JSON.stringify(logEvent));
};

/**
 * Initialize uncaught process boundaries.
 */
export const registerCatastrophicProcessListeners = (dbConnectionCloser = null) => {
  process.on('uncaughtException', async (error) => {
    logStructured({
      level: 'CRITICAL',
      message: `Uncaught Exception caught globally: ${error.message}`,
      error,
    });
    
    if (dbConnectionCloser) {
      try {
        await dbConnectionCloser();
      } catch (dbErr) {
        console.error('Failed to close DB pool during crash cleanup:', dbErr);
      }
    }
    
    // Allow stdout buffer to flush, then terminate
    setTimeout(() => process.exit(1), 500);
  });

  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logStructured({
      level: 'ERROR',
      message: `Unhandled Rejection at Promise: ${String(promise)}`,
      error,
    });
  });
};
