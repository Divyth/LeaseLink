import type { Request, Response } from 'express';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createAppointment, listAppointments, updateAppointmentStatus } from '../services/appointments.service.js';
import { prisma } from '../config/prisma.js';

const createSchema = z.object({
  listingId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  note: z.string().max(1000).optional().or(z.literal(''))
});

const statusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus)
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const appointments = await listAppointments(req.user!.id);
  res.json({ appointments });
});

export const createOne = asyncHandler(async (req: Request, res: Response) => {
  const input = createSchema.parse(req.body);
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
  if (!listing) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }
  if (listing.ownerId === req.user!.id) {
    res.status(400).json({ error: 'Owners cannot request their own listing' });
    return;
  }
  const appointment = await createAppointment({
    listingId: input.listingId,
    tenantId: req.user!.id,
    scheduledAt: input.scheduledAt,
    note: input.note
  });
  res.status(201).json({ appointment });
});

export const patchStatus = asyncHandler(async (req: Request, res: Response) => {
  const input = statusSchema.parse(req.body);
  const appointment = await updateAppointmentStatus({
    appointmentId: req.params.id as string,
    userId: req.user!.id,
    nextStatus: input.status
  });
  res.json({ appointment });
});
