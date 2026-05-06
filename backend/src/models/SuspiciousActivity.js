import mongoose from 'mongoose';

const suspiciousActivitySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activity_type: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

export const SuspiciousActivity = mongoose.model('SuspiciousActivity', suspiciousActivitySchema);
