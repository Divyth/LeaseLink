import { prisma } from '../config/prisma.js';

export async function getUserConversations(userId: string) {
  return prisma.conversation.findMany({
    where: {
      OR: [{ tenantId: userId }, { ownerId: userId }]
    },
    include: {
      listing: { include: { images: true } },
      tenant: { select: { id: true, name: true, email: true, avatarUrl: true, university: true } },
      owner: { select: { id: true, name: true, email: true, avatarUrl: true, university: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getConversationOrThrow(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: { include: { owner: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } }, images: true } },
      tenant: { select: { id: true, name: true, email: true, avatarUrl: true } },
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } }
    }
  });
  if (!conversation) throw new Error('Conversation not found');
  if (conversation.tenantId !== userId && conversation.ownerId !== userId) throw new Error('Forbidden');
  return conversation;
}

export async function createOrGetConversation(params: {
  listingId: string;
  tenantId?: string;
  requesterId: string;
}) {
  const listing = await prisma.listing.findUnique({ where: { id: params.listingId } });
  if (!listing) throw new Error('Listing not found');

  const tenantId = params.tenantId ?? params.requesterId;
  const ownerId = listing.ownerId;

  if (params.requesterId === ownerId && !params.tenantId) {
    throw new Error('Tenant id is required for owner-initiated conversations');
  }

  if (tenantId !== params.requesterId && ownerId !== params.requesterId) {
    throw new Error('Forbidden');
  }

  const existing = await prisma.conversation.findUnique({
    where: {
      listingId_tenantId_ownerId: {
        listingId: params.listingId,
        tenantId,
        ownerId
      }
    }
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      listingId: params.listingId,
      tenantId,
      ownerId
    }
  });
}

export async function listConversationMessages(conversationId: string, userId: string) {
  const conversation = await getConversationOrThrow(conversationId, userId);
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } }
  });
  return { conversation, messages };
}

export async function sendConversationMessage(conversationId: string, senderId: string, body: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new Error('Conversation not found');
  if (conversation.tenantId !== senderId && conversation.ownerId !== senderId) throw new Error('Forbidden');

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      body
    },
    include: { sender: { select: { id: true, name: true, avatarUrl: true, role: true } } }
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  return message;
}
