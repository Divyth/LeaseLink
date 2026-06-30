import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { login, me, register } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
const registerSchema = loginSchema.extend({
  name: z.string().min(2),
  role: z.enum(['TENANT', 'OWNER']),
  university: z.string().min(2),
  phone: z.string().optional().or(z.literal(''))
});

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authMiddleware, me);

export default router;

