import { Router } from 'express';
import * as notification from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', notification.getMyNotifications);
router.patch('/:id/read', notification.markAsRead);
router.patch('/read-all', notification.markAllAsRead);

export default router;
