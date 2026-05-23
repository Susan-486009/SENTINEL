import { Complaint } from '../models/Complaint.js';
import { SuspiciousActivity } from '../models/SuspiciousActivity.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/response.js';
import { generateIdWithRetry, VALID_STATUSES } from '../utils/complaint.utils.js';
import { Notification } from '../models/Notification.js';
import {
  processAndStore,
  safeCleanRaw,
} from './file.service.js';

export const complaintService = {

  /* ══════════════════════════════════════════════════════
     CREATE
  ══════════════════════════════════════════════════════ */
  async create({ userId, category, title, description, anonymous, priority = 'normal', files = [] }) {
    let referenceId;

    try {
      referenceId = await generateIdWithRetry();

      const attachedFiles = await processAndStore(files);

      const newComplaint = await Complaint.create({
        reference_id: referenceId,
        user_id: userId,
        category,
        title: title.trim(),
        description: description.trim(),
        anonymous: anonymous ? true : false,
        priority,
        status: 'pending',
        files: attachedFiles,
        timeline: [{
          type: 'system',
          text: 'Complaint submitted and reference ID issued.',
          user_id: userId
        }]
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
      .select('reference_id category title status priority anonymous files created_at updated_at')
      .sort({ created_at: -1 })
      .lean();

    return complaints.map(c => ({
      _id: c._id.toString(),
      reference_id: c.reference_id,
      category: c.category,
      title: c.title,
      status: c.status,
      priority: c.priority,
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
    const complaint = await Complaint.findOne(query)
      .populate('internal_notes.admin_id', 'name')
      .populate('timeline.user_id', 'name role')
      .lean();

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
    if (!complaint.anonymous || complaint.user_id?.toString() === userId) {
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
      id:             complaint._id.toString(),
      referenceId:    complaint.reference_id,
      category:       complaint.category,
      title:          complaint.title,
      description:    complaint.description,
      status:         complaint.status,
      priority:       complaint.priority,
      anonymous:      complaint.anonymous,
      submitter,
      files:          complaint.files || [],
      internalNotes:  complaint.internal_notes || [],
      timeline:       (complaint.timeline || []).map(t => {
        const showUser = t.user_id && (!complaint.anonymous || t.user_id.role === 'admin');
        return {
          type: t.type,
          text: t.text,
          user_id: showUser ? t.user_id : null,
          created_at: t.created_at,
        };
      }),
      createdAt:      complaint.created_at,
      updatedAt:      complaint.updated_at,
    };
  },

  /* ══════════════════════════════════════════════════════
     TRACKING (Public)
  ══════════════════════════════════════════════════════ */
  async trackByReference(referenceId) {
    const complaint = await Complaint.findOne({ reference_id: referenceId.trim().toUpperCase() })
      .select('reference_id category title status anonymous timeline created_at updated_at')
      .populate('timeline.user_id', 'name role')
      .lean();

    if (!complaint) {
      throw new AppError(`No complaint found with reference ID ${referenceId}.`, 404);
    }

    return {
      reference_id:  complaint.reference_id,
      category:     complaint.category,
      title:        complaint.title,
      status:       complaint.status,
      anonymous:    complaint.anonymous,
      timeline:     (complaint.timeline || []).map(t => {
        const showUser = t.user_id && (!complaint.anonymous || t.user_id.role === 'admin');
        return {
          type: t.type,
          text: t.text,
          user_id: showUser ? t.user_id : null,
          created_at: t.created_at,
        };
      }),
      created_at:  complaint.created_at,
      updated_at:  complaint.updated_at,
    };
  },

  /* ══════════════════════════════════════════════════════
     ADMIN — paginated list
  ══════════════════════════════════════════════════════ */
  async getAll({ status, category, priority, page = 1, limit = 50 } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);

    const complaints = await Complaint.find(filter)
      .populate('user_id', 'name matric')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Complaint.countDocuments(filter);

    return complaints.map(c => ({
      _id: c._id.toString(),
      reference_id: c.reference_id,
      category: c.category,
      title: c.title,
      status: c.status,
      priority: c.priority,
      anonymous: c.anonymous,
      created_at: c.created_at,
      updated_at: c.updated_at,
      user_name: (c.user_id && !c.anonymous) ? c.user_id.name : null,
      matric: (c.user_id && !c.anonymous) ? c.user_id.matric : null,
      file_count: c.files ? c.files.length : 0,
    }));
  },

  /* ══════════════════════════════════════════════════════
     UPDATE STATUS
  ══════════════════════════════════════════════════════ */
  async updateStatus(id, status, adminId) {
    if (!VALID_STATUSES.has(status)) {
      throw new AppError(`Invalid status "${status}".`, 400);
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) throw new AppError('Complaint not found.', 404);

    const oldStatus = complaint.status;
    complaint.status = status;
    
    complaint.timeline.push({
      type: 'status_change',
      text: `Status changed from ${oldStatus.replace('_', ' ')} to ${status.replace('_', ' ')}.`,
      user_id: adminId
    });

    await complaint.save();

    // Notify student privately even if anonymous
    if (complaint.user_id) {
      await Notification.create({
        recipient_id: complaint.user_id,
        title: 'Case Status Updated',
        message: `Your case #${complaint.reference_id} status has been changed to ${status.replace('_', ' ')}.`,
        type: 'status_update',
        reference_link: `/track?id=${complaint.reference_id}`
      });
    }

    return { id: complaint._id.toString(), status: complaint.status };
  },

  /* ══════════════════════════════════════════════════════
     ADD INTERNAL NOTE
  ══════════════════════════════════════════════════════ */
  async addInternalNote(id, adminId, text) {
    const complaint = await Complaint.findById(id);
    if (!complaint) throw new AppError('Complaint not found.', 404);

    complaint.internal_notes.push({
      admin_id: adminId,
      text: text.trim()
    });

    complaint.timeline.push({
      type: 'note_added',
      text: 'Internal note added by administrator.',
      user_id: adminId
    });

    await complaint.save();

    return complaint.internal_notes[complaint.internal_notes.length - 1];
  },

  /* ══════════════════════════════════════════════════════
     UPDATE PRIORITY
  ══════════════════════════════════════════════════════ */
  async updatePriority(id, priority, adminId) {
    const validPriorities = ['low', 'normal', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      throw new AppError('Invalid priority.', 400);
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) throw new AppError('Complaint not found.', 404);

    const oldPriority = complaint.priority;
    complaint.priority = priority;

    complaint.timeline.push({
      type: 'system',
      text: `Priority updated from ${oldPriority} to ${priority}.`,
      user_id: adminId
    });

    await complaint.save();
    return { id: complaint._id.toString(), priority: complaint.priority };
  },

  /* ══════════════════════════════════════════════════════
     GET ADMIN STATS
  ══════════════════════════════════════════════════════ */
  async getStats() {
    const [counts, byCategory] = await Promise.all([
      Complaint.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$category', open: { $sum: { $cond: [{ $in: ['$status', ['pending', 'in_review']] }, 1, 0] } }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } } } }
      ])
    ]);

    return {
      statusCounts: counts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      categoryStats: byCategory
    };
  },

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
