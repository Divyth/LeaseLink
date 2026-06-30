import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createOne, deleteOne, getAll } from '../controllers/favorites.controller.js';

const router = Router();
router.use(authMiddleware);
router.get('/', getAll);
router.post('/:listingId', createOne);
router.delete('/:listingId', deleteOne);

export default router;

