import React, { createContext, useState, useEffect } from 'react';
import {
  login as loginService,
  logout as logoutService,
  validateToken,
} from '@utils/authService';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('access'));
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Login function called from UI
  const login = async (username, password) => {
    try {
      const response = await loginService(username, password);
      localStorage.setItem('access', response.access);
      localStorage.setItem('refresh', response.refresh);
      setIsAuthenticated(true);
      setUser({ username });
      setError('');
    } catch (err) {
      setError(err.message);
      throw err; // Rethrow for caller to catch
    }
  };

  const logout = () => {
    logoutService();
    setIsAuthenticated(false);
    setUser(null);
    setError('');
    navigate('/login', { replace: true });
  };

  // Validate token on mount and on route changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access');
      if (token) {
        const valid = await validateToken();
        if (!valid) {
          logout();
        } else {
          setIsAuthenticated(true);
          // Optionally set user info here by decoding token or fetching profile
          // For now, just keep as is or fetch user profile API
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Clear auth state on public routes (login/signup/forgot-password)
  useEffect(() => {
    if (
      ['/login', '/signup', '/forgot-password'].includes(location.pathname) ||
      location.pathname.startsWith('/reset-password')
    ) {
      logoutService();
      setIsAuthenticated(false);
      setUser(null);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
