// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  login as authLogin,
  logout as authLogout,
  refreshToken,
  getCurrentUser,
  isAuthenticated,
  sendVerificationEmail,
  verifyCode,
  completeSignup,
  fetchUserProfile
} from '@utils/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            // Fetch fresh user data
            const profile = await fetchUserProfile();
            setUser(prev => ({ ...prev, ...profile }));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (identifier, password, rememberMe) => {
    try {
      setError(null);
      const response = await authLogin(identifier, password, rememberMe);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      setUser(null);
      navigate('/login');
    }
  };

  const handleSignup = async (userData) => {
    try {
      setError(null);
      const response = await completeSignup(userData);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const handleSendVerificationEmail = async (email) => {
    try {
      setError(null);
      await sendVerificationEmail(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const handleVerifyCode = async (email, code) => {
    try {
      setError(null);
      await verifyCode(email, code);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    error,
    loading,
    login: handleLogin,
    logout: handleLogout,
    signup: handleSignup,
    sendVerificationEmail: handleSendVerificationEmail,
    verifyCode: handleVerifyCode,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
