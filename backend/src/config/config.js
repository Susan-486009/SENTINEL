import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env:  process.env.NODE_ENV   || 'development',
  port: Number(process.env.PORT) || 5000,

  db: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/lasustech_complaints',
  },

  jwt: {
    secret:    process.env.JWT_SECRET     || 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  upload: {
    maxSizeMB:  Number(process.env.MAX_FILE_SIZE_MB) || 5,
    uploadsPath: process.env.UPLOADS_PATH || 'src/uploads',
  },

  complaintRateLimit: {
    maxPerHour:    Number(process.env.MAX_COMPLAINTS_PER_HOUR) || 3,
    windowMinutes: 60,
  },

  ai: {
    groqApiKey: process.env.GROQ_API_KEY,
    groqModel:  process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  },
};
