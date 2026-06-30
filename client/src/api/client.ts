import type { Appointment, Conversation, Listing, Message, User } from '../types';
import { formatValidationIssues } from '../utils/validation';

const serverUrl = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

export const API_BASE = `${serverUrl}/api`;

export type AuthResponse = {
  token: string;
  user: User;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const validationMessage = Array.isArray(body.issues) ? formatValidationIssues(body.issues) : '';
    throw new Error(body.error ?? body.message ?? validationMessage ?? 'Request failed');
  }

  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function register(payload: { name: string; email: string; password: string; role: 'TENANT' | 'OWNER'; university: string; phone?: string }) {
  return request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function me(token: string) {
  return request<{ user: User }>('/auth/me', {}, token);
}

export async function fetchListings(params: Record<string, string | number | boolean | undefined>, token?: string | null) {
  const url = new URL(`${API_BASE}/listings`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  });
  const response = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!response.ok) throw new Error('Failed to load listings');
  return response.json() as Promise<{ listings: Listing[] }>;
}

export async function fetchListing(id: string, token?: string | null) {
  return request<{ listing: Listing }>(`/listings/${id}`, {}, token);
}

export async function createListing(payload: Record<string, unknown>, token: string) {
  return request<{ listing: Listing }>('/listings', { method: 'POST', body: JSON.stringify(payload) }, token);
}

export async function updateListing(id: string, payload: Record<string, unknown>, token: string) {
  return request<{ listing: Listing }>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token);
}

export async function uploadListingImages(id: string, files: File[], token: string) {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));
  const response = await fetch(`${API_BASE}/listings/${id}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const validationMessage = Array.isArray(body.issues) ? formatValidationIssues(body.issues) : '';
    throw new Error(body.error ?? body.message ?? validationMessage ?? 'Upload failed');
  }
  return response.json();
}

export async function fetchFavorites(token: string) {
  return request<{ favorites: Array<{ id: string; listing: Listing }> }>('/favorites', {}, token);
}

export async function addFavorite(listingId: string, token: string) {
  return request(`/favorites/${listingId}`, { method: 'POST' }, token);
}

export async function removeFavorite(listingId: string, token: string) {
  return request(`/favorites/${listingId}`, { method: 'DELETE' }, token);
}

export async function fetchConversations(token: string) {
  return request<{ conversations: Conversation[] }>('/conversations', {}, token);
}

export async function createConversation(listingId: string, token: string, tenantId?: string) {
  return request<{ conversation: Conversation }>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ listingId, tenantId })
  }, token);
}

export async function fetchMessages(conversationId: string, token: string) {
  return request<{ conversation: Conversation; messages: Message[] }>(`/conversations/${conversationId}/messages`, {}, token);
}

export async function postMessage(conversationId: string, body: string, token: string) {
  return request<{ message: Message }>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body })
  }, token);
}

export async function fetchAppointments(token: string) {
  return request<{ appointments: Appointment[] }>('/appointments', {}, token);
}

export async function createAppointment(payload: { listingId: string; scheduledAt: string; note?: string }, token: string) {
  return request<{ appointment: Appointment }>('/appointments', { method: 'POST', body: JSON.stringify(payload) }, token);
}

export async function patchAppointmentStatus(id: string, status: string, token: string) {
  return request<{ appointment: Appointment }>(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }, token);
}
