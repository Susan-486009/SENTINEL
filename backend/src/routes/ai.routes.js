import { Router }     from 'express';
import * as ai         from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public AI routes
router.post('/chat', ai.chat);

// Protected AI routes
router.use(authenticate);
router.post('/analyze', ai.analyzeComplaint);
router.get('/history', ai.getChatHistory);
router.post('/history', ai.saveChatMessage);

export default router;
