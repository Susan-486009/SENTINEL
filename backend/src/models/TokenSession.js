import mongoose from 'mongoose';

const tokenSessionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refresh_token: {
      type: String,
      required: true,
      unique: true,
    },
    token_family: {
      type: String,
      required: true,
      index: true, // Group sessions by family to detect reuse
    },
    device_user_agent: {
      type: String,
      trim: true,
    },
    ip_address: {
      type: String,
      trim: true,
    },
    is_revoked: {
      type: Boolean,
      default: false,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index to auto-delete expired sessions from MongoDB
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Create compound index for querying user active sessions
tokenSessionSchema.index({ user_id: 1, is_revoked: 1 });

export const TokenSession = mongoose.model('TokenSession', tokenSessionSchema);
