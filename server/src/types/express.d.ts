import type { Role, User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      auth?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export {};

