/**
 * cookie.js — Secure Manual Cookie Parsers and Settings
 */

/**
 * Parse a Cookie header string into an object.
 * @param {string|undefined} cookieHeader
 * @returns {Record<string, string>}
 */
export const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const key = parts[0].trim();
    if (key) {
      cookies[key] = parts.slice(1).join('=').trim();
    }
  });
  
  return cookies;
};

/**
 * Express Cookie Options for maximum production security.
 */
export const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

/**
 * Short-lived secure cookie options for access tokens.
 */
export const shortSecureCookieOptions = {
  ...secureCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching access token expiry
};
