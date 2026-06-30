import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAppointments, fetchConversations, fetchListings, patchAppointmentStatus } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import type { Appointment, Conversation, Listing } from '../types';
import { ListingCard } from '../components/ListingCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';

export function OwnerDashboardPage() {
  const { token } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    const [l, c, a] = await Promise.all([
      fetchListings({ mine: true }, token),
      fetchConversations(token),
      fetchAppointments(token)
    ]);
    setListings(l.listings);
    setConversations(c.conversations);
    setAppointments(a.appointments);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [token]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8"><LoadingState /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Owner dashboard</h1>
          <p className="mt-2 text-sm text-ink/60">Manage listings, conversations, and tour requests.</p>
        </div>
        <Link to="/listings/new" className="btn-primary">Create listing</Link>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <h2 className="text-lg font-semibold">My listings</h2>
          {listings.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {listings.map((listing) => (
                <div key={listing.id} className="space-y-3">
                  <ListingCard listing={listing} />
                  <div className="flex gap-2">
                    <Link to={`/listings/${listing.id}`} className="btn-secondary">View</Link>
                    <Link to={`/listings/${listing.id}/edit`} className="btn-primary">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No listings yet" description="Create your first listing to start receiving messages and appointment requests." action={<Link to="/listings/new" className="btn-primary">Create listing</Link>} />
          )}
        </section>
        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-lg font-semibold">Incoming messages</h2>
            <div className="mt-4 space-y-3">
              {conversations.map((conversation) => (
                <Link key={conversation.id} to={`/inbox?conversation=${conversation.id}`} className="block rounded-2xl border border-line p-4 hover:border-ink">
                  <div className="font-semibold">{conversation.tenant.name}</div>
                  <div className="text-sm text-ink/60">{conversation.listing.title}</div>
                </Link>
              ))}
              {!conversations.length && <div className="text-sm text-ink/60">No conversations yet.</div>}
            </div>
          </section>
          <section className="card p-5">
            <h2 className="text-lg font-semibold">Appointment requests</h2>
            <div className="mt-4 space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-line p-4">
                  <div className="font-semibold">{appointment.listing.title}</div>
                  <div className="text-sm text-ink/60">{appointment.tenant.name}</div>
                  <div className="text-sm text-ink/60">{new Date(appointment.scheduledAt).toLocaleString()}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="badge">{appointment.status}</span>
                    {appointment.status === 'REQUESTED' && (
                      <>
                        <button className="btn-secondary" onClick={async () => { if (token) { await patchAppointmentStatus(appointment.id, 'CONFIRMED', token); await load(); } }}>Confirm</button>
                        <button className="btn-secondary" onClick={async () => { if (token) { await patchAppointmentStatus(appointment.id, 'DECLINED', token); await load(); } }}>Decline</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!appointments.length && <div className="text-sm text-ink/60">No appointment requests yet.</div>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
