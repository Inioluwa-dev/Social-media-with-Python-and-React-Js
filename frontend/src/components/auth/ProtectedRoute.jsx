import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@contexts/AuthContext';

const PrivateRoute = () => {
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
