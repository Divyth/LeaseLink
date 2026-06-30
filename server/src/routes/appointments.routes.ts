import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createOne, getAll, patchStatus } from '../controllers/appointments.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/', getAll);
router.post('/', createOne);
router.patch('/:id/status', patchStatus);

export default router;

