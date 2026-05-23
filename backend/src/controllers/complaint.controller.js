import { asyncHandler }     from '../utils/asyncHandler.js';
import { sendSuccess }      from '../utils/response.js';
import { complaintService } from '../services/complaint.service.js';
import { deleteFile }       from '../services/file.service.js';

/* ════════════════════════════════════════════════════════
   POST /api/v1/complaints
   Multipart form-data:
     category, title, description, anonymous  (text fields)
     files[]                                  (up to 5 files)
════════════════════════════════════════════════════════ */
export const submitComplaint = asyncHandler(async (req, res) => {
  const { category, title, description, anonymous, priority } = req.body;

  const result = await complaintService.create({
    userId:    req.user.id,
    category,
    title,
    description,
    anonymous: ['true', '1', true].includes(anonymous),
    priority: priority || 'normal',
    files:     req.files ?? [],
  });

  sendSuccess(
    res,
    result,
    `Complaint ${result.referenceId} submitted successfully. Keep your reference ID safe.`,
    201,
  );
});

/* ════════════════════════════════════════════════════════
   GET /api/v1/complaints/mine
   Returns the authenticated user's complaint list.
════════════════════════════════════════════════════════ */
export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await complaintService.getByUser(req.user.id);
  sendSuccess(res, complaints);
});

/* ════════════════════════════════════════════════════════
   GET /api/v1/complaints/track/:refId  (public)
   No auth required — returns limited status info.
   e.g. GET /api/v1/complaints/track/CMP-2026-00042
════════════════════════════════════════════════════════ */
export const trackComplaint = asyncHandler(async (req, res) => {
  const data = await complaintService.trackByReference(req.params.refId);
  sendSuccess(res, data);
});

/* ════════════════════════════════════════════════════════
   GET /api/v1/complaints/:id
   :id can be either:
     - a numeric DB id  → "42"
     - a reference id   → "CMP-2026-00042"
   Non-admins can only access their own complaints.
════════════════════════════════════════════════════════ */
export const getComplaintById = asyncHandler(async (req, res) => {
  const rawId = req.params.id;

  // Detect whether the caller used a reference ID, hex ObjectId, or numeric id
  let identifier;
  if (rawId.startsWith('CMP-')) {
    identifier = rawId;
  } else if (/^[0-9a-fA-F]{24}$/.test(rawId)) {
    identifier = rawId;
  } else {
    identifier = Number(rawId);
    if (isNaN(identifier)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint identifier.' });
    }
  }

  const complaint = await complaintService.getById(
    identifier,
    req.user.id,
    req.user.role,
  );

  sendSuccess(res, complaint);
});

/* ════════════════════════════════════════════════════════
   GET /api/v1/complaints  (admin only)
   Query params: status, category, page, limit
════════════════════════════════════════════════════════ */
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { status, category, priority, page, limit } = req.query;
  const result = await complaintService.getAll({ status, category, priority, page, limit });
  sendSuccess(res, result);
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await complaintService.getStats();
  sendSuccess(res, stats);
});

/* ════════════════════════════════════════════════════════
   PATCH /api/v1/complaints/:id/status  (admin only)
   Body: { status: 'pending'|'in_review'|'resolved'|'rejected' }
════════════════════════════════════════════════════════ */
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const updated = await complaintService.updateStatus(
    req.params.id,
    req.body.status,
    req.user.id
  );
  sendSuccess(res, updated, `Status updated to "${updated.status}".`);
});

export const updateComplaintPriority = asyncHandler(async (req, res) => {
  const updated = await complaintService.updatePriority(
    req.params.id,
    req.body.priority,
    req.user.id
  );
  sendSuccess(res, updated, `Priority updated to "${updated.priority}".`);
});

export const addInternalNote = asyncHandler(async (req, res) => {
  const note = await complaintService.addInternalNote(
    req.params.id,
    req.user.id,
    req.body.text
  );
  sendSuccess(res, note, 'Internal note added successfully.');
});

/* ════════════════════════════════════════════════════════
   DELETE /api/v1/complaints/files/:fileId
   Owner or admin only.
════════════════════════════════════════════════════════ */
export const removeFile = asyncHandler(async (req, res) => {
  const fileId = /^[0-9a-fA-F]{24}$/.test(req.params.fileId) ? req.params.fileId : Number(req.params.fileId);
  const result = await deleteFile(
    fileId,
    req.user.id,
    req.user.role,
  );
  sendSuccess(res, result, 'Evidence file deleted successfully.');
});
