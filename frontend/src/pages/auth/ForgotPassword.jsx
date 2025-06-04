import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { sendPasswordResetEmail, resetPassword } from '@utils/authService';
import zxcvbn from 'zxcvbn'; // Make sure you have this imported
import styles from '@styles/auth/ForgotPassword.module.css';
import { EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    strength: false,
  });
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(''); // Clear previous success messages
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(`Verification code sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const result = zxcvbn(value);
    setPasswordValidation({
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      strength: result.score >= 2,
    });
    if (error) setError('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(''); // Clear previous success messages

    // Validate password based on criteria
    if (!passwordValidation.minLength) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!passwordValidation.uppercase) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!passwordValidation.lowercase) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    if (!passwordValidation.number) {
      setError('Password must contain at least one number');
      return;
    }
    if (!passwordValidation.strength) {
      setError('Password is too weak');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, verificationCode, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
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

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Container className={styles.container}>
        <Helmet>
          <title>Kefi | Forgot Password</title>
        </Helmet>
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={styles.card}
        >
          <Card.Body>
            <h1 className={styles.title}>Forgot Password?</h1>
            <p className={styles.subtitle}>
              {step === 1
                ? "Enter your email address and we'll send you a verification code"
                : step === 2
                ? 'Enter the verification code and your new password'
                : 'Your password has been reset successfully!'}
            </p>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="emailStep"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleSendCode}
                  className={styles.form}
                >
                  <motion.div variants={itemVariants}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Email Address
                      </label>
                      <div className={styles.inputWrapper}>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={styles.input}
                          required
                          autoFocus
                          style={{ paddingRight: '40px' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={isLoading || !email}
                      aria-busy={isLoading}
                    >
                      {isLoading ? <span className={styles.spinner}></span> : 'Send Reset Code'}
                    </Button>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Link to="/login" className={styles.secondaryButton}>
                      Back to Login
                    </Link>
                  </motion.div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="resetStep"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  onSubmit={handleResetPassword}
                  className={styles.form}
                >
                  <motion.div variants={itemVariants}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className={styles.input}
                        style={{ paddingRight: '40px' }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="verificationCode" className={styles.label}>
                        Verification Code
                      </label>
                      <input
                        type="text"
                        id="verificationCode"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className={styles.input}
                        required
                        style={{ paddingRight: '40px' }}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="newPassword" className={styles.label}>
                        New Password
                      </label>
                      <div className={styles.inputWrapper}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="newPassword"
                          placeholder="At least 8 characters"
                          value={newPassword}
                          onChange={handlePasswordChange}
                          className={styles.input}
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeSlashFill /> : <EyeFill />}
                        </button>
                      </div>
                      {renderPasswordFeedback()}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="confirmPassword" className={styles.label}>
                        Confirm Password
                      </label>
                      <div className={styles.inputWrapper}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={styles.input}
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
                        </button>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={isLoading || !verificationCode || !newPassword || !confirmPassword}
                      aria-busy={isLoading}
                    >
                      {isLoading ? <span className={styles.spinner}></span> : 'Reset Password'}
                    </Button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      className={styles.secondaryButton}
                    >
                      Back to Email
                    </Button>
                  </motion.div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.div
                  key="successStep"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className={styles.successMessageContainer}
                >
                  <motion.div variants={itemVariants} className={styles.successIconWrapper}>
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={styles.successIcon}
                    >
                      <circle cx="12" cy="12" r="10" fill="var(--secondary)" />
                      <path
                        d="M8 12L11 15L16 9"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                  <motion.p variants={itemVariants} className={styles.successText}>
                    Your password has been reset successfully!
                  </motion.p>
                  <motion.p variants={itemVariants} className={styles.redirectText}>
                    You will be redirected to the login page shortly.
                  </motion.p>
                  <motion.div variants={itemVariants}>
                    <Button
                      onClick={() => navigate('/login')}
                      className={styles.primaryButton}
                    >
                      Go to Login
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card.Body>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default ForgotPassword;