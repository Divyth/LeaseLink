import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addFavorite, listFavorites, removeFavorite } from '../services/favorites.service.js';
import { prisma } from '../config/prisma.js';

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const favorites = await listFavorites(req.user!.id);
  res.json({ favorites });
});

export const createOne = asyncHandler(async (req: Request, res: Response) => {
  const listingId = req.params.listingId as string;
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  const favorite = await addFavorite(req.user!.id, listingId);
  res.status(201).json({ favorite });
});

export const deleteOne = asyncHandler(async (req: Request, res: Response) => {
  await removeFavorite(req.user!.id, req.params.listingId as string);
  res.status(204).send();
});
