import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createOrGetConversation, getUserConversations, listConversationMessages, sendConversationMessage } from '../services/conversations.service.js';

const createSchema = z.object({
  listingId: z.string().min(1),
  tenantId: z.string().min(1).optional()
});

const messageSchema = z.object({
  body: z.string().min(1).max(1000)
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const conversations = await getUserConversations(req.user!.id);
  res.json({ conversations });
});

export const createOne = asyncHandler(async (req: Request, res: Response) => {
  const input = createSchema.parse(req.body);
  const conversation = await createOrGetConversation({
    listingId: input.listingId,
    tenantId: input.tenantId,
    requesterId: req.user!.id
  });
  res.status(201).json({ conversation });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const result = await listConversationMessages(req.params.id as string, req.user!.id);
  res.json(result);
});

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  const input = messageSchema.parse(req.body);
  const message = await sendConversationMessage(req.params.id as string, req.user!.id, input.body);
  res.status(201).json({ message });
});
