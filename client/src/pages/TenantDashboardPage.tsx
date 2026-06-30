import { useEffect, useState } from 'react';
import { fetchAppointments, fetchFavorites, fetchConversations } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { Appointment, Conversation, Listing } from '../types';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ListingCard } from '../components/ListingCard';
import { Link } from 'react-router-dom';

export function TenantDashboardPage() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<Array<{ id: string; listing: Listing }>>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const [f, c, a] = await Promise.all([fetchFavorites(token), fetchConversations(token), fetchAppointments(token)]);
      setFavorites(f.favorites);
      setConversations(c.conversations);
      setAppointments(a.appointments);
      setLoading(false);
    };
    void load();
  }, [token]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8"><LoadingState /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Tenant dashboard</h1>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Saved listings</h2>
          {favorites.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map((favorite) => <ListingCard key={favorite.id} listing={{ ...favorite.listing, isFavorite: true }} />)}
            </div>
          ) : <EmptyState title="No saved listings yet" description="Save listings from the browse page to keep track of them here." action={<Link to="/listings" className="btn-primary">Browse listings</Link>} />}
        </section>
        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <div className="mt-4 space-y-3">
              {conversations.map((conversation) => (
                <Link key={conversation.id} to={`/inbox?conversation=${conversation.id}`} className="block rounded-2xl border border-line p-4 hover:border-ink">
                  <div className="font-semibold">{conversation.listing.title}</div>
                  <div className="text-sm text-ink/60">{conversation.owner.name}</div>
                </Link>
              ))}
              {!conversations.length && <div className="text-sm text-ink/60">No active conversations.</div>}
            </div>
          </section>
          <section className="card p-5">
            <h2 className="text-lg font-semibold">Visit requests</h2>
            <div className="mt-4 space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-line p-4">
                  <div className="font-semibold">{appointment.listing.title}</div>
                  <div className="text-sm text-ink/60">{new Date(appointment.scheduledAt).toLocaleString()}</div>
                  <div className="mt-2 badge">{appointment.status}</div>
                </div>
              ))}
              {!appointments.length && <div className="text-sm text-ink/60">No appointments yet.</div>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
