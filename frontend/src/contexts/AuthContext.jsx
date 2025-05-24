
import React, { createContext, useState, useEffect } from 'react';
import { login as loginService, logout as logoutService, validateToken } from '@utils/authService';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const login = async (username, password, setLoginError) => {
        try {
            const response = await loginService(username, password, setLoginError);
            localStorage.setItem('token', response.access);
            localStorage.setItem('refresh', response.refresh);
            setIsAuthenticated(true);
            setUser({ username });
            setError('');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            // Error set by loginService
        }
    };

    const logout = () => {
        logoutService();
        setIsAuthenticated(false);
        setUser(null);
        setError('');
        navigate('/login', { replace: true });
    };

    // Validate token on mount and route changes
    useEffect(() => {
        const validate = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const isValid = await validateToken(setError);
                if (!isValid) {
                    logout();
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        };
        validate();
    }, [location.pathname]);

    // Clear state on public routes
    useEffect(() => {
        if (['/login', '/signup', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password')) {
            logoutService();
            setIsAuthenticated(false);
            setUser(null);
            setError('');
        }
    }, [location.pathname]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };
