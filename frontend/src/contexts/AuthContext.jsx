// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  login as authLogin,
  logout as authLogout,
  refreshToken,
  getCurrentUser,
  isAuthenticated,
  sendVerificationEmail,
  verifyCode,
  completeSignup,
  fetchUserProfile,
  updateProfile,
  sendPasswordResetEmail,
  validateResetCode,
  resetPassword
} from '@utils/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // error is now an object: { field_errors, non_field_errors, message }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            // Optionally fetch fresh profile
            try {
              const profile = await fetchUserProfile();
              setUser(prev => ({ ...prev, ...profile }));
            } catch (e) {
              // ignore profile fetch error
            }
          }
        }
      } catch (error) {
        setUser(null);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const handleLogin = async (identifier, password, rememberMe) => {
    setError(null);
    try {
      const response = await authLogin(identifier, password, rememberMe);
      setUser(response.user);
      if (!response.user.profile_completed) {
        navigate('/complete-profile', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
      return response;
    } catch (errorObj) {
      setError(errorObj);
      throw errorObj;
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await authLogout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      setUser(null);
      navigate('/login');
    }
  };

  const handleSignup = async (userData) => {
    setError(null);
    try {
      const response = await completeSignup(userData);
      setUser(response.user);
      return response;
    } catch (errorObj) {
      setError(errorObj);
      throw errorObj;
    }
  };

  const handleSendVerificationEmail = async (email) => {
    setError(null);
    try {
      await sendVerificationEmail(email);
    } catch (errorObj) {
      setError(errorObj);
      throw errorObj;
    }
  };

  const handleVerifyCode = async (email, code) => {
    setError(null);
    try {
      await verifyCode(email, code);
    } catch (errorObj) {
      setError(errorObj);
      throw errorObj;
    }
  };

  const handleUpdateUser = (updatedUser) => {
    if (!updatedUser || typeof updatedUser !== 'object') return;
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const handleProfileUpdate = async (profileData) => {
    setError(null);
    try {
      const updatedProfile = await updateProfile(profileData);
      handleUpdateUser(updatedProfile);
      return updatedProfile;
    } catch (errorObj) {
      setError(errorObj);
      throw errorObj;
    }
  };

  // Password reset flows
  const handleSendPasswordResetEmail = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(email);
    } catch (errorObj) {
      setError(errorObj);
      throw errorObj;
    }
  };

  const handleValidateResetCode = async (email, code) => {
    setError(null);
    try {
      await validateResetCode(email, code);
    } catch (errorObj) {
      setError(errorObj);
      throw errorObj;
    }
  };

  const handleResetPassword = async (email, code, newPassword) => {
    setError(null);
    try {
      await resetPassword(email, code, newPassword);
    } catch (errorObj) {
      setError(errorObj);
      throw errorObj;
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
    sendPasswordResetEmail: handleSendPasswordResetEmail,
    validateResetCode: handleValidateResetCode,
    resetPassword: handleResetPassword,
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
