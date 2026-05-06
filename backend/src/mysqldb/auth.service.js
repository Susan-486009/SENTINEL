import { query, queryOne } from '../config/db.js';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
} from '../utils/auth.js';
import { AppError } from '../utils/response.js';

export const authService = {

  /* ══════════════════════════════════════════════════════
     REGISTER
  ══════════════════════════════════════════════════════ */
  /**
   * Create a new user account.
   * Roles allowed: 'student' | 'staff'  (never 'admin' via API).
   */
  async register({ name, matric, email, password, role = 'student' }) {
    // Normalise inputs
    const normEmail  = email.trim().toLowerCase();
    const normMatric = matric.trim().toUpperCase();
    const normName   = name.trim();
    const safeRole   = ['student', 'staff'].includes(role) ? role : 'student';

    // Duplicate check — give specific message so user knows which field conflicts
    const byEmail = await queryOne('SELECT id FROM users WHERE email = ?',  [normEmail]);
    if (byEmail)  throw new AppError('This email address is already registered.', 409);

    const byMatric = await queryOne('SELECT id FROM users WHERE matric = ?', [normMatric]);
    if (byMatric) throw new AppError('This Matric/Staff number is already registered.', 409);

    const hashedPassword = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (name, matric, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [normName, normMatric, normEmail, hashedPassword, safeRole],
    );

    return {
      id:    result.insertId,
      name:  normName,
      matric: normMatric,
      email: normEmail,
      role:  safeRole,
    };
  },

  /* ══════════════════════════════════════════════════════
     LOGIN
  ══════════════════════════════════════════════════════ */
  /**
   * Authenticate a user and return access + refresh tokens.
   * identifier can be email OR matric number.
   */
  async login({ identifier, password }) {
    const norm = identifier.trim().toLowerCase();

    // Look up by email first, then by matric (case-insensitive)
    const user = await queryOne(
      `SELECT * FROM users
       WHERE LOWER(email) = ? OR UPPER(matric) = UPPER(?)`,
      [norm, identifier.trim()],
    );

    // Use a constant-time path for both "not found" and "wrong password"
    // to prevent user enumeration timing attacks
    const dummy = '$2b$12$invalidhashpaddingtomakeconsistenttime';
    await verifyPassword(password, user ? user.password : dummy);

    if (!user) throw new AppError('Invalid credentials.', 401);

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) throw new AppError('Invalid credentials.', 401);

    // Issue tokens
    const tokenPayload = { id: user.id, role: user.role, name: user.name };
    const accessToken  = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(user.id);

    // Strip sensitive fields
    const { password: _pw, ...safeUser } = user;

    return { accessToken, refreshToken, user: safeUser };
  },

  /* ══════════════════════════════════════════════════════
     GET PROFILE
  ══════════════════════════════════════════════════════ */
  async getById(id) {
    const user = await queryOne(
      `SELECT id, name, matric, email, role, created_at, updated_at
       FROM users WHERE id = ?`,
      [id],
    );
    if (!user) throw new AppError('User not found.', 404);
    return user;
  },

  /* ══════════════════════════════════════════════════════
     UPDATE PROFILE
  ══════════════════════════════════════════════════════ */
  async updateProfile(id, { name, email }) {
    const updates = [];
    const params  = [];

    if (name) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (email) {
      const norm = email.trim().toLowerCase();
      // Check email not taken by someone else
      const conflict = await queryOne(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [norm, id],
      );
      if (conflict) throw new AppError('Email address is already in use.', 409);
      updates.push('email = ?');
      params.push(norm);
    }

    if (updates.length === 0) throw new AppError('No fields to update.', 400);

    params.push(id);
    await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params,
    );

    return this.getById(id);
  },

  /* ══════════════════════════════════════════════════════
     CHANGE PASSWORD
  ══════════════════════════════════════════════════════ */
  async changePassword(id, { currentPassword, newPassword }) {
    const user = await queryOne('SELECT password FROM users WHERE id = ?', [id]);
    if (!user) throw new AppError('User not found.', 404);

    const match = await verifyPassword(currentPassword, user.password);
    if (!match) throw new AppError('Current password is incorrect.', 401);

    if (currentPassword === newPassword) {
      throw new AppError('New password must be different from current password.', 400);
    }

    const hashed = await hashPassword(newPassword);
    await query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashed, id],
    );

    return { message: 'Password updated successfully.' };
  },
};
