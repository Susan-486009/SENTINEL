import { User } from '../models/User.js';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
} from '../utils/auth.js';
import { AppError } from '../utils/response.js';

export const authService = {

  /* ══════════════════════════════════════════════════════
     REGISTER
  ══════════════════════════════════════════════════════ */
  async register({ name, matric, email, password, role = 'student' }) {
    // Normalise inputs
    const normEmail  = email ? email.trim().toLowerCase() : undefined;
    const normMatric = matric.trim().toUpperCase();
    const normName   = name.trim();
    const safeRole   = ['student', 'staff'].includes(role) ? role : 'student';

    // Duplicate email check — only if an email was provided
    if (normEmail) {
      const byEmail = await User.findOne({ email: normEmail }).select('_id').lean();
      if (byEmail) throw new AppError('This email address is already registered.', 409);
    }

    const byMatric = await User.findOne({ matric: normMatric }).select('_id').lean();
    if (byMatric) throw new AppError('This Matric/Staff number is already registered.', 409);

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name: normName,
      matric: normMatric,
      ...(normEmail && { email: normEmail }),
      password: hashedPassword,
      role: safeRole,
    });

    // Issue tokens
    const tokenPayload = { id: newUser._id.toString(), role: newUser.role, name: newUser.name };
    const accessToken  = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(newUser._id.toString());

    // Strip password and format ID
    const user = newUser.toObject();
    delete user.password;
    user.id = user._id.toString();
    delete user._id;

    return { accessToken, refreshToken, user };
  },

  /* ══════════════════════════════════════════════════════
     LOGIN
  ══════════════════════════════════════════════════════ */
  async login({ identifier, password }) {
    try {
      const norm = identifier.trim().toLowerCase();
      const normMatric = identifier.trim().toUpperCase();

      // Look up by email first, then by matric (case-insensitive)
      const user = await User.findOne({
        $or: [
          { email: norm },
          { matric: normMatric }
        ]
      }).lean();

      // Use a constant-time path for both "not found" and "wrong password"
      const dummy = '$2b$12$L6T3vW6qRkY9vP5uI2a7O.xW1yZ8aK6m5Qv9L3tG2H4j7K8m9N0Pq'; 
      await verifyPassword(password, user ? user.password : dummy);

      if (!user) throw new AppError('Invalid credentials.', 401);

      const passwordMatch = await verifyPassword(password, user.password);
      if (!passwordMatch) throw new AppError('Invalid credentials.', 401);

      // Issue tokens
      const tokenPayload = { id: user._id.toString(), role: user.role, name: user.name };
      const accessToken  = signAccessToken(tokenPayload);
      const refreshToken = signRefreshToken(user._id.toString());

      // Strip sensitive fields
      const { password: _pw, ...safeUser } = user;
      safeUser.id = safeUser._id.toString();
      delete safeUser._id;

      return { accessToken, refreshToken, user: safeUser };
    } catch (error) {
      console.error('❌ Login Service Error:', error);
      throw error;
    }
  },

  /* ══════════════════════════════════════════════════════
     GET PROFILE
  ══════════════════════════════════════════════════════ */
  async getById(id) {
    const user = await User.findById(id).select('-password').lean();
    if (!user) throw new AppError('User not found.', 404);
    
    user.id = user._id.toString();
    delete user._id;
    return user;
  },

  /* ══════════════════════════════════════════════════════
     UPDATE PROFILE
  ══════════════════════════════════════════════════════ */
  async updateProfile(id, { name, email, settings }) {
    const updates = {};

    if (name) {
      updates.name = name.trim();
    }
    if (email) {
      const norm = email.trim().toLowerCase();
      // Check email not taken by someone else
      const conflict = await User.findOne({ email: norm, _id: { $ne: id } }).select('_id').lean();
      if (conflict) throw new AppError('Email address is already in use.', 409);
      updates.email = norm;
    }

    if (settings) {
      if (settings.email_notifications !== undefined) {
        updates['settings.email_notifications'] = settings.email_notifications;
      }
      if (settings.in_app_notifications !== undefined) {
        updates['settings.in_app_notifications'] = settings.in_app_notifications;
      }
      if (settings.theme) {
        updates['settings.theme'] = settings.theme;
      }
    }

    if (Object.keys(updates).length === 0) throw new AppError('No fields to update.', 400);

    const updatedUser = await User.findByIdAndUpdate(id, { $set: updates }, { new: true })
                                  .select('-password')
                                  .lean();
    if (!updatedUser) throw new AppError('User not found.', 404);
    
    updatedUser.id = updatedUser._id.toString();
    delete updatedUser._id;
    return updatedUser;
  },

  /* ══════════════════════════════════════════════════════
     CHANGE PASSWORD
  ══════════════════════════════════════════════════════ */
  async changePassword(id, { currentPassword, newPassword }) {
    const user = await User.findById(id).select('password').lean();
    if (!user) throw new AppError('User not found.', 404);

    const match = await verifyPassword(currentPassword, user.password);
    if (!match) throw new AppError('Current password is incorrect.', 401);

    if (currentPassword === newPassword) {
      throw new AppError('New password must be different from current password.', 400);
    }

    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(id, { password: hashed });

    return { message: 'Password updated successfully.' };
  },

  /* ══════════════════════════════════════════════════════
     GET ALL USERS (ADMIN)
  ══════════════════════════════════════════════════════ */
  async getAllUsers({ role, search, page = 1, limit = 50 }) {
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { matric: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const formattedUsers = users.map(u => ({
      ...u,
      id: u._id.toString(),
      _id: undefined,
    }));

    return {
      users: formattedUsers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  },
};
