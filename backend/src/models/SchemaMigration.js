import mongoose from 'mongoose';

const schemaMigrationSchema = new mongoose.Schema(
  {
    migration_name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    executed_at: {
      type: Date,
      default: Date.now,
    },
    success: {
      type: Boolean,
      required: true,
    },
    error_message: {
      type: String,
      default: null,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    locked_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const SchemaMigration = mongoose.model('SchemaMigration', schemaMigrationSchema);
