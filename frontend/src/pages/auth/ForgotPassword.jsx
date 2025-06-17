// ForgotPassword.jsx: Main forgot password page with multi-step form
import React, { useState } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { sendPasswordResetEmail, resetPassword, validateResetCode } from '@utils/authService';
import zxcvbn from 'zxcvbn';
import styles from '@styles/auth/ForgotPassword.module.css';
import ForgotPasswordEmailStep from '@components/auth/ForgotPasswordEmailStep';
import ForgotPasswordPasswordStep from '@components/auth/ForgotPasswordPasswordStep';
import ForgotPasswordSuccessStep from '@components/auth/ForgotPasswordSuccessStep';

// Main forgot password page component
const ForgotPassword = () => {
  // State for form data and UI control
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

  // Handle sending verification code
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(`Verification code sent to ${email}. Please check your email.`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate verification code
  const validateCode = async () => {
    try {
      await validateResetCode(email, verificationCode);
      return true;
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      return false;
    }
  };

  // Handle password input change with zxcvbn validation
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

  // Handle password reset submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
      setError('Password is too weak. Please make it stronger.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Validate the code
      const isCodeValid = await validateCode();
      if (!isCodeValid) {
        setIsLoading(false);
        return;
      }

      // Reset the password
      await resetPassword(email, verificationCode, newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setStep(3);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ForgotPasswordEmailStep
            email={email}
            setEmail={setEmail}
            handleSendCode={handleSendCode}
            isLoading={isLoading}
            error={error}
            success={success}
          />
        );
      case 2:
        return (
          <ForgotPasswordPasswordStep
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            handlePasswordChange={handlePasswordChange}
            passwordValidation={passwordValidation}
            handleResetPassword={handleResetPassword}
            isLoading={isLoading}
            error={error}
            success={success}
            setStep={setStep}
          />
        );
      case 3:
        return <ForgotPasswordSuccessStep navigate={navigate} />;
      default:
        return null;
    }
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
            {/* Header for all steps */}
            <h1 className={styles.title}>Forgot Password?</h1>
            <p className={styles.subtitle}>
              {step === 1
                ? "Enter your email address and we'll send you a verification code"
                : step === 2
                ? 'Enter the verification code and your new password'
                : 'Your password has been reset successfully!'}
            </p>

            {/* Render step content */}
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </Card.Body>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default ForgotPassword;