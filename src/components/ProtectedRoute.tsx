import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isAuthReady, checkTokenValidity } = useAuth();

  // Wait for auth bootstrap to finish to prevent false redirects on reload
  if (!isAuthReady) {
    return null; // or a loader
  }

  const isValid = checkTokenValidity();
  if (!isValid && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;