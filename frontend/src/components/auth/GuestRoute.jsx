// GuestRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const GuestRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return null; // No spinner, no skeleton, just return nothing
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace state={{ from: location.pathname }} />
  ) : (
    <Outlet />
  );
};

export default GuestRoute;