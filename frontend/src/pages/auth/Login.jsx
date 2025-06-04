import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/auth/Login.module.css';
import Copy from '@Copy';
import OAuthButtons from '@OAuthButtons';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

const Login = () => {
  const { login, error: authError, loading: authLoading } = useContext(AuthContext);
  const location = useLocation();
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

  useEffect(() => {
    const checkScreen = window.matchMedia('(max-width: 575.98px)');
    setIsMobile(checkScreen.matches);
    const handleResize = (e) => setIsMobile(e.matches);
    checkScreen.addEventListener('change', handleResize);
    return () => checkScreen.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    if (authError) {
      setApiError(authError);
      setIsLoggingIn(false);
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

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
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    } else if (formData.identifier.includes('@') && !emailRegex.test(formData.identifier)) {
      newErrors.identifier = 'Invalid email format';
    } else if (formData.identifier.length < 3) {
      newErrors.identifier = 'Username or email must be at least 3 characters';
    } else if (formData.identifier.length > 150) {
      newErrors.identifier = 'Username or email must be 150 characters or less';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setApiError('');

    if (!validateForm()) return;

    setIsLoggingIn(true);
    try {
      await login(formData.identifier, formData.password, formData.rememberMe);
    } catch (error) {
      setApiError(error.message || 'Login failed. Please check your credentials.');
      setIsLoggingIn(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const renderFormFields = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form.Group className="mb-3" controlId="identifier">
        <Form.Label>Username or Email</Form.Label>
        <Form.Control
          type="text"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          isInvalid={!!errors.identifier}
          placeholder="Enter username or email"
          autoFocus
          aria-describedby="identifierError"
        />
        <Form.Control.Feedback type="invalid" id="identifierError">
          {errors.identifier}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <div className={styles.inputGroup}>
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            style={{ paddingRight: '40px' }}
          />
          <Button
            variant="link"
            className={styles.passwordToggle}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeSlashFill /> : <EyeFill />}
          </Button>
        </div>
        <Form.Control.Feedback type="invalid" id="passwordError">
          {errors.password}
        </Form.Control.Feedback>
      </Form.Group>

      {apiError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={styles.errorMessage}
        >
          {apiError}
        </motion.div>
      )}

      <Form.Group className="mb-3 d-flex justify-content-between align-items-center" controlId="rememberMe">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Keep me logged in for 30 days</Tooltip>}
        >
          <Form.Check
            type="checkbox"
            name="rememberMe"
            label="Remember me"
            checked={formData.rememberMe}
            onChange={handleChange}
            aria-describedby="rememberMeHelp"
          />
        </OverlayTrigger>
        <Link to="/forgot-password" className={styles.forgotPassword}>
          Forgot Password?
        </Link>
      </Form.Group>
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
          <title>Kefi | Login</title>
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
                  <Button
                    variant="primary"
                    type="submit"
                    className={`w-100 ${styles.mobileButton}`}
                    disabled={isLoggingIn || authLoading}
                    aria-busy={isLoggingIn || authLoading}
                  >
                    {isLoggingIn || authLoading ? (
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
                        Logging in...
                      </div>
                    ) : (
                      'Log in'
                    )}
                  </Button>
                </Form>
                <Button
                  as={Link}
                  to="/signup"
                  variant="outline-primary"
                  className={`w-100 mt-3 ${styles.createAccountButton}`}
                  disabled={isLoggingIn || authLoading}
                >
                  Create new account
                </Button>
                <div className={styles.orDivider}>OR</div>
                <OAuthButtons />
              </div>
            ) : (
              <Card className={styles.loginCard}>
                <Card.Body>
                  <Card.Title className="text-center mb-4">Login</Card.Title>
                  <Form onSubmit={handleSubmit}>
                    {renderFormFields()}
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={isLoggingIn || authLoading}
                      aria-busy={isLoggingIn || authLoading}
                    >
                      {isLoggingIn || authLoading ? (
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
                          Logging in...
                        </div>
                      ) : (
                        'Log in'
                      )}
                    </Button>
                  </Form>
                  <div className={styles.orDivider}>OR</div>
                  <OAuthButtons />
                  <Button
                    as={Link}
                    to="/signup"
                    variant="outline-primary"
                    className={`w-100 mt-4 ${styles.createAccountButton}`}
                    disabled={isLoggingIn || authLoading}
                  >
                    Create new account
                  </Button>
                  <Copy />
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