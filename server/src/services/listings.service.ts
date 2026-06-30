import { ListingStatus, PropertyType, Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { campusCenters, type CampusName } from '../config/campuses.js';
import { haversineMiles } from '../utils/distance.js';

export type ListingFilters = {
  q?: string;
  minRent?: number;
  maxRent?: number;
  city?: string;
  bedrooms?: number;
  propertyType?: PropertyType;
  amenities?: string[];
  campus?: CampusName;
  maxDistanceMiles?: number;
  sortBy?: 'rentAsc' | 'rentDesc' | 'newest' | 'distance';
  mineOnly?: boolean;
};

export async function listListings(filters: ListingFilters, userId?: string) {
  const where: Record<string, unknown> = filters.mineOnly && userId ? { ownerId: userId } : { status: ListingStatus.ACTIVE };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
      { city: { contains: filters.q, mode: 'insensitive' } },
      { address: { contains: filters.q, mode: 'insensitive' } }
    ];
  }

  if (filters.minRent !== undefined || filters.maxRent !== undefined) {
    where.rent = {};
    if (filters.minRent !== undefined) (where.rent as Record<string, number>).gte = filters.minRent;
    if (filters.maxRent !== undefined) (where.rent as Record<string, number>).lte = filters.maxRent;
  }

  if (filters.city) where.city = { equals: filters.city, mode: 'insensitive' };
  if (filters.bedrooms !== undefined) where.bedrooms = filters.bedrooms;
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.amenities?.length) where.amenities = { hasEvery: filters.amenities };

  const listings = await prisma.listing.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true, university: true, phone: true, avatarUrl: true } },
      images: true,
      favorites: userId ? { where: { userId }, select: { id: true } } : false
    }
  });

  const center = filters.campus ? campusCenters[filters.campus] : null;
  const mapped = listings.map((listing) => {
    const distanceMiles = center ? haversineMiles(center, { lat: listing.latitude, lng: listing.longitude }) : null;
    const isFavorite = userId ? listing.favorites.length > 0 : false;
    return { ...listing, distanceMiles, isFavorite };
  }).filter((listing) => {
    if (!center || filters.maxDistanceMiles === undefined) return true;
    return listing.distanceMiles !== null && listing.distanceMiles <= filters.maxDistanceMiles!;
  });

  mapped.sort((a, b) => {
    switch (filters.sortBy) {
      case 'rentAsc':
        return a.rent - b.rent;
      case 'rentDesc':
        return b.rent - a.rent;
      case 'distance':
        return (a.distanceMiles ?? Number.POSITIVE_INFINITY) - (b.distanceMiles ?? Number.POSITIVE_INFINITY);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return mapped;
}

export async function getListingById(id: string, userId?: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, university: true, phone: true, avatarUrl: true } },
      images: true,
      favorites: userId ? { where: { userId }, select: { id: true } } : false,
      appointments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  if (!listing) return null;
  return {
    ...listing,
    isFavorite: userId ? listing.favorites.length > 0 : false
  };
}

export function isOwner(userRole: Role) {
  return userRole === Role.OWNER || userRole === Role.ADMIN;
}
