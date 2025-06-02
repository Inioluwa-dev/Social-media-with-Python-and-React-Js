// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import {
  loginService,
  logoutService,
  validateToken,
  fetchUserProfile,
  setTokens,  // import setTokens from authService
} from '@utils/authService';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // On init, check both localStorage and sessionStorage for tokens
  const getStoredToken = () => {
    return localStorage.getItem('access') || sessionStorage.getItem('access');
  };

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStoredToken());
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Login function updated with rememberMe param
  const login = async (username, password, rememberMe = false) => {
    try {
      const data = await loginService(username, password);
      if (!data || !data.access) {
        throw new Error('Login failed: no access token returned');
      }

      // Save tokens with rememberMe flag
      setTokens(data.access, data.refresh, rememberMe);

      // Update state
      setIsAuthenticated(true);
      setError('');
      const profile = await fetchUserProfile();
      setUser(profile);

      // Redirect to previous page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error.message);
      setError(error.message);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Logout clears tokens from both storages
  const logout = async () => {
    try {
      await logoutService();
      setIsAuthenticated(false);
      setUser(null);
      setError('');
      navigate('/login', { replace: true });
    } catch (err) {
      setError('Failed to log out. Please try again.');
      throw new Error('Logout failed');
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = getStoredToken();

      if (token) {
        try {
          const valid = await validateToken();
          if (valid) {
            setIsAuthenticated(true);
            const profile = await fetchUserProfile();
            setUser(profile);
          } else {
            await logout();
          }
        } catch (err) {
          await logout();
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, setUser, login, logout, error, setError, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
