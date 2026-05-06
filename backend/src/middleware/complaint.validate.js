/**
 * complaint.validate.js — Input Validation for Complaint Endpoints
 *
 * validateSubmitComplaint  — POST /complaints
 * validateStatusUpdate     — PATCH /complaints/:id/status
 * validateQueryParams      — GET /complaints (admin list)
 */

import { sendError }        from '../utils/response.js';
import { VALID_CATEGORIES, VALID_STATUSES } from '../utils/complaint.utils.js';

/* ─── field-level rules reused across schemas ────────────── */
const required  = (v, label) =>
  v == null || String(v).trim() === '' ? `${label} is required.` : null;
const minLen    = (n) => (v, label) =>
  String(v).trim().length < n ? `${label} must be at least ${n} characters.` : null;
const maxLen    = (n) => (v, label) =>
  String(v).trim().length > n ? `${label} must not exceed ${n} characters.` : null;
const oneOf     = (set) => (v, label) =>
  !set.has(v) ? `${label} must be one of: ${[...set].join(', ')}.` : null;

const applyRules = (value, label, rules) => {
  for (const rule of rules) {
    const msg = rule(value, label);
    if (msg) return msg;   // first failing rule wins
  }
  return null;
};

/* ════════════════════════════════════════════════════════
   POST /api/v1/complaints
   Fields: category, title, description, anonymous?
════════════════════════════════════════════════════════ */
export const validateSubmitComplaint = (req, res, next) => {
  const { category, title, description, anonymous } = req.body;
  const errors = {};

  const catErr = applyRules(category, 'Category', [required, oneOf(VALID_CATEGORIES)]);
  if (catErr) errors.category = catErr;

  const titleErr = applyRules(title, 'Title', [required, minLen(10), maxLen(200)]);
  if (titleErr) errors.title = titleErr;

  const descErr = applyRules(description, 'Description', [required, minLen(30), maxLen(3000)]);
  if (descErr) errors.description = descErr;

  // anonymous is optional — coerce to boolean, default false
  if (anonymous !== undefined) {
    const val = String(anonymous).toLowerCase();
    if (!['true', 'false', '1', '0'].includes(val)) {
      errors.anonymous = 'Anonymous must be true or false.';
    }
  }

  // File count guard (multer already checked size; we check count again for clarity)
  if (req.files && req.files.length > 5) {
    errors.files = 'Maximum 5 evidence files allowed per complaint.';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed. Please correct the highlighted fields.', 422, errors);
  }

  next();
};

/* ════════════════════════════════════════════════════════
   PATCH /api/v1/complaints/:id/status
   Body: { status }
════════════════════════════════════════════════════════ */
export const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const err = applyRules(status, 'Status', [required, oneOf(VALID_STATUSES)]);
  if (err) return sendError(res, err, 422, { status: err });
  next();
};

/* ════════════════════════════════════════════════════════
   GET /api/v1/complaints — query param sanitisation
   Strips unknown params, coerces page/limit to safe integers
════════════════════════════════════════════════════════ */
export const sanitiseListQuery = (req, _res, next) => {
  let { page, limit, status, category } = req.query;

  page  = Math.max(1, parseInt(page)  || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));

  // Remove unknown filter values silently
  if (status   && !VALID_STATUSES.has(status))    status   = undefined;
  if (category && !VALID_CATEGORIES.has(category)) category = undefined;

  req.query = { page, limit, status, category };
  next();
};
