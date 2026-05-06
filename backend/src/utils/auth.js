/**
 * auth.js — Authentication Utilities
 *
 * Exports:
 *  hashPassword(plain)       → bcrypt hash  (async)
 *  verifyPassword(plain, hash) → boolean     (async)
 *  signAccessToken(payload)  → short-lived JWT (7d default)
 *  signRefreshToken(payload) → long-lived JWT  (30d)
 *  verifyToken(token, secret?) → decoded payload (throws on invalid)
 *  extractBearer(header)     → raw token string or null
 */

import jwt    from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/config.js';

/* ─── bcrypt ───────────────────────────────────────────── */
// 12 rounds ≈ ~300 ms on a modern CPU — good balance for a portal
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password.
 * @param {string} plain
 * @returns {Promise<string>} bcrypt hash
 */
export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

/* ─── JWT ──────────────────────────────────────────────── */

/**
 * Sign a short-lived access token (default: 7d from config).
 * Payload shape: { id, role, name }
 */
export const signAccessToken = (payload) =>
  jwt.sign(
    { ...payload, type: 'access' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn, issuer: 'lasustech-portal' },
  );

/**
 * Sign a long-lived refresh token (30 days).
 * Only contains the user id — used to issue a fresh access token.
 */
export const signRefreshToken = (userId) =>
  jwt.sign(
    { id: userId, type: 'refresh' },
    config.jwt.refreshSecret || config.jwt.secret + '_refresh',
    { expiresIn: '30d', issuer: 'lasustech-portal' },
  );

/**
 * Verify any JWT.
 * @param {string} token
 * @param {'access'|'refresh'} type - expected token type
 * @returns {object} decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyToken = (token, type = 'access') => {
  const secret =
    type === 'refresh'
      ? (config.jwt.refreshSecret || config.jwt.secret + '_refresh')
      : config.jwt.secret;

  const decoded = jwt.verify(token, secret, { issuer: 'lasustech-portal' });

  if (decoded.type !== type) {
    const err = new Error(`Expected ${type} token, got ${decoded.type}.`);
    err.name = 'JsonWebTokenError';
    throw err;
  }

  return decoded;
};

/**
 * Pull the raw token out of an Authorization header.
 * Returns null if the header is missing or not a Bearer scheme.
 * @param {string|undefined} header
 * @returns {string|null}
 */
export const extractBearer = (header) => {
  if (!header?.startsWith('Bearer ')) return null;
  return header.split(' ')[1] ?? null;
};

// Keep backward-compatible alias
export const signToken = signAccessToken;
