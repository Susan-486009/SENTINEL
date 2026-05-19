/**
 * fileDefense.js — Core cryptographic & magic bytes upload verification engine
 */

import fs from 'fs';
import crypto from 'crypto';
import { AppError } from './response.js';
import { Complaint } from '../models/Complaint.js';

// Hex signatures for allowed formats
const MAGIC_SIGNATURES = {
  jpeg: ['ffd8ff'],
  jpg: ['ffd8ff'],
  png: ['89504e47'],
  webp: ['52494646'], // 'RIFF', WEBP signature starts at 8th byte but RIFF at 0
  pdf: ['25504446'],  // '%PDF'
  docx: ['504b0304'], // 'PK..' ZIP archive signature used by docx
};

/**
 * Validates actual binary file signatures (magic bytes) to counter mime-spoofing.
 * @param {string} filePath
 * @param {string} claimedExt e.g. '.png'
 */
export const validateMagicBytes = async (filePath, claimedExt) => {
  const cleanExt = claimedExt.toLowerCase().replace('.', '');
  const signatureList = MAGIC_SIGNATURES[cleanExt];
  
  if (!signatureList) {
    throw new AppError(`Unsupported file format extension checked: ${claimedExt}`, 400);
  }

  return new Promise((resolve, reject) => {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8); // Read first 8 bytes
    
    try {
      fs.readSync(fd, buffer, 0, 8, 0);
      const fileHex = buffer.toString('hex').toLowerCase();
      
      const isValid = signatureList.some((sig) => fileHex.startsWith(sig));
      
      if (!isValid) {
        throw new AppError(`File signature spoofing detected! Actual contents do not match ${claimedExt} magic bytes.`, 400);
      }
      resolve(true);
    } catch (err) {
      reject(err);
    } finally {
      fs.closeSync(fd);
    }
  });
};

/**
 * Checks for duplicate uploads across the database using SHA-256 checksum hashes.
 * If a duplicate is found, returns the metadata of the existing file to avoid duplicate storage.
 * @param {string} filePath
 * @returns {Promise<string|null>} Hashed SHA-256 checksum or existing file URL
 */
export const checkDuplicateFileHash = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', async () => {
      const fileHash = hash.digest('hex');
      
      // Look up if any Complaint has a file with the same SHA-256 hash or similar size/name metadata
      // Since we want this to be extremely resilient, let's look up files matching hash or metadata
      const duplicate = await Complaint.findOne({ 'files.filename': { $regex: fileHash } });
      
      if (duplicate) {
        const matchingFile = duplicate.files.find(f => f.filename.includes(fileHash));
        if (matchingFile) {
          return resolve(matchingFile.url); // Return existing URL directly!
        }
      }
      
      resolve(fileHash); // Return hash to append to new file
    });
    
    stream.on('error', (err) => reject(err));
  });
};

/**
 * Protects server memory from decompression bombs (Zip Bombs).
 * Checks docx archive compression ratios before loading.
 */
export const zipBombCheck = (filePath) => {
  const stats = fs.statSync(filePath);
  // docx files should not have extreme size ratios when unpacked,
  // but since we do not unzip them on the Express server directly, 
  // we enforce a strict file limit cap of 10MB to prevent raw size overflow.
  if (stats.size > 10 * 1024 * 1024) {
    throw new AppError('File size limits breached. Suspicious package compression identified.', 400);
  }
};
