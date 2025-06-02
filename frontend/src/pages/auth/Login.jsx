import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/auth/Login.module.css';
import Copy from '@Copy';
import OAuthButtons from '@OAuthButtons';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

const Login = () => {
  const { login, error: authError, setError: setAuthError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      setAuthError('');
    }
  }, [authError, setAuthError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Username or email is required';
    } else if (formData.identifier.length < 3) {
      newErrors.identifier = 'Username or email must be at least 3 characters';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.identifier, formData.password, formData.rememberMe);
      // redirect or do something after successful login
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Invalid username/email or password.';
            break;
          case 403:
            errorMessage = 'Account locked due to too many failed attempts. Please try again later or contact support.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.message || 'Login failed.';
        }
      }
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Helper to render form fields (to avoid repetition)
  const renderFormFields = () => (
    <>
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
          aria-describedby="identifierHelp identifierError"
          aria-invalid={!!errors.identifier}
        />
        <Form.Control.Feedback type="invalid" id="identifierError">
          {errors.identifier}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <div className="position-relative">
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!errors.password}
            placeholder="Enter password"
            aria-describedby="passwordError"
            aria-invalid={!!errors.password}
          />
          <Button
            variant="link"
            className={`position-absolute end-0 top-50 translate-middle-y ${styles.passwordToggle}`}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeSlashFill /> : <EyeFill />}
          </Button>
          <Form.Control.Feedback type="invalid" id="passwordError">
            {errors.password}
          </Form.Control.Feedback>
        </div>
      </Form.Group>

      <Form.Group className="mb-3 d-flex justify-content-between align-items-center" controlId="rememberMe">
        <Form.Check
          type="checkbox"
          name="rememberMe"
          label="Remember me"
          checked={formData.rememberMe}
          onChange={handleChange}
          aria-checked={formData.rememberMe}
          aria-describedby="rememberMeHelp"
        />
        <Link to="/forgot-password" className={styles.forgotPassword}>
          Forgot Password?
        </Link>
      </Form.Group>
    </>
  );

  return (
    <>
      <Container className={styles.loginContainer}>
        <Helmet key={location.pathname}>
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
            {apiError && (
              <Alert variant="danger" className="mb-3" onClose={() => setApiError('')} dismissible>
                <Alert.Heading>Login Failed</Alert.Heading>
                <p>{apiError}</p>
                {(apiError.includes('password') || apiError.includes('locked')) && (
                  <Link to="/forgot-password" state={location.state} className="alert-link">
                    Forgot your password?
                  </Link>
                )}
              </Alert>
            )}

            {isMobile ? (
              <div className={styles.mobileFormWrapper}>
                <h2 className={`${styles.kefiHighlight} text-center mb-3`}>Kefi</h2>
                <p className={`text-center ${styles.logParagraph}`}>
                  A social learning space for teens — to grow, share, and succeed together.
                </p>
                <Form onSubmit={handleSubmit} className={styles.mobileForm}>
                  {/* Render form fields */}
                  {renderFormFields()}
                  <Button
                    variant=""
                    type="submit"
                    className={`w-100 ${styles.mobileButton}`}
                    disabled={isLoading}
                    aria-live="polite"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Logging in...
                      </>
                    ) : (
                      'Log in'
                    )}
                  </Button>
                </Form>

                <Button
                  as={Link}
                  to="/signup"
                  variant=""
                  className={`w-100 mt-3 ${styles.createAccountButton}`}
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
                      disabled={isLoading}
                      aria-live="polite"
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
                          Logging in...
                        </>
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
    </>
  );
};

export default Login;
