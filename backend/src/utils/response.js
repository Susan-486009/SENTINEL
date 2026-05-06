/**
 * Standard API response helpers.
 * Usage:
 *   sendSuccess(res, data, 'Created', 201)
 *   sendError(res, 'Not found', 404)
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });

/**
 * Custom application error class.
 * Throw this anywhere to produce a structured error response.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
