import crypto from 'crypto';
import { TokenSession } from '../models/TokenSession.js';
import { SecurityEvent } from '../models/SecurityEvent.js';
import { signAccessToken, signRefreshToken } from '../utils/auth.js';
import { AppError } from '../utils/response.js';

export const sessionService = {
  /**
   * Create a fresh Token Session inside MongoDB.
   */
  async createSession(userId, ip, userAgent, tokenFamily = null) {
    const family = tokenFamily || crypto.randomUUID();
    const rawRefreshToken = signRefreshToken(userId);

    // Expire in 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const session = await TokenSession.create({
      user_id: userId,
      refresh_token: rawRefreshToken,
      token_family: family,
      device_user_agent: userAgent,
      ip_address: ip,
      expires_at: expiresAt,
    });

    return {
      refreshToken: rawRefreshToken,
      tokenFamily: family,
    };
  },

  /**
   * Rotate active session refresh token with family checks and reuse detection.
   */
  async rotateSession(oldRefreshToken, ip, userAgent) {
    // 1. Find session in DB
    const session = await TokenSession.findOne({ refresh_token: oldRefreshToken });

    if (!session) {
      // Security warning: possible token reuse or spoof attempt!
      // Look up if this token was previously revoked to track family reuse
      const revokedSession = await TokenSession.findOne({ refresh_token: oldRefreshToken, is_revoked: true });
      if (revokedSession) {
        // Reuse Detected! Invalidate entire family immediately
        await TokenSession.updateMany({ token_family: revokedSession.token_family }, { is_revoked: true });
        
        await SecurityEvent.create({
          event_type: 'token_reuse_detected',
          severity: 'critical',
          message: `Refresh token reuse detected for family ${revokedSession.token_family}. All sessions in family revoked.`,
          user_id: revokedSession.user_id,
          ip_address: ip,
          user_agent: userAgent,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Keep logs 90 days
        });
      }
      throw new AppError('Invalid or expired session.', 401);
    }

    if (session.is_revoked) {
      // Revoked token used - reuse vector! Invalidate family
      await TokenSession.updateMany({ token_family: session.token_family }, { is_revoked: true });
      
      await SecurityEvent.create({
        event_type: 'token_reuse_detected',
        severity: 'critical',
        message: `Revoked refresh token presented for family ${session.token_family}. All family sessions invalidated.`,
        user_id: session.user_id,
        ip_address: ip,
        user_agent: userAgent,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });
      throw new AppError('Session has been revoked due to security violation.', 401);
    }

    // 2. Mark old session as revoked (used)
    session.is_revoked = true;
    await session.save();

    // 3. Create new session in same family
    const { refreshToken, tokenFamily } = await this.createSession(
      session.user_id.toString(),
      ip,
      userAgent,
      session.token_family
    );

    // 4. Return new tokens
    const accessToken = signAccessToken({
      id: session.user_id.toString(),
      role: session.user_id.role || 'student', // fallback
    });

    return {
      accessToken,
      refreshToken,
    };
  },

  /**
   * Revoke a specific session (Logout).
   */
  async revokeSession(refreshToken) {
    await TokenSession.deleteOne({ refresh_token: refreshToken });
  },
};
