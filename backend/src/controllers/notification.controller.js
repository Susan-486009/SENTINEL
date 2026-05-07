import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/response.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notes = await Notification.find({ recipient_id: req.user.id })
    .sort({ created_at: -1 })
    .limit(50)
    .lean();
  sendSuccess(res, notes);
});

export const markAsRead = asyncHandler(async (req, res) => {
  const note = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient_id: req.user.id },
    { is_read: true },
    { new: true }
  );
  if (!note) throw new AppError('Notification not found.', 404);
  sendSuccess(res, note);
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient_id: req.user.id, is_read: false },
    { is_read: true }
  );
  sendSuccess(res, null, 'All notifications marked as read.');
});
