import { prisma } from '../config/prisma.js';

export async function listFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          images: true,
          owner: { select: { id: true, name: true, email: true, university: true, avatarUrl: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function addFavorite(userId: string, listingId: string) {
  return prisma.favorite.upsert({
    where: {
      userId_listingId: { userId, listingId }
    },
    update: {},
    create: { userId, listingId }
  });
}

export async function removeFavorite(userId: string, listingId: string) {
  return prisma.favorite.deleteMany({ where: { userId, listingId } });
}

