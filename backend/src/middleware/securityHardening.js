/**
 * securityHardening.js — Enterprise-grade Security Hardening Middleware Suite
 */

import { SecurityEvent } from '../models/SecurityEvent.js';
import { logStructured } from '../utils/catastrophicLogger.js';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
  'https://lasustech.edu.ng'
];

/**
 * Strips MongoDB operator keys starting with '$' recursively to block NoSQL injection vectors.
 */
export const nosqlInjectionSanitizer = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          const ip = req.ip || 'unknown';
          logStructured({
            level: 'WARN',
            message: `Blocked NoSQL injection attempt: key ${key} removed from payload from IP ${ip}`,
            metadata: { key }
          });
          
          SecurityEvent.create({
            event_type: 'xss_blocked', // general security block
            severity: 'high',
            message: `Blocked NoSQL Injection attempt: removed payload key ${key}`,
            ip_address: ip,
            request_path: req.originalUrl,
            expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          }).catch(err => console.error('Failed to log security incident:', err));
          
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

/**
 * Validates CORS origins and headers against strict whitelist boundaries.
 */
export const originValidator = (req, res, next) => {
  const origin = req.headers.origin;
  const ip = req.ip || 'unknown';
  
  if (origin) {
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
    if (!isAllowed) {
      logStructured({
        level: 'WARN',
        message: `Blocked request from unauthorized origin: ${origin} from IP ${ip}`
      });
      
      SecurityEvent.create({
        event_type: 'csrf_attempt',
        severity: 'high',
        message: `Blocked request from unauthorized origin: ${origin}`,
        ip_address: ip,
        request_path: req.originalUrl,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      }).catch(err => console.error('Failed to log CSRF attempt:', err));
      
      return res.status(403).json({
        success: false,
        message: 'Security breach: Request origin not permitted.'
      });
    }
  }
  next();
};

/**
 * Enforces strict Content Security Policy (CSP) and HTTP security headers.
 */
export const secureHeaders = (req, res, next) => {
  // Strict CSP
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' http://localhost:5000 https://api.groq.com; frame-ancestors 'none'; object-src 'none';"
  );
  
  // Anti-Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Defeat MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enforce browser-level XSS protection block
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer boundaries
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Strict transport security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

/**
 * Blocks duplicate parameter pollution to secure query structures.
 */
export const parameterPollutionGuard = (req, res, next) => {
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        // Retain only the last element to prevent type confusion crashes
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  next();
};
