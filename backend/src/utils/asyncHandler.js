/**
 * Wraps an async route handler so errors are forwarded to Express's
 * error-handling middleware automatically, enriched with correlation telemetry.
 *
 * Usage:
 *   router.get('/', asyncHandler(myController));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // Enrich error object with request telemetry for global logging
    if (err && typeof err === 'object') {
      err.requestId = req.requestId || null;
      err.route = req.originalUrl || null;
      err.userId = req.user?.id || null;
      err.ip = req.ip || null;
      err.userAgent = req.get('user-agent') || null;
    }
    next(err);
  });
};
