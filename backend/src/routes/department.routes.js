import { Router } from 'express';
import * as department from '../controllers/department.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

// Publicly list departments (for student submission categories)
router.get('/', department.getAllDepartments);

// Admin only CRUD
router.post('/', authorize('admin'), department.createDepartment);
router.patch('/:id', authorize('admin'), department.updateDepartment);
router.delete('/:id', authorize('admin'), department.deleteDepartment);

export default router;
