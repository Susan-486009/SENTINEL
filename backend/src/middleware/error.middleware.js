import { sendError } from '../utils/response.js';
import { config }    from '../config/config.js';

/**
 * Global error handler — must be registered LAST in Express.
 */
export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isDev      = config.env === 'development';

  // Log unexpected errors in development
  if (!err.isOperational) {
    console.error('💥 Unexpected error:', err);
  }

  return sendError(
    res,
    err.message || 'Something went wrong on the server.',
    statusCode,
    isDev && !err.isOperational ? { stack: err.stack } : undefined,
  );
};

/**
 * 404 handler — register before errorHandler.
 */
export const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
};
