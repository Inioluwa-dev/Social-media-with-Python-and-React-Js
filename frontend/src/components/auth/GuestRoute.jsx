// src/components/auth/GuestRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const GuestRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default GuestRoute;
