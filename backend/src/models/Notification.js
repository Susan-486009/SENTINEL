import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['status_update', 'new_assignment', 'internal_note', 'general'],
      default: 'general',
    },
    reference_link: {
      type: String, // e.g. /track?id=RC-123
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Notification = mongoose.model('Notification', notificationSchema);
