import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { verifyToken } from '../utils/jwt.js';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.auth = { userId: user.id, role: user.role };
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

