/**
 * upload.middleware.js
 *
 * Multer config — saves raw files to src/uploads/raw/
 * Sharp compression happens AFTER upload in the file service.
 *
 * Exports:
 *   uploadFiles   — multer middleware (up to 5 files, field name "files")
 *   uploadSingle  — multer middleware for a single file, field name "file"
 *   handleMulterError — error handler that converts multer errors to AppError
 */

import multer  from 'multer';
import path    from 'path';
import crypto  from 'crypto';
import fs      from 'fs';
import { config }   from '../config/config.js';
import { AppError } from '../utils/response.js';

/* ─── Upload directories ───────────────────────────────── */
const RAW_DIR = path.join(config.upload.uploadsPath, 'raw');

// Create directories synchronously at import time so multer never fails
[config.upload.uploadsPath, RAW_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/* ─── Allowed types ────────────────────────────────────── */
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]);

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.docx']);

/* ─── Storage — raw files land here before Sharp touch them ─ */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RAW_DIR),

  filename: (_req, file, cb) => {
    const random = crypto.randomBytes(12).toString('hex');
    const ext    = path.extname(file.originalname).toLowerCase();
    // Pattern: <timestamp>-<random><ext>  e.g. 1714000000000-a3f8bc.jpg
    cb(null, `${Date.now()}-${random}${ext}`);
  },
});

/* ─── File filter ──────────────────────────────────────── */
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext)) {
    return cb(null, true);
  }

  cb(
    new AppError(
      `File type not allowed. Received: ${file.mimetype} (${ext}). ` +
      `Accepted: jpg, png, webp, pdf, docx`,
      400,
    ),
  );
};

/* ─── Multer instance ──────────────────────────────────── */
const MAX_BYTES = config.upload.maxSizeMB * 1024 * 1024;

const multerInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_BYTES,   // per-file limit
    files:    5,           // max files per request
    fields:   10,          // max non-file fields
  },
});

export const uploadFiles  = multerInstance.array('files', 5);
export const uploadSingle = multerInstance.single('file');

/* ─── Error converter ──────────────────────────────────── */
/**
 * Express error middleware to convert multer-specific errors
 * into consistent AppError responses.
 *
 * Usage: router.post('/upload', uploadFiles, handleMulterError, controller)
 */
export const handleMulterError = (err, _req, _res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return next(
      new AppError(
        `File too large. Maximum allowed size is ${config.upload.maxSizeMB} MB per file.`,
        400,
      ),
    );
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return next(new AppError('Too many files. Maximum 5 files per upload.', 400));
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return next(new AppError(`Unexpected field: "${err.field}". Use field name "files".`, 400));
  }
  // Pass other errors (including AppError from fileFilter) downstream
  next(err);
};

// Legacy default export for backward compatibility
export const upload = multerInstance;
