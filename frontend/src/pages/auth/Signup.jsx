import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import zxcvbn from 'zxcvbn';
import { sendVerificationEmail, verifyCode, completeSignup } from '@utils/authService';
import styles from '@styles/auth/Signup.module.css';
import Copy from '@Copy';
import OAuthButtons from '@OAuthButtons';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupPath, setSignupPath] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    strength: false,
  });
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
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await sendVerificationEmail(email);
      setSignupPath('email');
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await verifyCode(email, verificationCode);
      setStep(3);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const result = zxcvbn(value);
    setPasswordStrength(result);
    setPasswordValidation({
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      strength: result.score >= 2,
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const validateDetails = () => {
    if (!username || !fullName || !birthDate || !gender) {
      setErrorMessage('Please fill all required fields.');
      return false;
    }
    if (!passwordValidation.minLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (!passwordValidation.uppercase) {
      setErrorMessage('Password must contain at least one uppercase letter.');
      return false;
    }
    if (!passwordValidation.lowercase) {
      setErrorMessage('Password must contain at least one lowercase letter.');
      return false;
    }
    if (!passwordValidation.number) {
      setErrorMessage('Password must contain at least one number.');
      return false;
    }
    if (!passwordValidation.strength) {
      setErrorMessage('Password is too weak. Please use a stronger password.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateDetails()) return;

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
      setErrorMessage(err.message || 'Failed to complete signup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (step === 3 && signupPath === 'signup') {
      setStep(1);
      setSignupPath(null);
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  const handleOAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSignupPath('signup');
      setStep(3);
      setIsLoading(false);
    }, 500);
  };

  const renderPasswordFeedback = () => {
    if (!newPassword) return null;

    return (
      <div className={styles.passwordFeedback}>
        <div className={styles.validationList}>
          <div className={styles.validationItem}>
            <span className={`${styles.validationRadio} ${passwordValidation.minLength ? styles.valid : ''}`}>
              {passwordValidation.minLength ? '✓' : ''}
            </span>
            At least 8 characters
          </div>
          <div className={styles.validationItem}>
            <span className={`${styles.validationRadio} ${passwordValidation.uppercase ? styles.valid : ''}`}>
              {passwordValidation.uppercase ? '✓' : ''}
            </span>
            At least one uppercase letter
          </div>
          <div className={styles.validationItem}>
            <span className={`${styles.validationRadio} ${passwordValidation.lowercase ? styles.valid : ''}`}>
              {passwordValidation.lowercase ? '✓' : ''}
            </span>
            At least one lowercase letter
          </div>
          <div className={styles.validationItem}>
            <span className={`${styles.validationRadio} ${passwordValidation.number ? styles.valid : ''}`}>
              {passwordValidation.number ? '✓' : ''}
            </span>
            At least one number
          </div>
          <div className={styles.validationItem}>
            <span className={`${styles.validationRadio} ${passwordValidation.strength ? styles.valid : ''}`}>
              {passwordValidation.strength ? '✓' : ''}
            </span>
            Strong enough
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <div className={`${styles.validationItem} ${styles.validationError}`}>
              <span className={styles.validationRadio}>✗</span>
              Passwords do not match
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep = () => {
    const totalSteps = 4;
    const progressPercentage = Math.min(Math.round(((step - 1) / totalSteps) * 100), 100);

    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="d-flex d-md-none justify-content-center mb-4">
              <div className="text-center">
                <h1 className="h3 fw-bold text-primary">Kefi</h1>
                <p className="small text-muted">Where learning meets community</p>
              </div>
            </div>
            <div className="text-center mb-4">
              <h2 className="mb-3">Join Kefi</h2>
              <ProgressBar now={progressPercentage} variant="primary" />
              <div className="mt-2">Step 1: Email</div>
            </div>
            <Form onSubmit={handleEmailSubmit}>
              <Form.Group className="mb-4" controlId="email">
                <Form.Label>
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <div className={styles.inputGroup}>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                    aria-describedby="emailError"
                    style={{ paddingRight: '40px' }}
                  />
                  {errorMessage && (
                    <span className={styles.errorText} id="emailError">
                      {errorMessage}
                    </span>
                  )}
                </div>
              </Form.Group>
              <Button
                type="submit"
                className={`${styles.primaryBtn} w-100`}
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
                    Continue
                  </div>
                ) : (
                  'Continue'
                )}
              </Button>
            </Form>
            <div className={styles.orDivider}>OR</div>
            <OAuthButtons onClick={handleOAuth} />
            <div className="text-center mt-3">
              <p className="small text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-primary">
                  Log In
                </Link>
              </p>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-4">
              <h2 className="mb-3">Verify Your Email</h2>
              <ProgressBar now={progressPercentage} variant="primary" />
              <div className="mt-2">Step 2: Verification</div>
            </div>
            <p className="text-center text-secondary mb-4">
              We sent a verification code to <span className="text-primary">{email}</span>.
            </p>
            <Form.Group className="mb-4" controlId="verificationCode">
              <Form.Label>Verification Code</Form.Label>
              <div className={styles.inputGroup}>
                <Form.Control
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  autoFocus
                  required
                  aria-describedby="codeError"
                  style={{ paddingRight: '40px' }}
                />
                {errorMessage && (
                  <span className={styles.errorText} id="codeError">
                    {errorMessage}
                  </span>
                )}
              </div>
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleVerificationSubmit}
                disabled={isLoading || verificationCode.length < 6}
                className={styles.primaryBtn}
              >
                {isLoading ? (
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
                    Verify
                  </div>
                ) : (
                  'Verify'
                )}
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-4">
              <h2 className="mb-3">Complete Your Profile</h2>
              <ProgressBar now={progressPercentage} variant="primary" />
              <div className="mt-2">Step 3: Profile</div>
            </div>
            <Form onSubmit={handleDetailsSubmit}>
              <Form.Group className="mb-3" controlId="fullName">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  aria-describedby="fullNameError"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  aria-describedby="usernameError"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="birthDate">
                <Form.Label>Birth Date</Form.Label>
                <Form.Control
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  aria-describedby="birthDateError"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="gender">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  aria-describedby="genderError"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="isStudent">
                <Form.Check
                  type="checkbox"
                  label="I am a student"
                  checked={isStudent}
                  onChange={(e) => setIsStudent(e.target.checked)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <div className={styles.inputGroup}>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="At least 8 characters"
                    style={{ paddingRight: '40px' }}
                    aria-describedby="passwordFeedback"
                  />
                  <Button
                    variant="link"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeSlashFill /> : <EyeFill />}
                  </Button>
                </div>
              </Form.Group>
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <div className={styles.inputGroup}>
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    placeholder="Re-enter password"
                    style={{ paddingRight: '40px' }}
                    aria-describedby="passwordFeedback"
                  />
                  <Button
                    variant="link"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
                  </Button>
                </div>
                {renderPasswordFeedback()}
              </Form.Group>
              {errorMessage && !errorMessage.includes('Password') && (
                <span className={styles.errorText} id="detailsError">
                  {errorMessage}
                </span>
              )}
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={styles.primaryBtn}
                >
                  {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
                      Complete Signup
                    </div>
                  ) : (
                    'Complete Signup'
                  )}
                </Button>
              </div>
            </Form>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="mb-4">Welcome to Kefi!</h2>
            <p className="text-secondary mb-4">
              Your account has been created successfully. You can now log in to start your learning journey.
            </p>
            <Button
              as={Link}
              to="/login"
              className={styles.primaryBtn}
            >
              Go to Login
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className={styles.signupContainer}>
        <Helmet>
          <title>Kefi | Signup</title>
        </Helmet>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} md={6} className="d-none d-md-block">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="h2 fw-bold text-primary mb-3">Kefi</h1>
              <p className="text-secondary mb-4">
                A social learning space for teens — to grow, share, and succeed together.
              </p>
              <ul className="list-unstyled">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    className="mb-3 d-flex align-items-center"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <i className={`${benefit.icon} text-primary me-2 fs-4`}></i>
                    <span>{benefit.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </Col>
          <Col xs={12} md={6}>
            <Card className={styles.signupCard}>
              <Card.Body className="p-4">
                {renderStep()}
                <Copy />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default Signup;