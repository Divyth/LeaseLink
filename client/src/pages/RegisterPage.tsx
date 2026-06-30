import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TENANT' as 'TENANT' | 'OWNER',
    university: 'USC',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-ink/60">Choose tenant or owner access. Everything stays local to your machine.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError('');
            try {
              await register(form);
              navigate('/listings');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Registration failed');
            } finally {
              setLoading(false);
            }
          }}
        >
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
          <input className="field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
          <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'TENANT' | 'OWNER' })}>
            <option value="TENANT">Tenant</option>
            <option value="OWNER">Owner</option>
          </select>
          <input className="field" value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="University" />
          <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" />
          {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-sm text-ink/60">
          Already have an account? <Link to="/login" className="font-semibold text-moss">Login</Link>
        </p>
      </div>
    </div>
  );
}

