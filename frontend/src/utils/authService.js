import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

// Helper function for error handling
const handleError = (err, defaultMessage) => {
  const errorData = err.response?.data;
  throw new Error(
    errorData?.message ||
    errorData?.detail ||
    (Array.isArray(errorData?.email) ? errorData.email[0] : null) ||
    defaultMessage
  );
};

// Token management helpers
const getAccessToken = () => localStorage.getItem('access');
const getRefreshToken = () => localStorage.getItem('refresh');
const setTokens = (access, refresh) => {
  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};

export const sendVerificationEmail = async (email) => {
  try {
    const response = await axios.post(`${API_URL}signup/email/`, { email });
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to send verification code');
  }
};

export const verifyCode = async (email, code) => {
  try {
    const response = await axios.post(`${API_URL}verify/`, { email, code });
    return response.data;
  } catch (err) {
    handleError(err, 'Invalid verification code');
  }
};

export const completeSignup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}signup/complete/`, userData);
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to complete signup');
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}login/`, { username, password });
    setTokens(response.data.access, response.data.refresh);
    return response.data;
  } catch (err) {
    handleError(err, 'Invalid username or password');
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await axios.post(`${API_URL}password/reset/`, { email });
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to send password reset email');
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}password/reset/confirm/`, {
      email,
      code,
      new_password: newPassword
    });
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to reset password');
  }
};

export const validateResetCode = async (email, code) => {
  try {
    const response = await axios.post(`${API_URL}password/reset/validate/`, { email, code });
    return response.data;
  } catch (err) {
    // This ensures the calling component gets the error
    throw new Error(err.response?.data?.detail || 'Invalid or expired reset code');
  }
};


export const updateProfile = async (data) => {
  try {
    const token = getAccessToken();
    const response = await axios.patch(`${API_URL}profile/`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to update profile');
  }
};

export const validateToken = async () => {
  try {
    const token = getAccessToken();
    await axios.get(`${API_URL}profile/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (err) {
    return false;
  }
};

export const logout = () => {
  clearTokens();
};

// Optional: Add refresh token functionality
export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    const response = await axios.post(`${API_URL}token/refresh/`, {
      refresh: refreshToken
    });
    setTokens(response.data.access, refreshToken);
    return response.data.access;
  } catch (err) {
    clearTokens();
    throw new Error('Session expired. Please login again.');
  }
};