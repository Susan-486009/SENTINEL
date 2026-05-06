/**
 * file.service.js — File Processing & Storage
 *
 * Handles post-upload Sharp compression, DB record creation,
 * file deletion, and serving metadata.
 *
 * Sharp pipeline:
 *   raw upload  →  resize (max 800 px wide)  →  jpeg or webp  →  compressed/
 *   original deleted after successful compression.
 *
 * DB table: complaint_files
 *   id | complaint_id | filename | original_name | mime_type |
 *   size_bytes | width | height | created_at
 */

import sharp   from 'sharp';
import path    from 'path';
import fs      from 'fs/promises';
import crypto  from 'crypto';
import { query, queryOne } from '../config/db.js';
import { AppError }        from '../utils/response.js';
import { config }          from '../config/config.js';

/* ─── Directory paths ──────────────────────────────────── */
const BASE_DIR       = config.upload.uploadsPath;          // src/uploads
const COMPRESSED_DIR = path.join(BASE_DIR, 'compressed');  // src/uploads/compressed
const RAW_DIR        = path.join(BASE_DIR, 'raw');         // src/uploads/raw

/* ─── Sharp config constants ───────────────────────────── */
const IMAGE_MIMES    = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_WIDTH      = 800;   // px — resize images to this width max
const JPEG_QUALITY   = 82;    // 1-100, good balance of size/quality
const WEBP_QUALITY   = 80;

/* ─── Ensure output dir exists ─────────────────────────── */
await fs.mkdir(COMPRESSED_DIR, { recursive: true }).catch(() => {});

/* ════════════════════════════════════════════════════════

   compressImage(filePath, outputFormat)

   Runs the Sharp pipeline on one image file:
     1. Decode the raw image
     2. Resize (shrink only — never upscale) to MAX_WIDTH
     3. Convert to jpeg or webp
     4. Save to COMPRESSED_DIR
     5. Delete the original raw file
     6. Return metadata { path, filename, width, height, sizeBytes }

════════════════════════════════════════════════════════ */
const compressImage = async (rawFilePath, outputFormat = 'jpeg') => {
  const useWebp  = outputFormat === 'webp';
  const ext      = useWebp ? '.webp' : '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const outPath  = path.join(COMPRESSED_DIR, filename);

  const pipeline = sharp(rawFilePath)
    .rotate()                              // auto-orient from EXIF
    .resize({
      width:              MAX_WIDTH,
      withoutEnlargement: true,            // never upscale smaller images
      fit:                'inside',        // preserve aspect ratio
    });

  let meta;
  if (useWebp) {
    meta = await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(outPath);
  } else {
    meta = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(outPath);
  }

  // Remove the raw original only after compressed file is confirmed saved
  try {
    await fs.unlink(rawFilePath);
  } catch (unlinkErr) {
    // Non-fatal — log but don't fail the whole operation
    console.warn(`⚠️  Could not delete raw file ${rawFilePath}: ${unlinkErr.message}`);
  }

  return {
    filename,
    path:      outPath,
    width:     meta.width,
    height:    meta.height,
    sizeBytes: meta.size,
    format:    meta.format,
  };
};

/* ════════════════════════════════════════════════════════

   processAndStore(files, complaintId, db?)
   Core function: process every uploaded file and INSERT into DB.

   - Images   → compress with Sharp → store compressed path
   - Non-images (PDF, DOCX) → move from raw/ to compressed/ unchanged
   - Returns array of DB-inserted file records

════════════════════════════════════════════════════════ */
export const processAndStore = async (files, complaintId, dbConn = null) => {
  if (!files || files.length === 0) return [];

  const dbQuery = dbConn
    ? dbConn.query.bind(dbConn)   // use transaction connection if provided
    : query;                      // otherwise use pool

  const results = [];

  for (const file of files) {
    const rawPath    = file.path;
    const isImage    = IMAGE_MIMES.has(file.mimetype);
    const outputFmt  = file.mimetype === 'image/webp' ? 'webp' : 'jpeg';

    let storedFilename, storedPath, width, height, sizeBytes, mimeType;

    if (isImage) {
      /* ── Compress with Sharp ── */
      try {
        const compressed = await compressImage(rawPath, outputFmt);
        storedFilename = compressed.filename;
        storedPath     = compressed.path;
        width          = compressed.width;
        height         = compressed.height;
        sizeBytes      = compressed.sizeBytes;
        mimeType       = outputFmt === 'webp' ? 'image/webp' : 'image/jpeg';
      } catch (sharpErr) {
        // If Sharp fails, clean up raw file and rethrow
        await fs.unlink(rawPath).catch(() => {});
        throw new AppError(
          `Failed to process image "${file.originalname}": ${sharpErr.message}`,
          500,
        );
      }
    } else {
      /* ── Non-image: move raw to compressed/ unchanged ── */
      const destFilename = file.filename;
      const destPath     = path.join(COMPRESSED_DIR, destFilename);

      try {
        await fs.rename(rawPath, destPath);
      } catch {
        // rename fails across different drives — fall back to copy + delete
        await fs.copyFile(rawPath, destPath);
        await fs.unlink(rawPath).catch(() => {});
      }

      const stat     = await fs.stat(destPath);
      storedFilename = destFilename;
      storedPath     = destPath;
      width          = null;
      height         = null;
      sizeBytes      = stat.size;
      mimeType       = file.mimetype;
    }

    /* ── INSERT into complaint_files ── */
    const insertResult = await dbQuery(
      `INSERT INTO complaint_files
         (complaint_id, filename, original_name, mime_type, size_bytes, width, height)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [complaintId, storedFilename, file.originalname, mimeType, sizeBytes, width, height],
    );

    results.push({
      id:           insertResult.insertId,
      complaintId,
      filename:     storedFilename,
      originalName: file.originalname,
      mimeType,
      sizeBytes,
      width,
      height,
      url:          `/uploads/compressed/${storedFilename}`,
    });
  }

  return results;
};

/* ════════════════════════════════════════════════════════
   getFilesForComplaint(complaintId)
   Retrieve all files attached to a complaint, with public URL.
════════════════════════════════════════════════════════ */
export const getFilesForComplaint = async (complaintId) => {
  const rows = await query(
    `SELECT id, filename, original_name, mime_type, size_bytes, width, height, created_at
     FROM complaint_files
     WHERE complaint_id = ?
     ORDER BY created_at ASC`,
    [complaintId],
  );

  return rows.map((r) => ({
    ...r,
    url: `/uploads/compressed/${r.filename}`,
  }));
};

/* ════════════════════════════════════════════════════════
   deleteFile(fileId, requestingUserId, requestingRole)
   Delete a single evidence file — owner or admin only.
   Removes both the DB record and the physical file.
════════════════════════════════════════════════════════ */
export const deleteFile = async (fileId, requestingUserId, requestingRole) => {
  const file = await queryOne(
    `SELECT cf.*, c.user_id AS complaint_owner_id
     FROM complaint_files cf
     JOIN complaints c ON c.id = cf.complaint_id
     WHERE cf.id = ?`,
    [fileId],
  );

  if (!file) throw new AppError('File not found.', 404);

  if (requestingRole !== 'admin' && file.complaint_owner_id !== requestingUserId) {
    throw new AppError('You do not have permission to delete this file.', 403);
  }

  // Remove physical file (non-fatal if already gone)
  const filePath = path.join(COMPRESSED_DIR, file.filename);
  await fs.unlink(filePath).catch(() => {});

  await query('DELETE FROM complaint_files WHERE id = ?', [fileId]);

  return { deleted: true, fileId };
};

/* ════════════════════════════════════════════════════════
   safeCleanRaw(files)
   Emergency cleanup — call in a catch block after a failed
   operation to remove any raw files multer already saved.
════════════════════════════════════════════════════════ */
export const safeCleanRaw = async (files = []) => {
  await Promise.allSettled(
    files.map((f) => fs.unlink(f.path).catch(() => {})),
  );
};
