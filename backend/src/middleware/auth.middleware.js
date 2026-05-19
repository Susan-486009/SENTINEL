/**
 * auth.middleware.js — Secure JWT Cookie & Session Authentication Middleware
 */

import { extractBearer, verifyToken, signAccessToken } from '../utils/auth.js';
import { User } from '../models/User.js';
import { TokenSession } from '../models/TokenSession.js';
import { AppError, sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseCookies, secureCookieOptions, shortSecureCookieOptions } from '../utils/cookie.js';
import { sessionService } from '../services/session.service.js';

/**
 * Helper to retrieve access token from either secure HTTP-only cookies or Authorization headers.
 */
export const getAccessToken = (req) => {
  if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.as_access_token) return cookies.as_access_token;
  }
  return extractBearer(req.headers.authorization);
};

/**
 * Helper to retrieve refresh token from either secure HTTP-only cookies, req.body or headers.
 */
export const getRefreshToken = (req) => {
  if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.as_refresh_token) return cookies.as_refresh_token;
  }
  return req.body?.refreshToken || null;
};

/* ─────────────────────────────────────────────────────────
   authenticate
   Verifies access JWT via cookies or headers.
   Attaches user credentials to req.user: { id, role, name }
 ───────────────────────────────────────────────────────────── */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = getAccessToken(req);
  if (!token) {
    return next(new AppError('Authentication required. No token provided.', 401));
  }

  try {
    req.user = verifyToken(token, 'access');
    
    // Quick validation check to confirm user still exists and is not disabled
    const user = await User.findById(req.user.id).select('_id role name').lean();
    if (!user) {
      return next(new AppError('Your account has been deleted or disabled.', 401));
    }
    
    req.user.role = user.role;
    req.user.name = user.name;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    next(new AppError('Invalid authentication token.', 401));
  }
});

/* ─────────────────────────────────────────────────────────
   authorize(...roles)
   Must be called AFTER authenticate().
 ───────────────────────────────────────────────────────────── */
export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(
      new AppError(`Access denied. Requires role: ${roles.join(' or ')}.`, 403)
    );
  }
  next();
};

/* ─────────────────────────────────────────────────────────
   refreshAuth
   POST /api/v1/auth/refresh
   Verifies the refresh session and rotates the token safely.
 ───────────────────────────────────────────────────────────── */
export const refreshAuth = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshToken(req);
  if (!refreshToken) throw new AppError('Refresh token is required.', 400);

  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const ua = req.get('user-agent') || 'unknown';

  // 1. Verify token signature
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

  // 2. Query user validation
  const user = await User.findById(decoded.id).select('_id name role').lean();
  if (!user) throw new AppError('Account no longer exists.', 401);

  // 3. Rotate session with security reuse checks
  const rotated = await sessionService.rotateSession(refreshToken, ip, ua);

  // 4. Update secure cookies in response
  res.cookie('as_access_token', rotated.accessToken, shortSecureCookieOptions);
  res.cookie('as_refresh_token', rotated.refreshToken, secureCookieOptions);

  sendSuccess(res, {
    accessToken: rotated.accessToken,
    refreshToken: rotated.refreshToken,
  }, 'Session refreshed successfully.');
});
