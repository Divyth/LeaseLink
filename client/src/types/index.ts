export type Role = 'TENANT' | 'OWNER' | 'ADMIN';
export type PropertyType = 'APARTMENT' | 'ROOM' | 'STUDIO' | 'SHARED';
export type ListingStatus = 'ACTIVE' | 'PAUSED' | 'RENTED';
export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED';

export type CampusName = 'USC' | 'UCLA' | 'NYU' | 'Columbia' | 'Boston University';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  university: string;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ListingImage = {
  id: string;
  url: string;
  filename: string;
  createdAt: string;
};

export type Listing = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  propertyType: PropertyType;
  leaseTerm: string;
  availableFrom: string;
  amenities: string[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  images: ListingImage[];
  owner?: User;
  distanceMiles?: number | null;
  isFavorite?: boolean;
};

export type Conversation = {
  id: string;
  listingId: string;
  tenantId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  listing: Listing;
  tenant: User;
  owner: User;
  messages?: Message[];
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
  sender: User;
};

export type Appointment = {
  id: string;
  listingId: string;
  tenantId: string;
  ownerId: string;
  scheduledAt: string;
  note?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  listing: Listing;
  tenant: User;
  owner: User;
};

