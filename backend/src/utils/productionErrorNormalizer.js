/**
 * productionErrorNormalizer.js — High-resiliency secure error normalizer
 *
 * Restricts stack trace leakages in production and ensures all responses
 * are returned in a standard API contract containing tracing IDs.
 */

import { logStructured } from './catastrophicLogger.js';
import { config } from '../config/config.js';

/**
 * Global secure error-normalising middleware.
 */
export const productionErrorNormalizer = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProd = config.env === 'production';

  // Extract correlation metadata from enriched error or request
  const telemetry = {
    requestId: err.requestId || req.requestId || null,
    route: err.route || req.originalUrl || null,
    userId: err.userId || req.user?.id || null,
    ip: err.ip || req.ip || null,
    userAgent: err.userAgent || req.get('user-agent') || null,
  };

  // Structured Logging for observability
  logStructured({
    level: statusCode >= 500 ? 'ERROR' : 'WARN',
    message: err.message || 'API request failure',
    requestId: telemetry.requestId,
    route: telemetry.route,
    userId: telemetry.userId,
    ip: telemetry.ip,
    userAgent: telemetry.userAgent,
    error: err,
  });

  // Prepare standard API response
  const responsePayload = {
    success: false,
    message: isProd && statusCode === 500 
      ? 'An unexpected security or application error occurred.' 
      : err.message || 'Something went wrong.',
    requestId: telemetry.requestId,
  };

  // Expose error details/validation fields only if operational or in dev mode
  if (err.errors) {
    responsePayload.errors = err.errors;
  }

  if (!isProd && statusCode === 500) {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};
