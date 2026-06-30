import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { formatValidationIssues } from '../utils/validation.js';

export const validateBody = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: formatValidationIssues(parsed.error.issues) });
    return;
  }
  req.body = parsed.data;
  next();
};
