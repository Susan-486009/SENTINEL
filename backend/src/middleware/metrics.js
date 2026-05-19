import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';
import { TokenSession } from '../models/TokenSession.js';
import { SecurityEvent } from '../models/SecurityEvent.js';
import { LoginAttempt } from '../models/LoginAttempt.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSystemMetrics = asyncHandler(async (req, res) => {
  // Database State
  const dbConnected = mongoose.connection.readyState === 1;
  const dbHost = dbConnected ? mongoose.connection.host : 'disconnected';
  
  // Tallies from MongoDB
  const [
    totalComplaints,
    activeSessions,
    totalSecurityIncidents,
    activeLockouts
  ] = await Promise.all([
    dbConnected ? Complaint.countDocuments() : Promise.resolve(0),
    dbConnected ? TokenSession.countDocuments({ is_revoked: false }) : Promise.resolve(0),
    dbConnected ? SecurityEvent.countDocuments() : Promise.resolve(0),
    dbConnected ? LoginAttempt.countDocuments({ lockout_until: { $gt: new Date() } }) : Promise.resolve(0)
  ]);

  // Process details
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  // Return standard high-fidelity prometheus JSON formatted metrics
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    process: {
      uptimeSeconds,
      memory: {
        rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      },
      nodeVersion: process.version,
      platform: process.platform,
    },
    database: {
      status: dbConnected ? 'healthy' : 'degraded',
      host: dbHost,
      activeConnectionsCount: dbConnected ? (mongoose.connection.db.stats().then(s => s.connections).catch(() => 1)) : 0,
    },
    businessMetrics: {
      totalComplaintsRegistered: totalComplaints,
      activeDeviceSessionsCount: activeSessions,
      lockoutsEnforcedCount: activeLockouts,
      securityEventsLoggedCount: totalSecurityIncidents,
    }
  });
});
