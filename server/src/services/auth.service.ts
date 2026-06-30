import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { signToken } from '../utils/jwt.js';

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  university: string;
  phone?: string | null;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new Error('Email already in use');
  }
  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role,
      university: input.university,
      phone: input.phone ?? null
    }
  });
  return {
    token: signToken({ userId: user.id, role: user.role }),
    user
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new Error('Invalid credentials');
  }
  return {
    token: signToken({ userId: user.id, role: user.role }),
    user
  };
}

