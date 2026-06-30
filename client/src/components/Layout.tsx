import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-ink text-white' : 'text-ink/70 hover:bg-white hover:text-ink'}`;

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-hero">
      <header className="sticky top-0 z-40 border-b border-line/60 bg-[rgba(248,245,239,0.82)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-sm font-bold text-white">FB</div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.25em] text-ink/50">FlatBuddy</div>
              <div className="text-xs text-ink/60">Local-first student housing</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/listings" className={navLinkClass}>Listings</NavLink>
            {user?.role === 'TENANT' && <NavLink to="/tenant" className={navLinkClass}>Tenant Dashboard</NavLink>}
            {user?.role === 'OWNER' && <NavLink to="/owner" className={navLinkClass}>Owner Dashboard</NavLink>}
            {user && <NavLink to="/inbox" className={navLinkClass}>Inbox</NavLink>}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-xs text-ink/60">{user.role}</div>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-primary">Create account</Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
