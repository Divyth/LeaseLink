import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createListing, fetchListing, updateListing, uploadListingImages } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { LoadingState } from '../components/LoadingState';
import type { Listing } from '../types';
import { money } from '../utils/format';
import { z } from 'zod';
import { formatValidationIssues } from '../utils/validation';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().length(2),
  zip: z.string().min(4),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  rent: z.coerce.number().positive(),
  deposit: z.coerce.number().nonnegative(),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  areaSqft: z.coerce.number().positive(),
  propertyType: z.enum(['APARTMENT', 'ROOM', 'STUDIO', 'SHARED']),
  leaseTerm: z.string().min(2),
  availableFrom: z.string().min(1),
  amenities: z.array(z.string().min(1)),
  status: z.enum(['ACTIVE', 'PAUSED', 'RENTED'])
});

const empty = {
  title: '',
  description: '',
  address: '',
  city: '',
  state: 'CA',
  zip: '',
  latitude: '',
  longitude: '',
  rent: '',
  deposit: '',
  bedrooms: '',
  bathrooms: '',
  areaSqft: '',
  propertyType: 'APARTMENT',
  leaseTerm: '',
  availableFrom: '',
  amenities: '',
  status: 'ACTIVE'
};

const inputTypes: Record<string, string> = {
  title: 'text',
  address: 'text',
  city: 'text',
  state: 'text',
  zip: 'text',
  latitude: 'number',
  longitude: 'number',
  rent: 'number',
  deposit: 'number',
  bedrooms: 'number',
  bathrooms: 'number',
  areaSqft: 'number',
  leaseTerm: 'text',
  availableFrom: 'date'
};

const fieldLabels: Record<string, string> = {
  title: 'Title',
  address: 'Street address',
  city: 'City',
  state: 'State',
  zip: 'ZIP code',
  latitude: 'Latitude',
  longitude: 'Longitude',
  rent: 'Monthly rent',
  deposit: 'Deposit',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  areaSqft: 'Area (sqft)',
  leaseTerm: 'Lease term',
  availableFrom: 'Available from',
  propertyType: 'Property type',
  status: 'Status'
};

export function ListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState(empty);
  const [existing, setExisting] = useState<Listing | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    const load = async () => {
      if (!id || !token) return;
      const result = await fetchListing(id, token);
      setExisting(result.listing);
      const listing = result.listing;
      setForm({
        title: listing.title,
        description: listing.description,
        address: listing.address,
        city: listing.city,
        state: listing.state,
        zip: listing.zip,
        latitude: String(listing.latitude),
        longitude: String(listing.longitude),
        rent: String(listing.rent),
        deposit: String(listing.deposit),
        bedrooms: String(listing.bedrooms),
        bathrooms: String(listing.bathrooms),
        areaSqft: String(listing.areaSqft),
        propertyType: listing.propertyType,
        leaseTerm: listing.leaseTerm,
        availableFrom: listing.availableFrom.slice(0, 10),
        amenities: listing.amenities.join(', '),
        status: listing.status
      });
      setLoading(false);
    };
    void load();
  }, [id, token]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><LoadingState /></div>;

  const preview = {
    title: form.title || 'Listing preview',
    city: form.city || 'City',
    rent: Number(form.rent || 0),
    address: form.address || 'Address preview',
    bedrooms: Number(form.bedrooms || 0),
    bathrooms: Number(form.bathrooms || 0),
    areaSqft: Number(form.areaSqft || 0),
    propertyType: form.propertyType
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form
        className="card space-y-4 p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!token) return;
          setError('');
          try {
            const candidate = {
              title: form.title,
              description: form.description,
              address: form.address,
              city: form.city,
              state: form.state,
              zip: form.zip,
              latitude: Number(form.latitude),
              longitude: Number(form.longitude),
              rent: Number(form.rent),
              deposit: Number(form.deposit),
              bedrooms: Number(form.bedrooms),
              bathrooms: Number(form.bathrooms),
              areaSqft: Number(form.areaSqft),
              propertyType: form.propertyType,
              leaseTerm: form.leaseTerm,
              availableFrom: form.availableFrom,
              amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
              status: form.status
            };
            const parsed = schema.safeParse(candidate);
            if (!parsed.success) {
              setError(formatValidationIssues(parsed.error.issues));
              return;
            }
            const payload = parsed.data;
            const result = existing ? await updateListing(existing.id, payload, token) : await createListing(payload, token);
            if (files.length) await uploadListingImages(result.listing.id, files, token);
            navigate(`/listings/${result.listing.id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save listing');
          }
        }}
      >
        <div>
          <h1 className="text-3xl font-bold">{existing ? 'Edit listing' : 'Create listing'}</h1>
          <p className="mt-2 text-sm text-ink/60">Fill in the real address and coordinates so distance filtering works.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(form).map(([key, value]) => {
            if (key === 'description' || key === 'amenities') return null;
            if (key === 'status') {
              return (
                <label key={key} className="text-sm">
                  <span className="mb-2 block font-semibold">{fieldLabels[key]}</span>
                  <select className="field" value={value} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="RENTED">Rented</option>
                  </select>
                </label>
              );
            }
            if (key === 'latitude' || key === 'longitude' || key === 'rent' || key === 'deposit' || key === 'bedrooms' || key === 'bathrooms' || key === 'areaSqft') {
              return (
                <label key={key} className="text-sm">
                  <span className="mb-2 block font-semibold">{fieldLabels[key] ?? key}</span>
                  <input className="field" type="number" step={key === 'latitude' || key === 'longitude' ? '0.000001' : '1'} value={value} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                </label>
              );
            }
            if (key === 'propertyType') {
              return (
                <label key={key} className="text-sm">
                  <span className="mb-2 block font-semibold">{fieldLabels[key]}</span>
                  <select className="field" value={value} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
                    <option value="APARTMENT">Apartment</option>
                    <option value="ROOM">Room</option>
                    <option value="STUDIO">Studio</option>
                    <option value="SHARED">Shared</option>
                  </select>
                </label>
              );
            }
            if (key === 'availableFrom') {
              return (
                <label key={key} className="text-sm">
                  <span className="mb-2 block font-semibold">{fieldLabels[key]}</span>
                  <input className="field" type="date" value={value} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
                </label>
              );
            }
            return (
              <label key={key} className="text-sm">
                <span className="mb-2 block font-semibold">{fieldLabels[key] ?? key}</span>
                <input className="field" type={inputTypes[key] ?? 'text'} value={value} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </label>
            );
          })}
        </div>
        <label className="block text-sm">
          <span className="mb-2 block font-semibold">Description</span>
          <textarea className="field min-h-40" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block font-semibold">Amenities</span>
          <input className="field" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="WiFi, Laundry, AC" />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block font-semibold">Images</span>
          <input className="field" type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </label>
        {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <button className="btn-primary" type="submit">{existing ? 'Save changes' : 'Create listing'}</button>
      </form>
      <aside className="card p-6">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">Preview</div>
        <div className="mt-4 overflow-hidden rounded-3xl border border-line">
          <div className="aspect-[4/3] bg-sand" />
          <div className="space-y-3 p-5">
            <div className="text-xl font-semibold">{preview.title}</div>
            <div className="text-sm text-ink/60">{preview.address}, {preview.city}</div>
            <div className="text-lg font-bold">{money(preview.rent || 0)}</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="badge">{preview.bedrooms} bd</span>
              <span className="badge">{preview.bathrooms} ba</span>
              <span className="badge">{preview.areaSqft} sqft</span>
              <span className="badge">{preview.propertyType}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
