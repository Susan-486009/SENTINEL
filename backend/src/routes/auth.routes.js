import { Router }    from 'express';
import * as auth      from '../controllers/auth.controller.js';
import { authenticate, refreshAuth, authorize } from '../middleware/auth.middleware.js';
import {
  validateRegister,
  validateLogin,
  validateChangePassword,
} from '../middleware/validate.middleware.js';

const router = Router();

/* ─── Public ───────────────────────────────────────────── */

/**
 * POST /api/v1/auth/register
 * Body: { name, matric, email, password, role? }
 * Returns: { id, name, matric, email, role }
 */
router.post('/register', validateRegister, auth.register);

/**
 * POST /api/v1/auth/login
 * Body: { identifier, password }  (identifier = email OR matric)
 * Returns: { accessToken, refreshToken, tokenType, expiresIn, user }
 */
router.post('/login', validateLogin, auth.login);

/**
 * POST /api/v1/auth/refresh
 * Body: { refreshToken }
 * Returns: { accessToken }
 */
router.post('/refresh', refreshAuth);

/* ─── Protected (requires valid access token) ──────────── */

/**
 * GET /api/v1/auth/me
 * Returns: current user profile
 */
router.get('/me', authenticate, auth.getMe);

/**
 * PATCH /api/v1/auth/me
 * Body: { name?, email? }
 * Returns: updated user profile
 */
router.patch('/me', authenticate, auth.updateMe);

router.post('/change-password', authenticate, validateChangePassword, auth.changePassword);

/* ─── Admin (requires admin role) ────────────────────── */

/**
 * GET /api/v1/auth/admin/users
 * Query: { role?, search?, page?, limit? }
 * Returns: { users, pagination }
 */
router.get('/admin/users', authenticate, authorize('admin'), auth.getUsers);

export default router;
