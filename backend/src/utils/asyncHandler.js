/**
 * Wraps an async route handler so errors are forwarded to Express's
 * error-handling middleware automatically — no more try/catch boilerplate.
 *
 * Usage:
 *   router.get('/', asyncHandler(myController));
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
