import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/auth/Login.module.css';
import Copy from '@Copy';
import OAuthButtons from '@OAuthButtons';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

const Login = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreen = window.matchMedia('(max-width: 575.98px)');
    setIsMobile(checkScreen.matches);

    const handleResize = (e) => setIsMobile(e.matches);
    checkScreen.addEventListener('change', handleResize);
    return () => checkScreen.removeEventListener('change', handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
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

    if (loginAttempts >= 5) {
      setApiError('Too many attempts. Please wait 5 minutes.');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      let errorMessage = 'Invalid username or password';
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Invalid credentials';
            break;
          case 403:
            errorMessage = 'Account not verified. Please check your email.';
            break;
          case 429:
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.message || 'Login failed';
        }
      }
      setApiError(errorMessage);
      setLoginAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Container className={styles.loginContainer}>
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
                {apiError.includes('password') && (
                  <Link to="/forgot-password" className="alert-link">
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
                  <Form.Group className="mb-3" controlId="usernameMobile">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      isInvalid={!!errors.username}
                      placeholder="Enter username"
                      autoFocus
                      aria-describedby="usernameHelp usernameError"
                      aria-invalid={!!errors.username}
                    />
                    <Form.Control.Feedback type="invalid" id="usernameError">
                      {errors.username}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="passwordMobile">
                    <Form.Label>Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        placeholder="Password"
                        aria-describedby="passwordError"
                        aria-invalid={!!errors.password}
                      />
                      <Button
                        variant="link"
                        className={`position-absolute end-0 top-50 translate-middle-y ${styles.passwordToggle}`}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeSlashFill /> : <EyeFill />}
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid" id="passwordError">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Button
                    variant=""
                    type="submit"
                    className={`w-100 ${styles.mobileButton}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Logging in...
                      </>
                    ) : 'Log in'}
                  </Button>
                </Form>
                <p className={`text-center mt-3 ${styles.forgotPassword}`}>
                  <Link to="/forgot-password">Forgot Password?</Link>
                </p>
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
                    <Form.Group className="mb-3" controlId="username">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        isInvalid={!!errors.username}
                        placeholder="Enter username"
                        autoFocus
                        aria-describedby="usernameHelp usernameError"
                        aria-invalid={!!errors.username}
                      />
                      <Form.Control.Feedback type="invalid" id="usernameError">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
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
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeSlashFill /> : <EyeFill />}
                        </Button>
                      </div>
                      <Form.Control.Feedback type="invalid" id="passwordError">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Logging in...
                        </>
                      ) : 'Login'}
                    </Button>
                  </Form>
                  <p className={`text-center mt-3 ${styles.forgotPassword}`}>
                    <Link to="/forgot-password">Forgot Password?</Link>
                  </p>
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
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      <footer className={styles.footer}>
        <Copy />
      </footer>
    </>
  );
};

export default Login;