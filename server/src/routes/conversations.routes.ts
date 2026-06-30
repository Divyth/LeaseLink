import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createMessage, createOne, getAll, getMessages } from '../controllers/conversations.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/', getAll);
router.post('/', createOne);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', createMessage);

export default router;

