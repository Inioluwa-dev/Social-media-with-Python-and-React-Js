
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

const handleApiError = (err, setError, defaultMessage) => {
    const message = err.response?.data?.detail || err.response?.data?.email?.[0] || err.response?.data?.message || defaultMessage;
    setError(message);
    throw err;
};

export const sendVerificationEmail = async (email, setError) => {
    try {
        await axios.post(`${API_URL}signup/email/`, { email });
    } catch (err) {
        handleApiError(err, setError, 'Failed to send verification code');
    }
};

export const verifyCode = async (email, code, setError) => {
    try {
        await axios.post(`${API_URL}verify/`, { email, code });
    } catch (err) {
        handleApiError(err, setError, 'Invalid verification code');
    }
};

export const completeSignup = async (data, setError) => {
    try {
        await axios.post(`${API_URL}signup/complete/`, data);
    } catch (err) {
        handleApiError(err, setError, 'Failed to complete signup');
    }
};

export const login = async (username, password, setError) => {
    try {
        const response = await axios.post(`${API_URL}login/`, { username, password });
        return response.data;
    } catch (err) {
        handleApiError(err, setError, 'Invalid username or password');
    }
};

export const sendPasswordResetEmail = async (email, setError) => {
    try {
        await axios.post(`${API_URL}password/reset/`, { email });
    } catch (err) {
        handleApiError(err, setError, 'Failed to send password reset email');
    }
};

export const resetPassword = async (email, code, newPassword, setError) => {
    try {
        await axios.post(`${API_URL}password/reset/confirm/`, { email, code, new_password: newPassword });
    } catch (err) {
        handleApiError(err, setError, 'Failed to reset password');
    }
};

export const updateProfile = async (data, setError) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const response = await axios.patch(`${API_URL}profile/`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (err) {
        handleApiError(err, setError, 'Failed to update profile');
    }
};

export const validateToken = async (setError) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        await axios.get(`${API_URL}profile/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return true;
    } catch (err) {
        handleApiError(err, setError, 'Invalid or expired token');
        return false;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
};
