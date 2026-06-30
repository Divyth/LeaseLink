import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { formatValidationIssues } from '../utils/validation.js';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err);
  if (err instanceof ZodError) {
    res.status(400).json({ error: formatValidationIssues(err.issues) });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  const normalized = message.toLowerCase();

  if (normalized.includes('forbidden')) {
    res.status(403).json({ error: message });
    return;
  }

  if (normalized.includes('not found')) {
    res.status(404).json({ error: message });
    return;
  }

  if (normalized.includes('invalid credentials')) {
    res.status(401).json({ error: message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: message });
}
