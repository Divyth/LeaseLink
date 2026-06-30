import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createOne, deleteOne, getAll, getOne, upload, uploadImages, updateOne } from '../controllers/listings.controller.js';

const router = Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authMiddleware, createOne);
router.put('/:id', authMiddleware, updateOne);
router.delete('/:id', authMiddleware, deleteOne);
router.post('/:id/images', authMiddleware, upload.array('images', 10), uploadImages);

export default router;

