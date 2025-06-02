import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const GuestRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace state={location.state} />
  ) : (
    <Outlet key={location.pathname} />
  );
};

export default GuestRoute;