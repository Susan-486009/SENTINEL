/**
 * auth.middleware.js
 *
 * authenticate   — verifies access JWT, attaches req.user
 * authorize(...roles) — role guard (call after authenticate)
 * refreshAuth    — verifies refresh JWT, issues new access token
 */

import { extractBearer, verifyToken, signAccessToken } from '../utils/auth.js';
import { User } from '../models/User.js';
import { AppError, sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/* ─────────────────────────────────────────────────────────
   authenticate
   Validates the Bearer access token on every protected route.
   Attaches decoded payload to req.user: { id, role, name, ... }
───────────────────────────────────────────────────────────── */
export const authenticate = (req, _res, next) => {
  const token = extractBearer(req.headers.authorization);
  if (!token) {
    return next(new AppError('Authentication required. No token provided.', 401));
  }

  try {
    req.user = verifyToken(token, 'access');
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    next(new AppError('Invalid token. Please log in again.', 401));
  }
};

/* ─────────────────────────────────────────────────────────
   authorize(...roles)
   Must be called AFTER authenticate().
   Usage: router.delete('/:id', authenticate, authorize('admin'), handler)
───────────────────────────────────────────────────────────── */
export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(
      new AppError(
        `Access denied. Requires role: ${roles.join(' or ')}.`,
        403,
      ),
    );
  }
  next();
};

/* ─────────────────────────────────────────────────────────
   refreshAuth
   POST /api/v1/auth/refresh
   Body: { refreshToken }
   Verifies the refresh token and returns a new access token.
   Does NOT rotate the refresh token (stateless design).
───────────────────────────────────────────────────────────── */
export const refreshAuth = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Refresh token is required.', 400);

  let decoded;
  try {
    decoded = verifyToken(refreshToken, 'refresh');
  } catch (err) {
    throw new AppError(
      err.name === 'TokenExpiredError'
        ? 'Refresh token expired. Please log in again.'
        : 'Invalid refresh token.',
      401,
    );
  }

  // Verify the user still exists in the DB (handles deleted accounts)
  const user = await User.findById(decoded.id).select('_id name role').lean();
  if (!user) throw new AppError('Account no longer exists.', 401);

  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role, name: user.name });
  sendSuccess(res, { accessToken }, 'Token refreshed.');
});
