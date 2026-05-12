import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess }  from '../utils/response.js';
import { authService }  from '../services/auth.service.js';

/* ── POST /api/v1/auth/register ───────────────────────── */
export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  sendSuccess(res, user, 'Account created successfully.', 201);
});

/* ── POST /api/v1/auth/login ──────────────────────────── */
export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);

  sendSuccess(
    res,
    {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      user,
    },
    'Login successful.',
  );
});

/* ── GET /api/v1/auth/me ──────────────────────────────── */
export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getById(req.user.id);
  sendSuccess(res, user);
});

/* ── PATCH /api/v1/auth/me ────────────────────────────── */
export const updateMe = asyncHandler(async (req, res) => {
  const updated = await authService.updateProfile(req.user.id, req.body);
  sendSuccess(res, updated, 'Profile updated successfully.');
});

/* ── POST /api/v1/auth/change-password ───────────────── */
export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  sendSuccess(res, result);
});

/* ── GET /api/v1/auth/admin/users ───────────────────── */
export const getUsers = asyncHandler(async (req, res) => {
  const result = await authService.getAllUsers(req.query);
  sendSuccess(res, result);
});
