import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/auth/Login.module.css';
import Copy from '@Copy';
import OAuthButtons from '@OAuthButtons';
import { EyeFill, EyeSlashFill, Person, Lock, ArrowRight } from 'react-bootstrap-icons';

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

  // Check screen size
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
    setFormData(prev => ({
      ...prev,
      rememberMe: savedRememberMe
    }));
  }, []);

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
        Object.keys(error.response.data).forEach(key => {
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

  const renderFormFields = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form.Group className="mb-3" controlId="identifier">
        <Form.Label>Username or Email</Form.Label>
        <div className={styles.inputWrapper}>
          <Form.Control
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            isInvalid={!!errors.identifier}
            placeholder="Enter username or email"
            className={`${styles.input} ${errors.identifier ? 'is-invalid' : ''}`}
          />
          <Person className={styles.inputIcon} />
        </div>
        <Form.Control.Feedback type="invalid">
          {errors.identifier}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-2" controlId="password">
        <Form.Label>Password</Form.Label>
        <div className={styles.inputWrapper}>
          <Form.Control
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!errors.password}
            placeholder="Enter password"
            className={`${styles.input} ${errors.password ? 'is-invalid' : ''}`}
          />
          <Button
            variant="link"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlashFill /> : <EyeFill />}
          </Button>
          <Lock className={styles.inputIcon} />
        </div>
        <Form.Control.Feedback type="invalid">
          {errors.password}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Group controlId="rememberMe">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="remember-me-tooltip">
                Keep me logged in for 30 days
              </Tooltip>
            }
          >
            <div>
              <Form.Check
                type="checkbox"
                label="Remember me"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
            </div>
          </OverlayTrigger>
        </Form.Group>
        <Link 
          to="/forgot-password" 
          className={styles.forgotPassword}
        >
          Forgot password?
        </Link>
      </div>

      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.errorMessage}
        >
          {apiError}
        </motion.div>
      )}

      <Button
        type="submit"
        className={styles.primaryButton}
        disabled={isLoggingIn}
      >
        <div className={styles.buttonContent}>
          {isLoggingIn ? (
            <>
              <div className={styles.spinner} />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <span>Login</span>
              <ArrowRight className={styles.buttonIcon} />
            </>
          )}
        </div>
      </Button>

      <div className={styles.orDivider}>or</div>

      <OAuthButtons />

      <div className="text-center mt-3">
        <p className="mb-0">
          Don't have an account?{' '}
          <Link to="/signup" className={styles.secondaryButton}>
            Create Account
          </Link>
        </p>
      </div>
    </motion.div>
  );

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
          <Col xs={12} lg={6} className={styles.welcomeCol}>
            <h2 className={styles.welcomeText}>
              <span className={styles.kefiHighlight}>Kefi</span> <br />
              <p className={styles.logParagraph}>
                A social learning space for teens — to grow, share, and succeed together.
              </p>
            </h2>
          </Col>
          <Col xs={12} lg={6} className={styles.loginCol}>
            {isMobile ? (
              <div className={styles.mobileFormWrapper}>
                <h2 className={`${styles.kefiHighlight} text-center mb-3`}>Kefi</h2>
                <p className={`text-center ${styles.logParagraph}`}>
                  A social learning space for teens — to grow, share, and succeed together.
                </p>
                <Form onSubmit={handleSubmit} className={styles.mobileForm}>
                  {renderFormFields()}
                </Form>
              </div>
            ) : (
              <Card className={styles.loginCard}>
                <Card.Body>
                  <Card.Title className="text-center mb-4">Login</Card.Title>
                  <Form onSubmit={handleSubmit}>
                    {renderFormFields()}
                  </Form>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default Login;