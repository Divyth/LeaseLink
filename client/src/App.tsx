import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { useAuth } from './auth/AuthContext';
import { LoadingState } from './components/LoadingState';

const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const ListingsPage = lazy(() => import('./pages/ListingsPage').then((module) => ({ default: module.ListingsPage })));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage').then((module) => ({ default: module.ListingDetailPage })));
const TenantDashboardPage = lazy(() => import('./pages/TenantDashboardPage').then((module) => ({ default: module.TenantDashboardPage })));
const OwnerDashboardPage = lazy(() => import('./pages/OwnerDashboardPage').then((module) => ({ default: module.OwnerDashboardPage })));
const InboxPage = lazy(() => import('./pages/InboxPage').then((module) => ({ default: module.InboxPage })));
const ListingFormPage = lazy(() => import('./pages/ListingFormPage').then((module) => ({ default: module.ListingFormPage })));

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8"><LoadingState /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ role, children }: { role: 'TENANT' | 'OWNER'; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role && user.role !== 'ADMIN') return <Navigate to="/listings" replace />;
  return <>{children}</>;
}

export function App() {
  const { loading } = useAuth();
  if (loading) return <div className="p-8"><LoadingState /></div>;
  return (
    <Layout>
      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><LoadingState /></div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/new" element={<Protected><RoleRoute role="OWNER"><ListingFormPage /></RoleRoute></Protected>} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/listings/:id/edit" element={<Protected><RoleRoute role="OWNER"><ListingFormPage /></RoleRoute></Protected>} />
          <Route path="/tenant" element={<Protected><TenantDashboardPage /></Protected>} />
          <Route path="/owner" element={<Protected><RoleRoute role="OWNER"><OwnerDashboardPage /></RoleRoute></Protected>} />
          <Route path="/inbox" element={<Protected><InboxPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
