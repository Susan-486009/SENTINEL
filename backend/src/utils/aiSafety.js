/**
 * aiSafety.js — Screen AI prompts against injection, jailbreaks, and sanitize outputs
 */

import { AppError } from './response.js';

const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?instructions/gi,
  /ignore\s+(?:all\s+)?guidelines/gi,
  /system\s+role\s+change/gi,
  /you\s+are\s+now\s+a/gi,
  /developer\s+mode/gi,
  /jailbreak/gi,
  /dan\s+mode/gi,
  /override\s+(?:all\s+)?rules/gi,
  /bypass\s+restrictions/gi,
];

/**
 * Audit input prompt for malicious system override instructions.
 * @param {string} text
 */
export const screenPromptInput = (text) => {
  if (!text) return;
  
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      throw new AppError(
        'Input content validation violation: Malicious instructions detected.',
        400
      );
    }
  }
};

/**
 * Strip Markdown code fences and trailing characters to extract raw JSON objects safely.
 * @param {string} rawString
 * @param {object} defaultObject
 * @returns {object}
 */
export const repairJsonOutput = (rawString, defaultObject = {}) => {
  if (!rawString) return defaultObject;

  let clean = rawString.trim();

  // 1. Remove markdown syntax blocks
  if (clean.includes('```')) {
    clean = clean.replace(/```json/gi, '').replace(/```/g, '').trim();
  }

  // 2. Locate boundaries
  const startIdx = clean.indexOf('{');
  const endIdx = clean.lastIndexOf('}');

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    clean = clean.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(clean);
  } catch (err) {
    // 3. Fallback to repair attempts if simple commas break it
    try {
      // Remove trailing commas inside json object arrays/objects
      const fixed = clean.replace(/,(\s*[\]}])/g, '$1');
      return JSON.parse(fixed);
    } catch (innerErr) {
      console.warn('AI Output failed to parse as valid JSON. Returning safe fallback payload:', clean);
      return defaultObject;
    }
  }
};
