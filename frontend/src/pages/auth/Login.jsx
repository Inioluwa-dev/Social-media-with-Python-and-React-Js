// Login.jsx: Main login page with responsive layout
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/auth/Login.module.css';
import Copy from '@Copy';
import LoginMobileWrapper from '@components/auth/LoginMobileWrapper';
import LoginDesktopWrapper from '@components/auth/LoginDesktopWrapper';

// Main login page component
const Login = () => {
  const { login, error: authError } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: localStorage.getItem('rememberMe') === 'true',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check screen size for responsive layout
  useEffect(() => {
    const checkScreen = window.matchMedia('(max-width: 575.98px)');
    setIsMobile(checkScreen.matches);
    const handleResize = (e) => setIsMobile(e.matches);
    checkScreen.addEventListener('change', handleResize);
    return () => checkScreen.removeEventListener('change', handleResize);
  }, []);

  // Handle auth errors
  useEffect(() => {
    if (authError && !apiError) {
      setApiError(authError);
    }
  }, [authError]);

  // Load saved remember me preference
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    setFormData((prev) => ({
      ...prev,
      rememberMe: savedRememberMe,
    }));
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const { identifier, password } = formData;

    if (!identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    } else {
      if (identifier.includes('@') && !emailRegex.test(identifier)) {
        newErrors.identifier = 'Invalid email format';
      } else if (identifier.length < 3) {
        newErrors.identifier = 'Must be at least 3 characters';
      } else if (identifier.length > 150) {
        newErrors.identifier = 'Must be 150 characters or less';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');
    setIsLoggingIn(true);

    try {
      const response = await login(formData.identifier, formData.password, formData.rememberMe);
      console.log('Login response:', response); // Debug log

      // Let AuthContext handle the redirection
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error.message);

      // Handle specific field errors if they exist
      if (error.response?.data) {
        const fieldErrors = {};
        Object.keys(error.response.data).forEach((key) => {
          if (key !== 'non_field_errors' && key !== 'detail') {
            fieldErrors[key] = error.response.data[key][0];
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        }
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className={styles.loginContainer}>
        <Helmet>
          <title>Login | Kefi</title>
        </Helmet>
        <Row className={styles.row}>
          {/* Welcome column for desktop */}
          <Col xs={12} lg={6} className={styles.welcomeCol}>
            <h2 className={styles.welcomeText}>
              <span className={styles.kefiHighlight}>Kefi</span> <br />
              <p className={styles.logParagraph}>
                A social learning space for teens — to grow, share, and succeed together.
              </p>
            </h2>
          </Col>
          {/* Login form column */}
          <Col xs={12} lg={6} className={styles.loginCol}>
            {isMobile ? (
              <LoginMobileWrapper
                handleSubmit={handleSubmit}
                formData={formData}
                handleChange={handleChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                errors={errors}
                apiError={apiError}
                isLoggingIn={isLoggingIn}
              />
            ) : (
              <LoginDesktopWrapper
                handleSubmit={handleSubmit}
                formData={formData}
                handleChange={handleChange}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                errors={errors}
                apiError={apiError}
                isLoggingIn={isLoggingIn}
              />
            )}
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default Login;