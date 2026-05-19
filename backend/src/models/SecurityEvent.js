import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema(
  {
    event_type: {
      type: String,
      required: true,
      enum: ['auth_failed', 'lockout', 'rate_limit_violation', 'token_reuse_detected', 'csrf_attempt', 'xss_blocked', 'role_changed'],
      index: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    ip_address: {
      type: String,
      required: true,
      index: true,
    },
    user_agent: {
      type: String,
    },
    request_path: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete logs after retention period (e.g. 90 days)
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for quick IP security threat reports
securityEventSchema.index({ ip_address: 1, event_type: 1, created_at: -1 });

export const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);
