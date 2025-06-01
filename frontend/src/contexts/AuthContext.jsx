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
  const [loading, setLoading] = useState(true); // 🔹 New loading state
  const navigate = useNavigate();
  const location = useLocation();

  // Login function called from UI
  const login = async (username, password) => {
    try {
      const response = await loginService(username, password);
      localStorage.setItem('access', response.access);
      localStorage.setItem('refresh', response.refresh);
      setIsAuthenticated(true);
      setUser({ username }); // You can replace this with decoded token or fetched user profile
      setError('');

      // ✅ Redirect to dashboard after login
      navigate('/dashboard', { replace: true });

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

  // Validate token on mount and route change
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access');
      if (token) {
        const valid = await validateToken();
        if (!valid) {
          logout();
        } else {
          setIsAuthenticated(true);
          // You can optionally decode token or fetch user profile here
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false); // ✅ Mark auth check complete
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, error, loading }}
    >
      {!loading && children} {/* ✅ Don't render routes until auth is resolved */}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
