// PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="full-page-loader">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
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

  return <Outlet />;
};

export default PrivateRoute;