import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const PrivateRoute = ({ roles = [], ...rest }) => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const location = useLocation();
    
    if (!isAuthenticated) {
        // Redirect to login with current location to return after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Optional: Role-based access control
    if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
        // Redirect to 404 with access denied message
        return <Navigate to="/404" state={{ 
            from: location.pathname,
            error: 'You do not have permission to access this page',
            isAuthenticated: true
        }} replace />;
    }

    return <Outlet {...rest} />;
};

export default PrivateRoute;