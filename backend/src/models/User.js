import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    matric: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: false,   // Optional for students — matric is the primary identifier
      unique: true,
      sparse: true,      // Sparse index allows multiple null values without conflicting
      trim: true,
      lowercase: true,
      default: undefined,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      default: 'student',
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
    settings: {
      email_notifications: { type: Boolean, default: true },
      in_app_notifications: { type: Boolean, default: true },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// We keep the hashing logic in utils/auth.js as before, so no pre-save hook is strictly necessary, 
// but if we want we can do it here. The previous MySQL code hashed before inserting. 
// We'll keep it exactly like the previous MySQL logic (hash before insert) for consistency.

export const User = mongoose.model('User', userSchema);
