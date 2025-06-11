import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ProgressBar } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import zxcvbn from 'zxcvbn';
import { sendVerificationEmail, verifyCode, completeSignup } from '@utils/authService';
import styles from '@styles/auth/Signup.module.css';
import Copy from '@Copy';
import OAuthButtons from '@OAuthButtons';
import { 
  EyeFill, 
  EyeSlashFill, 
  CheckCircleFill, 
  XCircleFill,
  EnvelopeFill,
  ShieldLockFill,
  PersonFill,
  CalendarFill,
  GenderAmbiguous,
  PersonBadgeFill,
  Check2Circle,
  ArrowLeft
} from 'react-bootstrap-icons';

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
  const [successMessage, setSuccessMessage] = useState('');
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const benefits = [
    { 
      icon: 'bi-award', 
      text: 'Exclusive learning resources',
      description: 'Access premium content curated by experts'
    },
    { 
      icon: 'bi-shield-lock', 
      text: 'Secure and private',
      description: 'Your data is protected with enterprise-grade security'
    },
    { 
      icon: 'bi-people', 
      text: 'Join a community of learners',
      description: 'Connect with peers who share your interests'
    },
    { 
      icon: 'bi-emoji-smile', 
      text: 'Personalized experience',
      description: 'AI-powered recommendations tailored to you'
    },
  ];

  // Calculate progress percentage based on current step
  const progressPercentage = Math.min(Math.round(((step - 1) / 4) * 100), 100);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendVerificationEmail(email);
      setSuccessMessage('Verification code sent to your email.');
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
    setSuccessMessage('');

    if (!verificationCode) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyCode(email, verificationCode);
      setSuccessMessage('Email verified successfully.');
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
    if (!acceptedTerms) {
      setErrorMessage('Please accept the terms and conditions.');
      return false;
    }
    return true;
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateDetails()) return;

    setIsLoading(true);
    try {
      const userData = {
        email,
        username,
        password: newPassword,
        full_name: fullName,
        birth_date: birthDate,
        gender,
        is_student: isStudent
      };

      const response = await completeSignup(userData);
      
      if (response.access && response.refresh) {
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        setSuccessMessage('Account created successfully!');
        setStep(4);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete signup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (step === 3 && signupPath === 'signup') {
      setStep(1);
      setSignupPath(null);
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  const handleOAuth = (provider) => {
    // Implement OAuth signup logic here
    console.log(`Signing up with ${provider}`);
  };

  const buttonStyle = {
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: '#fff',
    '&:hover': {
      backgroundColor: 'var(--secondary)',
      borderColor: 'var(--secondary)',
    }
  };

  const cardStyle = {
    backgroundColor: 'var(--bg)',
    border: '1px solid var(--text-secondary)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)'
  };

  const textStyle = {
    color: 'var(--text)'
  };

  const secondaryTextStyle = {
    color: 'var(--text-secondary)'
  };

  const formControlStyle = {
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    border: '1px solid var(--text-secondary)',
    borderRadius: '8px',
    padding: '12px',
    transition: 'all 0.3s ease',
    '&:focus': {
      borderColor: 'var(--primary)',
      boxShadow: '0 0 0 0.2rem rgba(59, 130, 246, 0.25)'
    }
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
            <div className="text-center mb-4">
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="h2 fw-bold" style={textStyle}>Create Account</h1>
                <p style={secondaryTextStyle}>Join our community of learners</p>
              </motion.div>
            </div>

            <Card style={cardStyle}>
              <Card.Body className="p-4">
                <Form onSubmit={handleEmailSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center gap-2" style={textStyle}>
                      <EnvelopeFill style={{ color: 'var(--primary)' }} />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="form-control-lg"
                      required
                      style={formControlStyle}
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="w-100 py-3"
                    style={{
                      ...buttonStyle,
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: '500'
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Continue with Email'}
                  </Button>

                  <div className="text-center mt-4">
                    <p style={secondaryTextStyle} className="mb-2">Or continue with</p>
                    <OAuthButtons onOAuth={handleOAuth} />
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <p style={secondaryTextStyle}>
                Already have an account?{' '}
                <Link to="/login" className="text-decoration-none" style={{ color: 'var(--primary)' }}>
                  Sign in
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
              <ShieldLockFill size={48} style={{ color: 'var(--primary)' }} className="mb-3" />
              <h2 className="h3 fw-bold" style={textStyle}>Verify Your Email</h2>
              <p style={secondaryTextStyle}>We've sent a verification code to {email}</p>
            </div>

            <Card style={cardStyle}>
              <Card.Body className="p-4">
                <Form onSubmit={handleVerificationSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label style={textStyle}>Verification Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter the 6-digit code"
                      className="form-control-lg text-center"
                      maxLength={6}
                      required
                      style={formControlStyle}
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="w-100 py-3"
                    style={{
                      ...buttonStyle,
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: '500'
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={handleBack}
                className="text-decoration-none"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft className="me-1" />
                Back to Email
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
              <PersonFill size={48} style={{ color: 'var(--primary)' }} className="mb-3" />
              <h2 className="h3 fw-bold" style={textStyle}>Complete Your Profile</h2>
              <p style={secondaryTextStyle}>Tell us a bit about yourself</p>
            </div>

            <Card style={cardStyle}>
              <Card.Body className="p-4">
                <Form onSubmit={handleDetailsSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="d-flex align-items-center gap-2" style={textStyle}>
                          <PersonFill style={{ color: 'var(--primary)' }} />
                          Full Name
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                          style={formControlStyle}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="d-flex align-items-center gap-2" style={textStyle}>
                          <PersonFill style={{ color: 'var(--primary)' }} />
                          Username
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Choose a username"
                          required
                          style={formControlStyle}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="d-flex align-items-center gap-2" style={textStyle}>
                          <CalendarFill style={{ color: 'var(--primary)' }} />
                          Birth Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          required
                          style={formControlStyle}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="d-flex align-items-center gap-2" style={textStyle}>
                          <GenderAmbiguous style={{ color: 'var(--primary)' }} />
                          Gender
                        </Form.Label>
                        <Form.Select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          required
                          style={formControlStyle}
                        >
                          <option value="">Select gender</option>
                          {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="d-flex align-items-center gap-2" style={textStyle}>
                      <PersonBadgeFill style={{ color: 'var(--primary)' }} />
                      Are you a student?
                    </Form.Label>
                    <Form.Check
                      type="switch"
                      id="student-switch"
                      label="Yes, I am a student"
                      checked={isStudent}
                      onChange={(e) => setIsStudent(e.target.checked)}
                      style={textStyle}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="d-flex align-items-center gap-2" style={textStyle}>
                      <ShieldLockFill style={{ color: 'var(--primary)' }} />
                      Password
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Create a strong password"
                        required
                        style={formControlStyle}
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-decoration-none"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {showPassword ? <EyeSlashFill /> : <EyeFill />}
                      </Button>
                    </div>
                    {passwordStrength && (
                      <div className="mt-2">
                        <ProgressBar
                          now={(passwordStrength.score + 1) * 25}
                          variant={
                            passwordStrength.score === 0
                              ? "danger"
                              : passwordStrength.score === 1
                              ? "warning"
                              : passwordStrength.score === 2
                              ? "info"
                              : "success"
                          }
                          style={{ height: '6px', borderRadius: '3px' }}
                        />
                        <small style={secondaryTextStyle}>
                          Password strength: {["Very weak", "Weak", "Fair", "Strong", "Very strong"][passwordStrength.score]}
                        </small>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={textStyle}>Confirm Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        placeholder="Confirm your password"
                        required
                        style={formControlStyle}
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-50 translate-middle-y text-decoration-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="terms-check"
                      label={
                        <span style={textStyle}>
                          I agree to the{' '}
                          <Link to="/terms" className="text-decoration-none" style={{ color: 'var(--primary)' }}>
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-decoration-none" style={{ color: 'var(--primary)' }}>
                            Privacy Policy
                          </Link>
                        </span>
                      }
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      required
                    />
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="w-100 py-3"
                    style={{
                      ...buttonStyle,
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      fontWeight: '500'
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={handleBack}
                className="text-decoration-none"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft className="me-1" />
                Back to Verification
              </Button>
            </div>
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
            <Check2Circle size={64} style={{ color: 'var(--secondary)' }} className="mb-4" />
            <h2 className="h3 fw-bold mb-3" style={textStyle}>Welcome to Kefi!</h2>
            <p style={secondaryTextStyle} className="mb-4">Your account has been created successfully.</p>
            
            <div className="row g-4 mb-4">
              {benefits.map((benefit, index) => (
                <Col key={index} md={6}>
                  <Card style={cardStyle}>
                    <Card.Body>
                      <i className={`bi ${benefit.icon} fs-3`} style={{ color: 'var(--primary)' }}></i>
                      <h5 className="h6 fw-bold" style={textStyle}>{benefit.text}</h5>
                      <p className="small mb-0" style={secondaryTextStyle}>{benefit.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </div>

            <Button
              variant="primary"
              className="px-4 py-3"
              style={{
                ...buttonStyle,
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderPasswordFeedback = () => {
    if (!newPassword) return null;

    const strengthClass = passwordStrength ? {
      0: 'weak',
      1: 'weak',
      2: 'medium',
      3: 'strong',
      4: 'veryStrong'
    }[passwordStrength.score] : '';

    return (
      <div className={styles.passwordFeedback}>
        <div className={styles.passwordStrengthMeter}>
          <div className={`${styles.strengthBar} ${styles[strengthClass]}`} />
        </div>
        <div className={styles.validationList}>
          <div className={`${styles.validationItem} ${passwordValidation.minLength ? styles.valid : ''}`}>
            <span className={`${styles.validationRadio} ${passwordValidation.minLength ? styles.valid : ''}`}>
              {passwordValidation.minLength ? <CheckCircleFill /> : <XCircleFill />}
            </span>
            At least 8 characters
          </div>
          <div className={`${styles.validationItem} ${passwordValidation.uppercase ? styles.valid : ''}`}>
            <span className={`${styles.validationRadio} ${passwordValidation.uppercase ? styles.valid : ''}`}>
              {passwordValidation.uppercase ? <CheckCircleFill /> : <XCircleFill />}
            </span>
            At least one uppercase letter
          </div>
          <div className={`${styles.validationItem} ${passwordValidation.lowercase ? styles.valid : ''}`}>
            <span className={`${styles.validationRadio} ${passwordValidation.lowercase ? styles.valid : ''}`}>
              {passwordValidation.lowercase ? <CheckCircleFill /> : <XCircleFill />}
            </span>
            At least one lowercase letter
          </div>
          <div className={`${styles.validationItem} ${passwordValidation.number ? styles.valid : ''}`}>
            <span className={`${styles.validationRadio} ${passwordValidation.number ? styles.valid : ''}`}>
              {passwordValidation.number ? <CheckCircleFill /> : <XCircleFill />}
            </span>
            At least one number
          </div>
          <div className={`${styles.validationItem} ${passwordValidation.strength ? styles.valid : ''}`}>
            <span className={`${styles.validationRadio} ${passwordValidation.strength ? styles.valid : ''}`}>
              {passwordValidation.strength ? <CheckCircleFill /> : <XCircleFill />}
            </span>
            Strong enough
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <div className={`${styles.validationItem} ${styles.invalid}`}>
              <span className={`${styles.validationRadio} ${styles.invalid}`}>
                <XCircleFill />
              </span>
              Passwords do not match
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          {renderStep()}
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;