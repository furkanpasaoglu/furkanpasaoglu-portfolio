import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMe } from './useAuth';

export default function ProtectedRoute() {
  const { data, isLoading, isError } = useMe();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fp fp-gate">
        <p className="fp-loading">Oturum doğrulanıyor…</p>
      </div>
    );
  }

  if (isError || !data) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
