import sharp   from 'sharp';
import path    from 'path';
import fs      from 'fs/promises';
import crypto  from 'crypto';
import { AppError }        from '../utils/response.js';
import { config }          from '../config/config.js';
import { Complaint }       from '../models/Complaint.js';

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

export const processAndStore = async (files) => {
  if (!files || files.length === 0) return [];

  const results = [];

  for (const file of files) {
    const rawPath    = file.path;
    const isImage    = IMAGE_MIMES.has(file.mimetype);
    const outputFmt  = file.mimetype === 'image/webp' ? 'webp' : 'jpeg';

    let storedFilename, storedPath, width, height, sizeBytes, mimeType;

    if (isImage) {
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

    results.push({
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

export const getFilesForComplaint = async (complaintId) => {
  const complaint = await Complaint.findById(complaintId).select('files').lean();
  return complaint ? complaint.files : [];
};

export const deleteFile = async (fileId, requestingUserId, requestingRole) => {
  // We need to find the complaint that contains this file.
  const complaint = await Complaint.findOne({ 'files._id': fileId }).select('user_id files').lean();

  if (!complaint) throw new AppError('File not found.', 404);

  if (requestingRole !== 'admin' && complaint.user_id?.toString() !== requestingUserId) {
    throw new AppError('You do not have permission to delete this file.', 403);
  }

  const file = complaint.files.find((f) => f._id.toString() === fileId.toString());

  // Remove physical file (non-fatal if already gone)
  const filePath = path.join(COMPRESSED_DIR, file.filename);
  await fs.unlink(filePath).catch(() => {});

  // Remove from DB
  await Complaint.findByIdAndUpdate(complaint._id, {
    $pull: { files: { _id: fileId } }
  });

  return { deleted: true, fileId };
};

export const safeCleanRaw = async (files = []) => {
  await Promise.allSettled(
    files.map((f) => fs.unlink(f.path).catch(() => {})),
  );
};
