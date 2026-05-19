import mongoose from 'mongoose';
import { config } from './config.js';

/**
 * Connect to MongoDB and return the connection instance.
 * @returns {Promise<mongoose.Connection>}
 */
export const testConnection = async () => {
  try {
    const conn = await mongoose.connect(config.db.uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      maxPoolSize: 50,                // High-performance pooling
      minPoolSize: 5,
      autoIndex: true,                // Automatically build Mongoose indexes on startup
      retryWrites: true,              // Resilient retryable writes
      retryReads: true,
    });
    console.log(`✅ MongoDB connected → ${conn.connection.host}`);
    return conn.connection;
  } catch (err) {
    console.error(`\n⚠️  DATABASE WARNING: ${err.message}`);
    console.error(`👉 Backend is running in RESILIENT MODE. Features requiring database (login, reports) will fail, but the AI Assistant and health checks remain active.\n`);
    return null;
  }
};

/**
 * Disconnect from MongoDB (useful for graceful shutdown or tests).
 */
export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected.');
};

export default mongoose;
