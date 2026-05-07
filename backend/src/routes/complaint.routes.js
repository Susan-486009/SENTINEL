import { Router }     from 'express';
import * as complaint  from '../controllers/complaint.controller.js';
import { authenticate, authorize }              from '../middleware/auth.middleware.js';
import { uploadFiles, handleMulterError }       from '../middleware/upload.middleware.js';
import { checkComplaintRateLimit }              from '../middleware/rateLimit.middleware.js';
import {
  validateSubmitComplaint,
  validateStatusUpdate,
  sanitiseListQuery,
} from '../middleware/complaint.validate.js';

const router = Router();

/* ════════════════════════════════════════════════════════
   PUBLIC — no auth required
════════════════════════════════════════════════════════ */

/**
 * GET /api/v1/complaints/track/:refId
 * Public status tracking by reference ID.
 * e.g. GET /api/v1/complaints/track/CMP-2026-00042
 */
router.get('/track/:refId', complaint.trackComplaint);

/* ════════════════════════════════════════════════════════
   PROTECTED — valid JWT required for all routes below
════════════════════════════════════════════════════════ */
router.use(authenticate);

/* ── User routes ─────────────────────────────────────── */

/**
 * POST /api/v1/complaints
 * Multipart form-data.
 * Fields: category, title, description, anonymous
 * File field: "files" (up to 5)
 */
router.post(
  '/',
  uploadFiles,                  // 1. multer — save raws to uploads/raw/
  handleMulterError,            // 2. normalise multer errors → AppError
  checkComplaintRateLimit,      // 3. check user submission limit (flag if spamming)
  validateSubmitComplaint,      // 4. validate all text fields + file count
  complaint.submitComplaint,    // 5. service + Sharp compression
);

/**
 * GET /api/v1/complaints/mine
 * Authenticated user's own complaints list.
 */
router.get('/mine', complaint.getMyComplaints);

/**
 * GET /api/v1/complaints/:id
 * :id can be numeric (42) or reference (CMP-2026-00042).
 * Non-admins only see their own complaints.
 */
router.get('/:id', complaint.getComplaintById);

/**
 * DELETE /api/v1/complaints/files/:fileId
 * Delete an evidence file. Owner or admin only.
 */
router.delete('/files/:fileId', complaint.removeFile);

/* ── Admin-only routes ───────────────────────────────── */

/**
 * GET /api/v1/complaints
 * Paginated list with optional filters.
 */
router.get(
  '/',
  authorize('admin'),
  sanitiseListQuery,
  complaint.getAllComplaints,
);

/**
 * GET /api/v1/complaints/stats/overview
 */
router.get(
  '/stats/overview',
  authorize('admin'),
  complaint.getAdminStats
);

/**
 * PATCH /api/v1/complaints/:id/status
 */
router.patch(
  '/:id/status',
  authorize('admin'),
  validateStatusUpdate,
  complaint.updateComplaintStatus,
);

/**
 * PATCH /api/v1/complaints/:id/priority
 */
router.patch(
  '/:id/priority',
  authorize('admin'),
  complaint.updateComplaintPriority
);

/**
 * POST /api/v1/complaints/:id/notes
 */
router.post(
  '/:id/notes',
  authorize('admin'),
  complaint.addInternalNote
);

export default router;
