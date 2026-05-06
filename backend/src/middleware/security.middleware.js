/**
 * security.middleware.js
 * 
 * Middleware for input sanitization and security hardening.
 * Uses the 'xss' library to strip malicious tags from incoming data.
 */

import xss from 'xss';

/**
 * Recursively sanitizes an object or string.
 */
const sanitize = (val) => {
  if (typeof val === 'string') {
    return xss(val);
  }
  if (val !== null && typeof val === 'object') {
    for (const key in val) {
      val[key] = sanitize(val[key]);
    }
  }
  return val;
};

/**
 * Middleware that sanitizes req.body, req.query, and req.params.
 * This prevents XSS attacks by stripping script tags and other dangerous HTML.
 */
export const sanitizeInputs = (req, _res, next) => {
  if (req.body)   req.body   = sanitize(req.body);
  if (req.query)  req.query  = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
};
