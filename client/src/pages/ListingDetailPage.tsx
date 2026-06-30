import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { addFavorite, createAppointment, createConversation, fetchListing, removeFavorite } from '../api/client';
import type { Listing } from '../types';
import { useAuth } from '../auth/AuthContext';
import { LoadingState } from '../components/LoadingState';
import { money, dateLabel } from '../utils/format';
import { MapPanel } from '../components/MapPanel';
import { listingPlaceholder } from '../utils/placeholders';

export function ListingDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const result = await fetchListing(id, token);
      setListing(result.listing);
      setLoading(false);
    };
    void load();
  }, [id, token]);

  if (loading || !listing) return <div className="mx-auto max-w-7xl px-4 py-8"><LoadingState /></div>;

  const toggleFavorite = async () => {
    if (!token) return navigate('/login');
    if (listing.isFavorite) {
      await removeFavorite(listing.id, token);
    } else {
      await addFavorite(listing.id, token);
    }
    const refreshed = await fetchListing(listing.id, token);
    setListing(refreshed.listing);
  };

  const messageOwner = async () => {
    if (!token) return navigate('/login');
    const result = await createConversation(listing.id, token);
    navigate(`/inbox?conversation=${result.conversation.id}`);
  };

  const requestVisit = async () => {
    if (!token) return navigate('/login');
    try {
      const result = await createAppointment({ listingId: listing.id, scheduledAt, note }, token);
      navigate(`/tenant?appointment=${result.appointment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not schedule visit');
    }
  };

  const images = listing.images.length ? listing.images : [{ id: 'placeholder', url: listingPlaceholder('FlatBuddy'), filename: 'placeholder', createdAt: '' }];
  const isOwner = user?.id === listing.ownerId;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="card overflow-hidden">
            <img src={images[0].url} alt={listing.title} className="aspect-[16/9] w-full object-cover" />
            <div className="grid grid-cols-4 gap-2 p-3">
              {images.slice(0, 4).map((image) => (
                <img key={image.id} src={image.url} alt={listing.title} className="aspect-square rounded-2xl object-cover" />
              ))}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <p className="mt-2 text-sm text-ink/60">{listing.address}, {listing.city}, {listing.state}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{money(listing.rent)}</div>
                <div className="text-sm text-ink/60">Deposit {money(listing.deposit)}</div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="badge">{listing.bedrooms} bd</span>
              <span className="badge">{listing.bathrooms} ba</span>
              <span className="badge">{listing.areaSqft} sqft</span>
              <span className="badge">{listing.propertyType}</span>
              <span className="badge">{listing.leaseTerm}</span>
              <span className="badge">Available {dateLabel(listing.availableFrom)}</span>
            </div>
            <p className="mt-5 leading-7 text-ink/80">{listing.description}</p>
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.amenities.map((item) => <span key={item} className="badge">{item}</span>)}
              </div>
            </div>
          </div>
          <MapPanel listings={[listing]} />
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold">Owner</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white">
                {listing.owner?.name?.[0] ?? 'O'}
              </div>
              <div>
                <div className="font-semibold">{listing.owner?.name}</div>
                <div className="text-sm text-ink/60">{listing.owner?.university}</div>
                <div className="text-sm text-ink/60">{listing.owner?.email}</div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button className={`btn ${listing.isFavorite ? 'bg-moss text-white' : 'bg-white border border-line'}`} onClick={toggleFavorite}>
                {listing.isFavorite ? 'Saved' : 'Save'}
              </button>
              {!isOwner ? (
                <button className="btn-secondary" onClick={messageOwner}>Message owner</button>
              ) : (
                <Link to={`/listings/${listing.id}/edit`} className="btn-secondary">Edit listing</Link>
              )}
            </div>
          </div>
          {!isOwner && user?.role === 'TENANT' && listing.status === 'ACTIVE' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold">Schedule a visit</h2>
              <p className="mt-2 text-sm text-ink/60">Request a tour directly with the owner.</p>
              <div className="mt-4 space-y-3">
                <input className="field" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                <textarea className="field min-h-28" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about timing, roommates, or move-in questions." />
                {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                <button className="btn-primary w-full" onClick={requestVisit}>Request visit</button>
              </div>
            </div>
          )}
          {!user && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold">Schedule or message</h2>
              <p className="mt-2 text-sm text-ink/60">Create an account to message the owner or request a visit.</p>
              <div className="mt-4 flex gap-3">
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-primary">Register</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
