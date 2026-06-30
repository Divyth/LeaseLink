import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';
import { sendConversationMessage } from '../services/conversations.service.js';

type SocketUser = {
  userId: string;
  role: string;
};

export function createSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) return next(new Error('Unauthorized'));
      socket.data.user = { userId: user.id, role: user.role } satisfies SocketUser;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('conversation:join', ({ conversationId }: { conversationId: string }) => {
      socket.join(conversationId);
    });

    socket.on('typing:start', ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit('typing:start', { conversationId, userId: socket.data.user.userId });
    });

    socket.on('typing:stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit('typing:stop', { conversationId, userId: socket.data.user.userId });
    });

    socket.on('message:send', async (payload: { conversationId: string; body: string }, ack?: (response: unknown) => void) => {
      try {
        const message = await sendConversationMessage(payload.conversationId, socket.data.user.userId, payload.body);
        io.to(payload.conversationId).emit('message:new', { message });
        ack?.({ ok: true, message });
      } catch (error) {
        ack?.({ ok: false, error: error instanceof Error ? error.message : 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      // Socket.io cleans up room membership automatically.
    });
  });

  return io;
}

