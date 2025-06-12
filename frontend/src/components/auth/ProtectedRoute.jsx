// PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const PrivateRoute = ({ protectedRoutes = [] }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return null; // No spinner, no skeleton, just return nothing
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname, error: 'Please login to access this page' }}
        replace
      />
    );
  }

  // Check if the current route is in protected routes
  const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

  // Only redirect to complete-profile if user has never completed their profile
  // This is determined by checking if profile_completed is false
  if (isProtectedRoute && !user.profile_completed && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // If profile is complete and trying to access complete-profile, redirect to dashboard
  if (user.profile_completed && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
