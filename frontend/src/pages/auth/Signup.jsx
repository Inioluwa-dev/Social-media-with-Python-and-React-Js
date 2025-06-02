import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { sendVerificationEmail, verifyCode, completeSignup } from '@utils/authService';
import styles from '@styles/auth/Signup.module.css';
import OAuthButtons from '@OAuthButtons';
import Copy from '@Copy';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Added for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Added for confirm password visibility
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupPath, setSignupPath] = useState(null);
  const navigate = useNavigate();

  const benefits = [
    { icon: 'bi-award', text: 'Exclusive learning resources' },
    { icon: 'bi-shield-lock', text: 'Secure and private' },
    { icon: 'bi-people', text: 'Join a community of learners' },
    { icon: 'bi-emoji-smile', text: 'Personalized experience' },
  ];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await sendVerificationEmail(email);
      setSignupPath('email');
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await verifyCode(email, verificationCode);
      setStep(3);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async () => {
    if (!username || !fullName || !birthDate || !gender) {
      setErrorMessage('Please fill all required fields');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await completeSignup({
        email,
        username,
        password: newPassword,
        full_name: fullName,
        birth_date: birthDate,
        gender,
        is_student: isStudent,
      });
      setStep(4);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (step === 3 && signupPath === 'oauth') {
      setStep(1);
      setSignupPath(null);
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  const handleOAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSignupPath('oauth');
      setStep(3);
      setIsLoading(false);
    }, 500);
  };

  const renderStep = () => {
    const totalSteps = 4;
    const progressPercentage = Math.min(Math.round(((step - 1) / totalSteps) * 100), 100);

    switch (step) {
      case 1:
        return (
          <>
            <div className="d-flex d-md-none justify-content-center mb-4">
              <div className="text-center">
                <h1 className="h3 fw-bold text-primary">Kefi</h1>
                <p className="small text-muted">Where learning meets joy</p>
              </div>
            </div>
            <div className="text-center mb-4">
              <h2 className="mb-3">Join Kefi Today</h2>
              <ProgressBar now={progressPercentage} variant="primary" />
              <div className="mt-2">Step 1: Email</div>
            </div>
            <Form onSubmit={handleEmailSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                  className={styles.formInput}
                  aria-required="true"
                />
                {errorMessage && <div className="text-danger small">{errorMessage}</div>}
              </Form.Group>
              <Button
                type="submit"
                className={`${styles.primaryBtn} w-100`}
                disabled={!email || isLoading}
              >
                {isLoading ? <Spinner size="sm" /> : 'Continue'}
              </Button>
            </Form>
            <div className={styles.orDivider}>OR</div>
            <OAuthButtons onClick={handleOAuth} />
            <div className="text-center mt-3">
              <p className="small text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="text-center mb-4">
              <h2 className="mb-3">Verify your email</h2>
              <ProgressBar now={progressPercentage} variant="primary" />
              <div className="mt-2">Step 2: Verification</div>
            </div>
            <p className="text-center text-secondary mb-4">
              We sent a verification code to <span className="text-primary">{email}</span>
            </p>
            <Form.Group className="mb-4">
              <Form.Label>Verification Code</Form.Label>
              <Form.Control
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                autoFocus
                required
              />
            </Form.Group>
            {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleVerificationSubmit}
                disabled={verificationCode.length < 6 || isLoading}
              >
                {isLoading ? <span className="spinner-border spinner-border-sm" /> : 'Verify'}
              </Button>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="text-center mb-4">
              <h2 className="mb-3">Complete your profile</h2>
              <ProgressBar now={progressPercentage} variant="primary" />
              <div className="mt-2">Step 3: Profile</div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Birth Date</Form.Label>
              <Form.Control
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3 position-relative">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button
                variant="link"
                className="position-absolute end-0 top-50 translate-middle-y"
                style={{ right: '10px' }}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </Button>
            </Form.Group>
            <Form.Group className="mb-3 position-relative">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                variant="link"
                className="position-absolute end-0 top-50 translate-middle-y"
                style={{ right: '10px' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </Button>
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="I am a student"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
              className="mb-3"
            />
            {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handleBack}>
                Back
              </Button>
              <Button
                className="flex-grow-1"
                onClick={handleDetailsSubmit}
                disabled={
                  isLoading ||
                  !fullName ||
                  !username ||
                  !birthDate ||
                  !gender ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  'Complete Signup'
                )}
              </Button>
            </div>
          </>
        );

      case 4:
        return (
          <div className="text-center py-4">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
            </div>
            <h3>Welcome to Kefi!</h3>
            <p className="text-secondary">Your account has been successfully created.</p>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container fluid className={styles.authContainer}>
      <Helmet>
        <title>Kefi | Sign Up</title>
      </Helmet>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={5} lg={4} xl={4} className="d-none d-md-flex align-items-center">
          <div className="p-5">
            <div className="mb-5">
              <h1 className="display-4 fw-bold text-primary">Kefi</h1>
              <p className="text-muted">Where learning meets joy</p>
            </div>
            <div>
              {benefits.map((benefit, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  <i className={`bi ${benefit.icon} me-3 fs-4`}></i>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <p className="small text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Col>
        <Col xs={12} sm={10} md={7} lg={6} xl={5}>
          <Card className={styles.authCard}>
            <Card.Body className="p-4 p-md-5">{renderStep()}</Card.Body>
          </Card>
        </Col>
      </Row>
      <footer>
        <Copy />
      </footer>
    </Container>
  );
};

export default Signup;