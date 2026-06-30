import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchListings, addFavorite, removeFavorite } from '../api/client';
import type { Listing } from '../types';
import { useAuth } from '../auth/AuthContext';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { FilterSidebar, type ListingFilters } from '../components/FilterSidebar';
import { ListingCard } from '../components/ListingCard';
import { MapPanel } from '../components/MapPanel';
import type { CampusName } from '../types';

export function ListingsPage() {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ListingFilters>({
    q: searchParams.get('q') ?? '',
    campus: (searchParams.get('campus') as CampusName | null) ?? undefined,
    city: searchParams.get('city') ?? '',
    sortBy: 'newest'
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchListings({
          q: filters.q,
          campus: filters.campus,
          maxDistanceMiles: filters.maxDistanceMiles,
          minRent: filters.minRent,
          maxRent: filters.maxRent,
          bedrooms: filters.bedrooms,
          city: filters.city,
          propertyType: filters.propertyType || undefined,
          amenities: filters.amenities,
          sortBy: filters.sortBy
        }, token);
        setListings(result.listings);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [filters, token]);

  const toggleFavorite = async (listing: Listing) => {
    if (!token) return;
    if (listing.isFavorite) {
      await removeFavorite(listing.id, token);
    } else {
      await addFavorite(listing.id, token);
    }
    const refreshed = await fetchListings({
      q: filters.q,
      campus: filters.campus,
      maxDistanceMiles: filters.maxDistanceMiles,
      minRent: filters.minRent,
      maxRent: filters.maxRent,
      bedrooms: filters.bedrooms,
      city: filters.city,
      propertyType: filters.propertyType || undefined,
      amenities: filters.amenities,
      sortBy: filters.sortBy
    }, token);
    setListings(refreshed.listings);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Listings</h1>
          <p className="mt-2 text-sm text-ink/60">Search by campus, budget, and commute distance.</p>
        </div>
        {user?.role === 'OWNER' || user?.role === 'ADMIN' ? (
          <Link to="/listings/new" className="btn-primary">Create listing</Link>
        ) : (
          <Link to="/owner" className="btn-secondary">Owner dashboard</Link>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <FilterSidebar filters={filters} setFilters={setFilters} />
        <div className="space-y-6">
          {loading ? <LoadingState /> : error ? <EmptyState title="Could not load listings" description={error} /> : (
            <>
              {listings.length ? (
                <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {listings.map((listing) => <ListingCard key={listing.id} listing={listing} onFavorite={token ? toggleFavorite : undefined} />)}
                </div>
              ) : (
                <EmptyState
                  title="No listings match those filters"
                  description="Try widening the distance, changing campuses, or clearing the rent bounds."
                />
              )}
              <MapPanel listings={listings} campus={filters.campus} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
