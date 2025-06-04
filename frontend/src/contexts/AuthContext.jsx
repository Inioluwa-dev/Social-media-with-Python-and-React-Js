// AuthContext.js
import { createContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginService, logoutService, validateToken, fetchUserProfile, setTokens } from '@utils/authService';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });
  const navigate = useNavigate();
  const location = useLocation();

  const verifyAuth = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const tokenValid = await validateToken();
      if (!tokenValid) throw new Error('Invalid session');

      const profile = await fetchUserProfile();
      setAuthState({
        isAuthenticated: true,
        user: profile,
        loading: false,
        error: null,
      });
      return true;
    } catch (error) {
      await logoutService();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message,
      });
      return false;
    }
  };

  const login = async (identifier, password, rememberMe) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await loginService(identifier, password);
      if (!data?.access) throw new Error('Login failed');

      setTokens(data.access, data.refresh, rememberMe);
      const verified = await verifyAuth();
      if (!verified) throw new Error('Verification failed');

      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true }); // Use replace to avoid history stack issues
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
      navigate('/login', { replace: true });
    } catch (error) {
      setAuthState((prev) => ({ ...prev, error: 'Logout failed' }));
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      const token = localStorage.getItem('access') || sessionStorage.getItem('access');
      if (token && isMounted) {
        await verifyAuth();
      } else if (isMounted) {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, verifyAuth }}>
      {authState.loading && !children ? (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };