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
      ...(normEmail && { email: normEmail }),  // only set email if provided
      password: hashedPassword,
      role: safeRole,
    });

    return {
      id:    newUser._id.toString(),
      name:  normName,
      matric: normMatric,
      ...(normEmail && { email: normEmail }),
      role:  safeRole,
    };
  },

  /* ══════════════════════════════════════════════════════
     LOGIN
  ══════════════════════════════════════════════════════ */
  async login({ identifier, password }) {
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
  async updateProfile(id, { name, email }) {
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

    if (Object.keys(updates).length === 0) throw new AppError('No fields to update.', 400);

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true })
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
};
