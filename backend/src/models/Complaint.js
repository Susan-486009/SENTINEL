import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    url: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

const noteSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const timelineSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['status_change', 'note_added', 'assigned', 'evidence_added', 'system'], 
    required: true 
  },
  text: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema(
  {
    reference_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Nullable for anonymous
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved', 'fixed', 'rejected'],
      default: 'pending',
    },
    admin_feedback: {
      type: String,
      default: '',
    },
    ai_draft_reply: {
      type: String,
      default: null,
    },
    satisfaction_feedback: {
      satisfied: { type: String, enum: ['yes', 'no'], default: null },
      comments: { type: String, default: '' },
      submitted_at: { type: Date, default: null }
    },
    files: [fileSchema],
    internal_notes: [noteSchema],
    timeline: [timelineSchema],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Complaint = mongoose.model('Complaint', complaintSchema);
