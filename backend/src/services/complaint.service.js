import { Complaint } from '../models/Complaint.js';
import { SuspiciousActivity } from '../models/SuspiciousActivity.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/response.js';
import { generateIdWithRetry, VALID_STATUSES } from '../utils/complaint.utils.js';
import {
  processAndStore,
  getFilesForComplaint,
  safeCleanRaw,
} from './file.service.js';

export const complaintService = {

  /* ══════════════════════════════════════════════════════
     CREATE
  ══════════════════════════════════════════════════════ */
  async create({ userId, category, title, description, anonymous, files = [] }) {
    let referenceId;

    try {
      referenceId = await generateIdWithRetry();

      // Process files first (they don't need the complaint ID in MongoDB yet)
      const attachedFiles = await processAndStore(files);

      const newComplaint = await Complaint.create({
        reference_id: referenceId,
        user_id: anonymous ? null : userId,
        category,
        title: title.trim(),
        description: description.trim(),
        anonymous: anonymous ? true : false,
        status: 'pending',
        files: attachedFiles,
      });

      return {
        id:          newComplaint._id.toString(),
        referenceId,
        filesCount:  newComplaint.files.length,
        files:       newComplaint.files,
      };

    } catch (err) {
      await safeCleanRaw(files);
      throw err;
    }
  },

  /* ══════════════════════════════════════════════════════
     GET BY USER
  ══════════════════════════════════════════════════════ */
  async getByUser(userId) {
    const complaints = await Complaint.find({ user_id: userId })
      .select('reference_id category title status anonymous files created_at updated_at')
      .sort({ created_at: -1 })
      .lean();

    return complaints.map(c => ({
      id: c._id.toString(),
      reference_id: c.reference_id,
      category: c.category,
      title: c.title,
      status: c.status,
      anonymous: c.anonymous,
      created_at: c.created_at,
      updated_at: c.updated_at,
      file_count: c.files ? c.files.length : 0,
    }));
  },

  /* ══════════════════════════════════════════════════════
     GET ONE
  ══════════════════════════════════════════════════════ */
  async getById(identifier, userId, role) {
    const isRef = typeof identifier === 'string' && identifier.startsWith('CMP-');

    const query = isRef ? { reference_id: identifier } : { _id: identifier };
    const complaint = await Complaint.findOne(query).lean();

    if (!complaint) {
      throw new AppError(
        `Complaint ${isRef ? identifier : `#${identifier}`} not found.`,
        404,
      );
    }

    if (role !== 'admin' && complaint.user_id?.toString() !== userId) {
      throw new AppError('Complaint not found.', 404);
    }

    let submitter = null;
    if (!complaint.anonymous || role === 'admin') {
      if (complaint.user_id) {
        submitter = await User.findById(complaint.user_id)
          .select('name matric email')
          .lean();
        if (submitter) {
          submitter.id = submitter._id.toString();
          delete submitter._id;
        }
      }
    }

    return {
      id:          complaint._id.toString(),
      referenceId: complaint.reference_id,
      category:    complaint.category,
      title:       complaint.title,
      description: complaint.description,
      status:      complaint.status,
      anonymous:   complaint.anonymous,
      submitter,
      files:       complaint.files || [],
      createdAt:   complaint.created_at,
      updatedAt:   complaint.updated_at,
    };
  },

  /* ══════════════════════════════════════════════════════
     TRACKING (Public)
  ══════════════════════════════════════════════════════ */
  async trackByReference(referenceId) {
    const complaint = await Complaint.findOne({ reference_id: referenceId.trim().toUpperCase() })
      .select('reference_id category title status anonymous created_at updated_at')
      .lean();

    if (!complaint) {
      throw new AppError(`No complaint found with reference ID ${referenceId}.`, 404);
    }

    return {
      referenceId:  complaint.reference_id,
      category:     complaint.category,
      title:        complaint.title,
      status:       complaint.status,
      anonymous:    complaint.anonymous,
      submittedAt:  complaint.created_at,
      lastUpdated:  complaint.updated_at,
    };
  },

  /* ══════════════════════════════════════════════════════
     ADMIN — paginated list
  ══════════════════════════════════════════════════════ */
  async getAll({ status, category, page = 1, limit = 20 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('user_id', 'name matric')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    const rows = complaints.map(c => ({
      id: c._id.toString(),
      reference_id: c.reference_id,
      category: c.category,
      title: c.title,
      status: c.status,
      anonymous: c.anonymous,
      created_at: c.created_at,
      updated_at: c.updated_at,
      user_name: c.user_id ? c.user_id.name : null,
      matric: c.user_id ? c.user_id.matric : null,
      file_count: c.files ? c.files.length : 0,
    }));

    return {
      rows,
      pagination: {
        total,
        page:  Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    };
  },

  /* ══════════════════════════════════════════════════════
     UPDATE STATUS
  ══════════════════════════════════════════════════════ */
  async updateStatus(id, status) {
    if (!VALID_STATUSES.has(status)) {
      throw new AppError(
        `Invalid status "${status}". Allowed: ${[...VALID_STATUSES].join(', ')}`,
        400,
      );
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!complaint) throw new AppError('Complaint not found.', 404);

    return { id: complaint._id.toString(), status: complaint.status };
  },

  /* ══════════════════════════════════════════════════════
     TRACKING & SECURITY
  ══════════════════════════════════════════════════════ */
  async countRecentByUserId(userId, minutes) {
    const cutoff = new Date(Date.now() - minutes * 60000);
    return Complaint.countDocuments({
      user_id: userId,
      created_at: { $gte: cutoff },
    });
  },

  async logActivity({ userId, activityType, details, severity = 'low' }) {
    await SuspiciousActivity.create({
      user_id: userId,
      activity_type: activityType,
      details,
      severity,
    });
  },
};
