import type { Request, Response } from 'express';
import path from 'node:path';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isOwner, listListings, getListingById } from '../services/listings.service.js';
import { safeFileExtension, uploadUrl } from '../utils/file.js';
import { env } from '../config/env.js';
import { PropertyType, ListingStatus, Role } from '@prisma/client';
import { campusCenters, type CampusName } from '../config/campuses.js';
import { formatValidationIssues } from '../utils/validation.js';

const campusNames = Object.keys(campusCenters) as CampusName[];
const sortOptions = ['rentAsc', 'rentDesc', 'newest', 'distance'] as const;

const baseListingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
  zip: z.string().min(4),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  rent: z.coerce.number().int().positive(),
  deposit: z.coerce.number().int().nonnegative(),
  bedrooms: z.coerce.number(),
  bathrooms: z.coerce.number(),
  areaSqft: z.coerce.number().int().positive(),
  propertyType: z.nativeEnum(PropertyType),
  leaseTerm: z.string().min(2),
  availableFrom: z.coerce.date(),
  amenities: z.array(z.string().min(1)),
  status: z.nativeEnum(ListingStatus).optional()
});

const createListingSchema = baseListingSchema.extend({
  amenities: z.array(z.string().min(1)).default([]),
  status: z.nativeEnum(ListingStatus).default(ListingStatus.ACTIVE)
});

const updateListingSchema = baseListingSchema.partial();

const listQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  minRent: z.coerce.number().int().nonnegative().optional(),
  maxRent: z.coerce.number().int().nonnegative().optional(),
  city: z.string().trim().min(1).optional(),
  bedrooms: z.coerce.number().optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  amenities: z.string().trim().optional(),
  campus: z.enum(campusNames).optional(),
  maxDistanceMiles: z.coerce.number().positive().optional(),
  sortBy: z.enum(sortOptions).optional(),
  mine: z.enum(['true', 'false']).optional()
});

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.resolve(env.uploadDir)),
    filename: (_req, file, cb) => {
      const stamp = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${stamp}${path.extname(file.originalname).toLowerCase()}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!safeFileExtension(file.originalname)) {
      cb(new Error('Only jpg, jpeg, png, and webp files are allowed'));
      return;
    }
    cb(null, true);
  }
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const parsedResult = listQuerySchema.safeParse(req.query);
  if (!parsedResult.success) {
    res.status(400).json({ error: formatValidationIssues(parsedResult.error.issues) });
    return;
  }
  const parsed = parsedResult.data;
  const filters = {
    q: parsed.q,
    minRent: parsed.minRent,
    maxRent: parsed.maxRent,
    city: parsed.city,
    bedrooms: parsed.bedrooms,
    propertyType: parsed.propertyType,
    amenities: parsed.amenities ? parsed.amenities.split(',').map((x) => x.trim()).filter(Boolean) : undefined,
    campus: parsed.campus,
    maxDistanceMiles: parsed.maxDistanceMiles,
    sortBy: parsed.sortBy,
    mineOnly: parsed.mine === 'true'
  };

  const listings = await listListings(filters, req.user?.id);
  res.json({ listings });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const listing = await getListingById(req.params.id as string, req.user?.id);
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  res.json({ listing });
});

export const createOne = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !isOwner(req.user.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const input = createListingSchema.parse(req.body);
  const listing = await prisma.listing.create({
    data: {
      ...input,
      ownerId: req.user.id
    }
  });
  res.status(201).json({ listing });
});

export const updateOne = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !isOwner(req.user.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const listingId = req.params.id as string;
  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  if (req.user.role !== Role.ADMIN && existing.ownerId !== req.user.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const input = updateListingSchema.parse(req.body);
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: input
  });
  res.json({ listing });
});

export const deleteOne = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !isOwner(req.user.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const listingId = req.params.id as string;
  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  if (req.user.role !== Role.ADMIN && existing.ownerId !== req.user.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const listing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: ListingStatus.PAUSED }
  });
  res.json({ listing });
});

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !isOwner(req.user.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const listingId = req.params.id as string;
  const existing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!existing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  if (req.user.role !== Role.ADMIN && existing.ownerId !== req.user.id) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const images = await prisma.listingImage.createMany({
    data: files.map((file) => ({
      listingId: existing.id,
      filename: file.filename,
      url: uploadUrl(file.filename)
    }))
  });
  res.status(201).json({ count: images.count });
});
