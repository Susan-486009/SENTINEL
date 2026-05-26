import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { AuditLog } from '../models/AuditLog.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 200;
  
  const logs = await AuditLog.find()
    .populate('actor_id', 'name email role')
    .sort({ created_at: -1 })
    .limit(limit)
    .lean();

  sendSuccess(res, logs);
});
