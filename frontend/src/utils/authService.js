// authService.js
import api from '../api/axios';

// Helper to extract error details from backend
const parseBackendError = (error) => {
  if (error.response && error.response.data && error.response.data.errors) {
    const { field_errors, non_field_errors } = error.response.data.errors;
    let message = '';
    if (field_errors && typeof field_errors === 'object') {
      message += Object.entries(field_errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join('\n');
    }
    if (non_field_errors && Array.isArray(non_field_errors) && non_field_errors.length > 0) {
      message += (message ? '\n' : '') + non_field_errors.join('\n');
    }
    return { field_errors, non_field_errors, message: message || 'An error occurred' };
  }
  if (error.response && error.response.data && (error.response.data.detail || error.response.data.message)) {
    return { field_errors: {}, non_field_errors: [error.response.data.detail || error.response.data.message], message: error.response.data.detail || error.response.data.message };
  }
  if (error.message) return { field_errors: {}, non_field_errors: [error.message], message: error.message };
  return { field_errors: {}, non_field_errors: ['An error occurred'], message: 'An error occurred' };
};

// CSRF token helper
const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Interceptors for CSRF and Auth
api.interceptors.request.use(
  (config) => {
    if (config.method !== 'get') {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    const token = localStorage.getItem('accessToken');
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
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');
        const response = await api.post('/auth/refresh/', { refresh: refreshToken });
        const { access } = response.data;
        localStorage.setItem('accessToken', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(parseBackendError(refreshError));
      }
    }
    return Promise.reject(parseBackendError(error));
  }
);

// Token/user helpers
const setTokens = (access, refresh) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
};

export const login = async (identifier, password, rememberMe = false) => {
  try {
    const response = await api.post('/auth/login/', {
      username: identifier,
      password,
      remember_me: rememberMe,
    });
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh: refreshToken });
    }
  } catch (err) {
    // ignore
  } finally {
    clearTokens();
  }
};

export const sendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/signup/email/', { email });
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const verifyCode = async (email, code) => {
  try {
    const response = await api.post('/auth/verify-code/', { email, code });
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const completeSignup = async (userData) => {
  try {
    const response = await api.post('/auth/signup/complete/', userData);
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await api.post('/auth/password/reset/', { email });
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const validateResetCode = async (email, code) => {
  try {
    const response = await api.post('/auth/password/reset/validate/', { email, code });
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await api.post('/auth/password/reset/confirm/', {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile/');
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.patch('/auth/profile/', data);
    if (!response.data) throw new Error('No data received from server');
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return response.data;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const validateToken = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    await api.post('/auth/verify/', { token });
    return true;
  } catch (err) {
    return false;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await api.post('/auth/refresh/', { refresh: refreshToken });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  } catch (err) {
    throw parseBackendError(err);
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

export const clearAuthData = clearTokens;