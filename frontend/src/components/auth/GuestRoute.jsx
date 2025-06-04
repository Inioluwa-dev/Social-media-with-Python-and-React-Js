// GuestRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const GuestRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true" />
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace state={{ from: location.pathname }} />
  ) : (
    <Outlet />
  );
};

export default GuestRoute;