import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- RememberMe flag storage helpers ---

const setRememberMeFlag = (rememberMe) => {
  if (rememberMe) {
    localStorage.setItem('rememberMe', 'true');
    sessionStorage.removeItem('rememberMe');
  } else {
    sessionStorage.setItem('rememberMe', 'false');
    localStorage.removeItem('rememberMe');
  }
};

const getRememberMeFlag = () =>
  localStorage.getItem('rememberMe') === 'true' || sessionStorage.getItem('rememberMe') === 'true';

// --- Token helpers ---

const getAccessToken = () =>
  localStorage.getItem('access') || sessionStorage.getItem('access');

const getRefreshToken = () =>
  localStorage.getItem('refresh') || sessionStorage.getItem('refresh');

export const setTokens = (access, refresh, rememberMe = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('access', access);
  if (refresh) storage.setItem('refresh', refresh);

  // Remove tokens from the other storage
  const otherStorage = rememberMe ? sessionStorage : localStorage;
  otherStorage.removeItem('access');
  otherStorage.removeItem('refresh');

  // Set rememberMe flag explicitly
  setRememberMeFlag(rememberMe);
};

const clearTokens = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('rememberMe');

  sessionStorage.removeItem('access');
  sessionStorage.removeItem('refresh');
  sessionStorage.removeItem('rememberMe');
};

// --- Axios interceptors ---

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await logoutService();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// --- Error handler ---

const handleError = (err, defaultMessage) => {
  if (err.response?.status === 403) {
    throw new Error(
      'Account locked due to too many failed attempts. Please try again later or contact support.'
    );
  }
  if (err.response?.status === 429) {
    throw new Error('Too many login attempts. Please wait a few minutes and try again.');
  }
  const errorData = err.response?.data;
  throw new Error(
    errorData?.error ||
      errorData?.detail ||
      (Array.isArray(errorData?.email) ? errorData.email[0] : null) ||
      defaultMessage
  );
};

// --- API methods ---

export const sendVerificationEmail = async (email) => {
  try {
    const response = await api.post('signup/email/', { email });
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to send verification code');
  }
};

export const verifyCode = async (email, code) => {
  try {
    const response = await api.post('verify-code/', { email, code });
    return response.data;
  } catch (err) {
    handleError(err, 'Invalid verification code');
  }
};

export const completeSignup = async (userData) => {
  try {
    const response = await api.post('signup/complete/', userData);
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to complete signup');
  }
};

export const loginService = async (identifier, password) => {
  try {
    const response = await api.post('login/', { username: identifier, password });
    // No token setting here — handled by AuthContext
    return response.data; // includes access, refresh tokens, and user info
  } catch (err) {
    handleError(err, 'Invalid username/email or password');
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await api.post('password/reset/', { email });
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to send password reset email');
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await api.post('password/reset/confirm/', {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to reset password');
  }
};

export const validateResetCode = async (email, code) => {
  try {
    const response = await api.post('password/reset/validate/', { email, code });
    return response.data;
  } catch (err) {
    handleError(err, 'Invalid or expired reset code');
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await api.get('profile/');
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to fetch user profile');
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.patch('profile/', data);
    return response.data;
  } catch (err) {
    handleError(err, 'Failed to update profile');
  }
};

export const validateToken = async () => {
  try {
    await api.get('profile/');
    return true;
  } catch (err) {
    try {
      await refreshAccessToken();
      return true;
    } catch (refreshErr) {
      return false;
    }
  }
};

export const logoutService = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await api.post('logout/', { refresh: refreshToken });
    }
  } catch (error) {
    console.error('Logout error:', error.response?.data || error.message);
  } finally {
    clearTokens();
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await axios.post(`${API_URL}refresh/`, {
      refresh: refreshToken,
    });

    const rememberMe = getRememberMeFlag();

    setTokens(response.data.access, refreshToken, rememberMe);

    return response.data.access;
  } catch (err) {
    clearTokens();
    throw new Error('Session expired. Please login again.');
  }
};

export default api;
