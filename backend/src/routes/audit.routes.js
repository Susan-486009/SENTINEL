import { Router } from 'express';
import * as audit from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);
router.use(authorize('superadmin'));

router.get('/', audit.getAuditLogs);

export default router;
