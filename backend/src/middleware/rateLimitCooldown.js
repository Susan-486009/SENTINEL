import { LoginAttempt } from '../models/LoginAttempt.js';
import { SecurityEvent } from '../models/SecurityEvent.js';
import { AppError } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINS = 15;

export const bruteForceLimiter = asyncHandler(async (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const identifier = req.body?.identifier?.trim()?.toLowerCase();

  if (!identifier) {
    return next();
  }

  // Find any existing attempts log for this IP/identifier combination
  const record = await LoginAttempt.findOne({ ip_address: ip, identifier });

  if (record && record.lockout_until && record.lockout_until > new Date()) {
    const remainingMs = record.lockout_until.getTime() - Date.now();
    const remainingMins = Math.ceil(remainingMs / 1000 / 60);
    
    return next(
      new AppError(
        `Too many failed login attempts. This account/IP has been temporarily locked. Please retry in ${remainingMins} minutes.`,
        429
      )
    );
  }

  next();
});

/**
 * Record a failed login attempt, updating lockout bounds and logging security incidents.
 */
export const recordFailedAttempt = async (ip, identifier, userAgent = 'unknown') => {
  const norm = identifier.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + LOCKOUT_WINDOW_MINS * 60 * 1000);

  let record = await LoginAttempt.findOne({ ip_address: ip, identifier: norm });

  if (!record) {
    record = await LoginAttempt.create({
      ip_address: ip,
      identifier: norm,
      attempts_count: 1,
      expires_at: expiresAt,
    });
  } else {
    record.attempts_count += 1;
    record.expires_at = expiresAt;

    if (record.attempts_count >= MAX_ATTEMPTS) {
      // Exponential lockout: lockout_until = now + (attempts * 3 mins)
      const lockoutMinutes = record.attempts_count * 3;
      record.lockout_until = new Date(Date.now() + lockoutMinutes * 60 * 1000);
      record.expires_at = new Date(record.lockout_until.getTime() + LOCKOUT_WINDOW_MINS * 60 * 1000);

      // Persist to SecurityEvent
      await SecurityEvent.create({
        event_type: 'lockout',
        severity: 'high',
        message: `Login brute-force lockout triggered for ${norm} from IP ${ip}. Locked for ${lockoutMinutes} minutes.`,
        ip_address: ip,
        user_agent: userAgent,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });
    }

    await record.save();
  }

  // Log authentication failure
  await SecurityEvent.create({
    event_type: 'auth_failed',
    severity: 'medium',
    message: `Failed authentication attempt for ${norm} from IP ${ip} (attempt ${record.attempts_count}/${MAX_ATTEMPTS})`,
    ip_address: ip,
    user_agent: userAgent,
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });
};

/**
 * Clear failed attempts record on successful authentication.
 */
export const resetAttempts = async (ip, identifier) => {
  const norm = identifier.trim().toLowerCase();
  await LoginAttempt.deleteOne({ ip_address: ip, identifier: norm });
};
