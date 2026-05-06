import { query, queryOne, withTransaction } from '../config/db.js';
import { AppError }           from '../utils/response.js';
import { generateIdWithRetry, VALID_STATUSES } from '../utils/complaint.utils.js';
import {
  processAndStore,
  getFilesForComplaint,
  safeCleanRaw,
} from './file.service.js';

export const complaintService = {

  /* ══════════════════════════════════════════════════════
     CREATE — POST /complaints
     Atomically inserts complaint row, generates reference ID,
     then processes uploaded files outside the transaction.
  ══════════════════════════════════════════════════════ */
  async create({ userId, category, title, description, anonymous, files = [] }) {
    let complaintId;
    let referenceId;

    try {
      // Step 1 — Generate a unique ID first
      referenceId = await generateIdWithRetry();

      // Step 2 — Insert complaint row inside a transaction
      complaintId = await withTransaction(async (conn) => {
        const result = await conn.query(
          `INSERT INTO complaints
             (reference_id, user_id, category, title, description, anonymous, status)
           VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [
            referenceId,
            anonymous ? null : userId,
            category,
            title.trim(),
            description.trim(),
            anonymous ? 1 : 0,
          ],
        );
        return result.insertId;
      });

      // Step 2 — Process + compress files (Sharp I/O outside transaction)
      const attachedFiles = await processAndStore(files, complaintId);

      return {
        id:          complaintId,
        referenceId,
        filesCount:  attachedFiles.length,
        files:       attachedFiles,
      };

    } catch (err) {
      // On any failure, clean up raw uploads multer already saved
      await safeCleanRaw(files);
      throw err;
    }
  },

  /* ══════════════════════════════════════════════════════
     GET BY USER — dashboard list
  ══════════════════════════════════════════════════════ */
  async getByUser(userId) {
    return query(
      `SELECT
         c.id,
         c.reference_id,
         c.category,
         c.title,
         c.status,
         c.anonymous,
         c.created_at,
         c.updated_at,
         COUNT(cf.id) AS file_count
       FROM complaints c
       LEFT JOIN complaint_files cf ON cf.complaint_id = c.id
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [userId],
    );
  },

  /* ══════════════════════════════════════════════════════
     GET ONE — GET /complaints/:id
     Accepts either the numeric id OR the reference_id string.
     Enforces ownership for non-admins.
  ══════════════════════════════════════════════════════ */
  async getById(identifier, userId, role) {
    // Support both numeric id and "CMP-2026-00042" style reference
    const isRef = typeof identifier === 'string' && identifier.startsWith('CMP-');

    const complaint = await queryOne(
      isRef
        ? 'SELECT * FROM complaints WHERE reference_id = ?'
        : 'SELECT * FROM complaints WHERE id = ?',
      [identifier],
    );

    if (!complaint) {
      throw new AppError(
        `Complaint ${isRef ? identifier : `#${identifier}`} not found.`,
        404,
      );
    }

    // Authorization: non-admins can only view their own complaints
    if (role !== 'admin' && complaint.user_id !== userId) {
      // Deliberately vague — don't reveal the complaint exists for other users
      throw new AppError('Complaint not found.', 404);
    }

    // Fetch submitter info (hidden for anonymous complaints unless admin)
    let submitter = null;
    if (!complaint.anonymous || role === 'admin') {
      submitter = await queryOne(
        'SELECT id, name, matric, email FROM users WHERE id = ?',
        [complaint.user_id],
      );
    }

    // Fetch attached files with public URLs
    const files = await getFilesForComplaint(complaint.id);

    return {
      id:          complaint.id,
      referenceId: complaint.reference_id,
      category:    complaint.category,
      title:       complaint.title,
      description: complaint.description,
      status:      complaint.status,
      anonymous:   Boolean(complaint.anonymous),
      submitter,
      files,
      createdAt:   complaint.created_at,
      updatedAt:   complaint.updated_at,
    };
  },

  /* ══════════════════════════════════════════════════════
     GET BY REFERENCE ID (public tracking — no auth required)
     Returns a limited view: no submitter info, no description.
  ══════════════════════════════════════════════════════ */
  async trackByReference(referenceId) {
    const complaint = await queryOne(
      `SELECT id, reference_id, category, title, status, anonymous, created_at, updated_at
       FROM complaints WHERE reference_id = ?`,
      [referenceId.trim().toUpperCase()],
    );

    if (!complaint) {
      throw new AppError(`No complaint found with reference ID ${referenceId}.`, 404);
    }

    return {
      referenceId:  complaint.reference_id,
      category:     complaint.category,
      title:        complaint.title,
      status:       complaint.status,
      anonymous:    Boolean(complaint.anonymous),
      submittedAt:  complaint.created_at,
      lastUpdated:  complaint.updated_at,
    };
  },

  /* ══════════════════════════════════════════════════════
     ADMIN — paginated list with filters
  ══════════════════════════════════════════════════════ */
  async getAll({ status, category, page = 1, limit = 20 } = {}) {
    const offset  = (Number(page) - 1) * Number(limit);
    const filters = [];
    const params  = [];

    if (status)   { filters.push('c.status = ?');   params.push(status); }
    if (category) { filters.push('c.category = ?'); params.push(category); }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const rows = await query(
      `SELECT
         c.id,
         c.reference_id,
         c.category,
         c.title,
         c.status,
         c.anonymous,
         c.created_at,
         c.updated_at,
         u.name  AS user_name,
         u.matric,
         COUNT(cf.id) AS file_count
       FROM complaints c
       LEFT JOIN users u  ON u.id  = c.user_id
       LEFT JOIN complaint_files cf ON cf.complaint_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset],
    );

    const countRow = await queryOne(
      `SELECT COUNT(*) AS total FROM complaints c ${where}`,
      params,
    );
    const total = Number(countRow?.total ?? 0);

    return {
      rows,
      pagination: {
        total,
        page:  Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    };
  },

  /* ══════════════════════════════════════════════════════
     ADMIN — update complaint status
  ══════════════════════════════════════════════════════ */
  async updateStatus(id, status) {
    if (!VALID_STATUSES.has(status)) {
      throw new AppError(
        `Invalid status "${status}". Allowed: ${[...VALID_STATUSES].join(', ')}`,
        400,
      );
    }

    const result = await query(
      'UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id],
    );
    if (result.affectedRows === 0) throw new AppError('Complaint not found.', 404);

    return { id, status };
  },

  /* ══════════════════════════════════════════════════════
     TRACKING & SECURITY
  ══════════════════════════════════════════════════════ */

  /**
   * Count complaints submitted by a user in the last X minutes.
   * Used by the rate limiter.
   */
  async countRecentByUserId(userId, minutes) {
    const row = await queryOne(
      `SELECT COUNT(*) AS count
       FROM complaints
       WHERE user_id = ?
         AND created_at >= NOW() - INTERVAL ? MINUTE`,
      [userId, minutes],
    );
    return Number(row?.count ?? 0);
  },

  /**
   * Log a suspicious activity record for admin review.
   */
  async logActivity({ userId, activityType, details, severity = 'low' }) {
    await query(
      `INSERT INTO suspicious_activities (user_id, activity_type, details, severity)
       VALUES (?, ?, ?, ?)`,
      [userId, activityType, JSON.stringify(details), severity],
    );
  },
};
