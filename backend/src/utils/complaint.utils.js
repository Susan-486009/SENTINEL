/**
 * complaint.utils.js
 *
 * ID Generation
 * ─────────────
 * generateId()
 *   Produces a self-contained, unique complaint reference ID.
 *   Format:  CMP-<BASE36_TIMESTAMP>-<RANDOM>
 *   Example: CMP-LZF8K4-A3BX
 *
 *   Components:
 *     CMP      — fixed prefix, easy to recognise in logs / emails
 *     LZF8K4   — current timestamp in milliseconds encoded as base-36
 *                (6 chars until ~year 2059, always grows monotonically)
 *     A3BX     — 4 cryptographically random base-36 characters
 *                (~1.7 million combinations; combined with timestamp
 *                 the collision probability is negligible)
 *
 * generateIdWithRetry(queryFn, maxAttempts?)
 *   Calls generateId() and checks the DB for uniqueness.
 *   Retries up to maxAttempts times before throwing.
 *   Use this inside your complaint creation flow.
 *
 * generateReferenceId(dbId)  [legacy / kept for backward compat]
 *   CMP-<YEAR>-<ZERO_PADDED_ID>
 *   e.g.  CMP-2026-00042
 *
 * Domain constants
 * ────────────────
 * VALID_CATEGORIES  Set<string>
 * VALID_STATUSES    Set<string>
 */

import crypto from 'crypto';


/* ════════════════════════════════════════════════════════
   Core ID builder
════════════════════════════════════════════════════════ */

/**
 * Generate one candidate ID.
 * Does NOT verify uniqueness — use generateIdWithRetry() for that.
 *
 * @returns {string}  e.g. "CMP-LZF8K4-A3BX"
 */
export const generateId = () => {
  // ms-timestamp → base36 string (monotonically increasing, URL-safe)
  const tsPart = Date.now().toString(36).toUpperCase();          // e.g. "LZF8K4TQ"

  // 4 cryptographically random bytes → base36, take first 4 characters
  const randPart = crypto
    .randomBytes(4)
    .readUInt32BE(0)       // interpret 4 bytes as a 32-bit integer
    .toString(36)          // convert to base-36
    .toUpperCase()
    .padStart(4, '0')      // ensure at least 4 chars
    .slice(0, 4);          // cap at 4 chars

  return `CMP-${tsPart}-${randPart}`;
};

/* ════════════════════════════════════════════════════════
   Uniqueness-guaranteed generator
════════════════════════════════════════════════════════ */

import { Complaint } from '../models/Complaint.js';

/**
 * Generate a complaint ID that is guaranteed unique in the database.
 *
 * @param {number}  [maxAttempts=5]  How many retries before giving up
 * @returns {Promise<string>}        Unique ID ready to INSERT
 * @throws  {Error}                  If all attempts yield collisions (extremely unlikely)
 *
 * @example
 *   const refId = await generateIdWithRetry();
 *   await Complaint.create({ reference_id: refId, ... });
 */
export const generateIdWithRetry = async (maxAttempts = 5) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const candidate = generateId();

    const existing = await Complaint.findOne({ reference_id: candidate }).select('_id').lean();

    if (!existing) {
      // No collision — candidate is safe to use
      return candidate;
    }

    // Collision found (astronomically rare) — log and retry
    console.warn(
      `⚠️  ID collision on attempt ${attempt}/${maxAttempts}: ${candidate}. Retrying…`,
    );
  }

  throw new Error(
    `Failed to generate a unique complaint ID after ${maxAttempts} attempts.`,
  );
};

/* ════════════════════════════════════════════════════════
   Decode / parse helpers
════════════════════════════════════════════════════════ */

/**
 * Extract the epoch timestamp encoded in a CMP-* reference ID.
 * Returns null if the ID does not match the expected format.
 *
 * @param   {string} refId   e.g. "CMP-LZF8K4TQ-A3BX"
 * @returns {Date|null}
 */
export const decodeIdTimestamp = (refId) => {
  const match = /^CMP-([A-Z0-9]+)-[A-Z0-9]+$/.exec(refId);
  if (!match) return null;
  const ms = parseInt(match[1], 36);
  return isNaN(ms) ? null : new Date(ms);
};

/**
 * Returns true if the string looks like a valid CMP-* reference ID.
 *
 * @param {string} value
 * @returns {boolean}
 */
export const isValidRefId = (value) =>
  typeof value === 'string' && /^CMP-[A-Z0-9]+-[A-Z0-9]{4}$/.test(value);

/* ════════════════════════════════════════════════════════
   Legacy / DB-sequence based ID  (backward compat)
════════════════════════════════════════════════════════ */

/**
 * Deterministic ID from an existing DB auto-increment value.
 * Kept for backward compatibility with existing records.
 *
 * @param   {number} id   DB auto-increment id
 * @returns {string}      e.g. "CMP-2026-00042"
 */
export const generateReferenceId = (id) => {
  const year   = new Date().getUTCFullYear();
  const padded = String(id).padStart(5, '0');
  return `CMP-${year}-${padded}`;
};

/* ════════════════════════════════════════════════════════
   Domain constants  (shared with validation middleware)
════════════════════════════════════════════════════════ */

export const VALID_CATEGORIES = new Set([
  'academic-result',
  'academic-lecturer',
  'facility-maint',
  'facility-hostel',
  'admin-staff',
  'security',
  'financial',
  'it-service',
  'other',
]);

export const VALID_STATUSES = new Set([
  'pending',
  'in_review',
  'resolved',
  'rejected',
]);
