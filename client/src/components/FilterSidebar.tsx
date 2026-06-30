import type { CampusName, PropertyType } from '../types';
import { campuses } from '../utils/campuses';

export type ListingFilters = {
  q?: string;
  campus?: CampusName;
  maxDistanceMiles?: string;
  minRent?: string;
  maxRent?: string;
  bedrooms?: string;
  city?: string;
  propertyType?: PropertyType | '';
  amenities?: string;
  sortBy?: string;
};

export function FilterSidebar({
  filters,
  setFilters
}: {
  filters: ListingFilters;
  setFilters: (next: ListingFilters) => void;
}) {
  const update = (key: keyof ListingFilters, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <aside className="card space-y-4 p-5">
      <div>
        <h3 className="text-base font-semibold">Refine results</h3>
        <p className="mt-1 text-sm text-ink/60">Search by campus, budget, and student-friendly features.</p>
      </div>
      <label className="block text-sm">
        <span className="mb-2 block font-semibold">Search</span>
        <input className="field" value={filters.q ?? ''} onChange={(e) => update('q', e.target.value)} placeholder="Apartment, Westwood, studio" />
      </label>
      <label className="block text-sm">
        <span className="mb-2 block font-semibold">Campus</span>
        <select className="field" value={filters.campus ?? ''} onChange={(e) => update('campus', e.target.value)}>
          <option value="">Any campus</option>
          {campuses.map((campus) => <option key={campus} value={campus}>{campus}</option>)}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-2 block font-semibold">Max distance</span>
        <select className="field" value={filters.maxDistanceMiles ?? ''} onChange={(e) => update('maxDistanceMiles', e.target.value)}>
          <option value="">Any distance</option>
          <option value="1">Within 1 mile</option>
          <option value="3">Within 3 miles</option>
          <option value="5">Within 5 miles</option>
          <option value="10">Within 10 miles</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-2 block font-semibold">City</span>
        <input className="field" value={filters.city ?? ''} onChange={(e) => update('city', e.target.value)} placeholder="Los Angeles" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-2 block font-semibold">Min rent</span>
          <input className="field" value={filters.minRent ?? ''} onChange={(e) => update('minRent', e.target.value)} placeholder="1200" />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block font-semibold">Max rent</span>
          <input className="field" value={filters.maxRent ?? ''} onChange={(e) => update('maxRent', e.target.value)} placeholder="3500" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-2 block font-semibold">Bedrooms</span>
          <input className="field" value={filters.bedrooms ?? ''} onChange={(e) => update('bedrooms', e.target.value)} placeholder="2" />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block font-semibold">Type</span>
          <select className="field" value={filters.propertyType ?? ''} onChange={(e) => update('propertyType', e.target.value)}>
            <option value="">Any</option>
            <option value="APARTMENT">Apartment</option>
            <option value="ROOM">Room</option>
            <option value="STUDIO">Studio</option>
            <option value="SHARED">Shared</option>
          </select>
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-2 block font-semibold">Amenities</span>
        <input className="field" value={filters.amenities ?? ''} onChange={(e) => update('amenities', e.target.value)} placeholder="WiFi,Laundry" />
      </label>
      <label className="block text-sm">
        <span className="mb-2 block font-semibold">Sort by</span>
        <select className="field" value={filters.sortBy ?? 'newest'} onChange={(e) => update('sortBy', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="rentAsc">Rent: low to high</option>
          <option value="rentDesc">Rent: high to low</option>
          <option value="distance">Distance</option>
        </select>
      </label>
    </aside>
  );
}
