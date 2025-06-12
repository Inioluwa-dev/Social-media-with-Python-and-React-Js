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
            // Initialize with basic user data
            setUser({
              ...currentUser,
              // Clear optional fields to prevent persistence
              nickname: null,
              phone: null,
              country: null,
              state: null,
              is_university: false
            });
            
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
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
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
      console.log('AuthContext login response:', response);
      console.log('User data:', JSON.stringify(response.user, null, 2));
      console.log('Profile completed:', response.user.profile_completed);
      setUser(response.user);
      
      // Redirect based on profile completion status
      if (!response.user.profile_completed) {
        console.log('Profile not completed, redirecting to complete profile');
        navigate('/complete-profile', { replace: true });
      } else {
        console.log('Profile completed, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
      
      return response;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
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

  const handleUpdateUser = (updatedUser) => {
    // Ensure we have a valid user object
    if (!updatedUser || typeof updatedUser !== 'object') {
      console.error('Invalid user data received:', updatedUser);
      return;
    }

    // If updatedUser is a function, call it with the current user state
    if (typeof updatedUser === 'function') {
      setUser(prevUser => {
        const newUser = updatedUser(prevUser);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
      });
      return;
    }

    // Update state with new user data
    const newUser = { 
      ...user, 
      ...updatedUser,
      // Ensure optional fields are properly handled
      nickname: updatedUser.nickname ?? null,
      phone: updatedUser.phone ?? null,
      country: updatedUser.country ?? null,
      state: updatedUser.state ?? null,
      is_university: updatedUser.is_university ?? false,
      profile_completed: updatedUser.profile_completed ?? false
    };
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  // Add a new function to handle profile updates
  const handleProfileUpdate = async (profileData) => {
    try {
      setError(null);
      const updatedProfile = await fetchUserProfile();
      handleUpdateUser(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    setUser: handleUpdateUser,
    updateProfile: handleProfileUpdate,
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
