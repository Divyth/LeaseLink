import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function listAppointments(userId: string) {
  return prisma.appointment.findMany({
    where: {
      OR: [{ tenantId: userId }, { ownerId: userId }]
    },
    include: {
      listing: { include: { images: true } },
      tenant: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } },
      owner: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } }
    },
    orderBy: { scheduledAt: 'asc' }
  });
}

export async function createAppointment(input: {
  listingId: string;
  tenantId: string;
  scheduledAt: Date;
  note?: string | null;
}) {
  const listing = await prisma.listing.findUnique({ where: { id: input.listingId } });
  if (!listing) throw new Error('Listing not found');
  if (listing.status !== 'ACTIVE') throw new Error('Listing is not active');

  return prisma.appointment.create({
    data: {
      listingId: input.listingId,
      tenantId: input.tenantId,
      ownerId: listing.ownerId,
      scheduledAt: input.scheduledAt,
      note: input.note ?? null
    },
    include: {
      listing: { include: { images: true } },
      tenant: { select: { id: true, name: true, email: true, avatarUrl: true } },
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } }
    }
  });
}

export async function updateAppointmentStatus(params: {
  appointmentId: string;
  userId: string;
  nextStatus: AppointmentStatus;
}) {
  const appointment = await prisma.appointment.findUnique({ where: { id: params.appointmentId } });
  if (!appointment) throw new Error('Appointment not found');

  const isOwner = appointment.ownerId === params.userId;
  const isTenant = appointment.tenantId === params.userId;
  if (!isOwner && !isTenant) throw new Error('Forbidden');

  if (params.nextStatus === AppointmentStatus.CANCELLED) {
    if (!isTenant) throw new Error('Only tenant can cancel');
  } else if (!isOwner) {
    throw new Error('Only owner can confirm or decline');
  }

  if (appointment.status === AppointmentStatus.CANCELLED && params.nextStatus !== AppointmentStatus.CANCELLED) {
    throw new Error('Cancelled appointments cannot be reopened');
  }

  return prisma.appointment.update({
    where: { id: params.appointmentId },
    data: { status: params.nextStatus },
    include: {
      listing: { include: { images: true } },
      tenant: { select: { id: true, name: true, email: true, avatarUrl: true } },
      owner: { select: { id: true, name: true, email: true, avatarUrl: true } }
    }
  });
}

