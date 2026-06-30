import type { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const registerSchema = authSchema.extend({
  name: z.string().min(2),
  role: z.enum(['TENANT', 'OWNER']),
  university: z.string().min(2),
  phone: z.string().trim().optional().or(z.literal(''))
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await registerUser(input);
  const { passwordHash, ...user } = result.user;
  res.status(201).json({ token: result.token, user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = authSchema.parse(req.body);
  const result = await loginUser(input.email, input.password);
  const { passwordHash, ...user } = result.user;
  res.json({ token: result.token, user });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { passwordHash, ...user } = req.user;
  res.json({ user });
});

