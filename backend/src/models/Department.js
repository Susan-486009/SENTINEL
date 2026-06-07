import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    head_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    categories: {
      type: [String],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Department = mongoose.model('Department', departmentSchema);
