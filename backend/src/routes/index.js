import { Router }       from 'express';
import authRoutes        from './auth.routes.js';
import complaintRoutes   from './complaint.routes.js';
import aiRoutes          from './ai.routes.js';
import mongoose from 'mongoose';

const router = Router();

router.use('/auth',       authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/ai',         aiRoutes);

// Health-check — includes live DB connection state
router.get('/health', (_req, res) =>
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    db:        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  }),
);

export default router;
