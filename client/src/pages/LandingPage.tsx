import { Link, useNavigate } from 'react-router-dom';
import { campuses } from '../utils/campuses';
import { useState } from 'react';

const features = [
  ['Proximity search', 'Filter listings by campus and real distance, not guesswork.'],
  ['Verified owner flow', 'Owners manage their own listings and availability.'],
  ['Real-time chat', 'Message and respond instantly with Socket.io.'],
  ['Visit scheduling', 'Request, confirm, decline, or cancel tours from one place.']
];

export function LandingPage() {
  const navigate = useNavigate();
  const [campus, setCampus] = useState('USC');
  const [search, setSearch] = useState('');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="card overflow-hidden border-0 bg-ink text-white shadow-lift">
        <div className="grid gap-8 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
          <div className="space-y-6">
            <span className="badge border-white/20 bg-white/10 text-white/80">Local-first student housing marketplace</span>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">Find student housing near campus without the chaos.</h1>
            <p className="max-w-2xl text-base leading-7 text-white/75">
              Search apartments and rooms, compare distance from campus, chat with owners in real time, and schedule tours without leaving the app.
            </p>
            <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_auto]">
              <select className="field bg-white text-ink" value={campus} onChange={(e) => setCampus(e.target.value)}>
                {campuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input className="field bg-white text-ink" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search city, neighborhood, or housing type" />
              <button
                className="btn-primary bg-clay hover:bg-white hover:text-ink"
                onClick={() => navigate(`/listings?campus=${encodeURIComponent(campus)}${search.trim() ? `&q=${encodeURIComponent(search.trim())}` : ''}`)}
              >
                Search
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary bg-white text-ink hover:bg-sand">Create account</Link>
              <Link to="/listings" className="btn-secondary border-white/20 bg-white/10 text-white hover:bg-white hover:text-ink">Browse listings</Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/8 p-4">
            <div className="rounded-[1.5rem] bg-white/10 p-5">
              <div className="text-sm uppercase tracking-[0.2em] text-white/50">What students get</div>
              <div className="mt-3 text-2xl font-semibold">Faster decisions, fewer dead ends.</div>
            </div>
            {features.map(([title, description]) => (
              <div key={title} className="rounded-[1.5rem] bg-white/10 p-4">
                <div className="font-semibold">{title}</div>
                <div className="mt-2 text-sm text-white/70">{description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map(([title, description]) => (
          <div key={title} className="card p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">{title}</div>
            <p className="mt-3 text-sm leading-6 text-ink/70">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
