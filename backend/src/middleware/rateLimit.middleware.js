/**
 * rateLimit.middleware.js
 *
 * Middleware to enforce rate limits on complaint submissions.
 * It also logs suspicious activity (rate limit hits) to the database.
 */

import { config }           from '../config/config.js';
import { complaintService } from '../services/complaint.service.js';
import { AppError }          from '../utils/response.js';
import { asyncHandler }     from '../utils/asyncHandler.js';

/**
 * Enforce a limit on the number of complaints a user can submit.
 */
export const checkComplaintRateLimit = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { maxPerHour, windowMinutes } = config.complaintRateLimit;

  // 1. Get recent complaint count
  const recentCount = await complaintService.countRecentByUserId(userId, windowMinutes);

  if (recentCount >= maxPerHour) {
    // 2. Log suspicious activity
    await complaintService.logActivity({
      userId,
      activityType: 'rate_limit_exceeded',
      severity: 'medium',
      details: {
        recentCount,
        maxPerHour,
        windowMinutes,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.originalUrl,
      },
    });

    // 3. Block the request
    throw new AppError(
      `You have exceeded the maximum limit of ${maxPerHour} complaints per hour. Please try again later.`,
      429, // Too Many Requests
    );
  }

  next();
});
