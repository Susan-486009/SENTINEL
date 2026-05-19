import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true, // e.g. 'complaint_status_updated', 'user_role_changed', 'department_created'
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      index: true,
    },
    target_type: {
      type: String,
      required: false, // e.g. 'Complaint', 'User', 'Department'
    },
    previous_state: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    new_state: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ip_address: {
      type: String,
    },
    user_agent: {
      type: String,
    },
    requestId: {
      type: String,
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Retention limit (e.g., 365 days)
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for querying specific audits by action & timestamp
auditLogSchema.index({ action: 1, created_at: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
