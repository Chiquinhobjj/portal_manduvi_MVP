import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
          <p className="mt-4 text-ui-muted dark:text-dark-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="mb-4 text-4xl font-brand font-bold text-ui-text dark:text-dark-text">
            Acesso Negado
          </h1>
          <p className="text-ui-muted dark:text-dark-muted mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <a
            href="/"
            className="inline-block rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-dark"
          >
            Voltar para Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
