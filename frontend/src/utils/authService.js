// authService.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get CSRF token from cookies
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

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Add CSRF token to all non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    // Add Authorization header if token exists
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh/', {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, clear everything and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    if (status === 403 && data.detail?.includes('Ratelimited')) {
      return new Error('Too many attempts. Please try again later.');
    }
    
    if (status === 400) {
      if (data.error) {
        return new Error(data.error);
      }
      if (typeof data === 'object') {
        // Handle validation errors
        const errorMessages = Object.entries(data)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        return new Error(errorMessages || 'Invalid data provided');
      }
    }
    
    return new Error(data.detail || data.message || 'An error occurred');
  } else if (error.request) {
    // The request was made but no response was received
    return new Error('No response from server. Please check your connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    return new Error(error.message || 'An error occurred');
  }
};

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

const getAccessToken = () =>
  localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

const getRefreshToken = () =>
  localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

const setTokens = (access, refresh, rememberMe) => {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem('accessToken', access);
  storage.setItem('refreshToken', refresh);
  localStorage.setItem('rememberMe', rememberMe);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('rememberMe');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('rememberMe');
};

export const login = async (identifier, password, rememberMe = false) => {
  try {
    const response = await api.post('/auth/login/', {
      username: identifier,
      password,
      remember_me: rememberMe,
    });
    const { access, refresh, user } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    
    // Store the complete user data
    localStorage.setItem('user', JSON.stringify(user));
    console.log('Stored user data:', user);
    
    return response.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const logout = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh: refreshToken });
    }
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
  }
};

export const sendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/signup/email/', { email });
    return response.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const verifyCode = async (email, code) => {
  try {
    const response = await api.post('/auth/verify-code/', { email, code });
    return response.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const completeSignup = async (userData) => {
  try {
    // Ensure all required fields are present
    const requiredFields = ['email', 'username', 'password', 'full_name', 'birth_date', 'gender', 'is_student'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Format the data to match the backend requirements
    const formattedData = {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      full_name: userData.full_name,
      birth_date: userData.birth_date,
      gender: userData.gender,
      is_student: userData.is_student
    };

    const response = await api.post('/auth/signup/complete/', formattedData);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }

    const { access, refresh, user } = response.data;
    
    if (!access || !refresh || !user) {
      throw new Error('Invalid response format from server');
    }

    // Store tokens and user data
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    const response = await api.post('auth/password/reset/', { email });
    return response.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await api.post('auth/password/reset/confirm/', {
      email,
      code,
      new_password: newPassword,
    });
    return response.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const validateResetCode = async (email, code) => {
  try {
    const response = await api.post('auth/password/reset/validate/', { email, code });
    return response.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile/');
    return response.data;
  } catch (err) {
    throw handleError(err);
  }
};

export const updateProfile = async (data) => {
  try {
    // Ensure we're not sending empty strings for optional fields
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      // Skip empty strings and convert them to null
      if (value === '') {
        acc[key] = null;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});

    const response = await api.patch('/auth/profile/', cleanedData);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Update local storage with new user data
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUser = { 
        ...currentUser, 
        ...response.data,
        // Ensure profile_completed is set correctly
        profile_completed: response.data.profile_completed || false
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    
    return response.data;
  } catch (err) {
    console.error('Profile update error:', err.response?.data || err.message);
    throw handleError(err);
  }
};

export const validateToken = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }
    await api.post('/auth/verify/', { token });
    return true;
  } catch (err) {
    return false;
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

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post('/auth/refresh/', {
      refresh: refreshToken,
    });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return access;
  } catch (err) {
    throw handleError(err);
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
};

export const setAccessToken = (token) => {
  const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
  storage.setItem('accessToken', token);
};

export const clearUserData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
};

export { api as default };