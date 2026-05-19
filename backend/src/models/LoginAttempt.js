import mongoose from 'mongoose';

const loginAttemptSchema = new mongoose.Schema(
  {
    ip_address: {
      type: String,
      required: true,
      index: true,
    },
    identifier: {
      type: String, // email or matric
      required: true,
      index: true,
    },
    attempts_count: {
      type: Number,
      default: 1,
    },
    lockout_until: {
      type: Date,
      default: null,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatically purge attempts log after expiration time
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for querying IP-identifier blocks quickly
loginAttemptSchema.index({ ip_address: 1, identifier: 1 });

export const LoginAttempt = mongoose.model('LoginAttempt', loginAttemptSchema);
