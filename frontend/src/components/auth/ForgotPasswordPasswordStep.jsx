// ForgotPasswordPasswordStep.jsx: Handles verification code and password input for password reset
import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Key, ArrowRight, ArrowLeft, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';
import styles from '@styles/auth/ForgotPassword.module.css';

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

// Component for verification code and password input step in password reset
const ForgotPasswordPasswordStep = ({
  verificationCode,
  setVerificationCode,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handlePasswordChange,
  passwordValidation,
  handleResetPassword,
  isLoading,
  error,
  success,
  setStep,
}) => {
  // Render password validation feedback
  const renderPasswordFeedback = () => {
    return (
      <div className={styles.passwordFeedback}>
        <div className={passwordValidation.minLength ? styles.valid : styles.invalid}>
          • At least 8 characters
        </div>
        <div className={passwordValidation.uppercase ? styles.valid : styles.invalid}>
          • At least one uppercase letter
        </div>
        <div className={passwordValidation.lowercase ? styles.valid : styles.invalid}>
          • At least one lowercase letter
        </div>
        <div className={passwordValidation.number ? styles.valid : styles.invalid}>
          • At least one number
        </div>
        <div className={passwordValidation.strength ? styles.valid : styles.invalid}>
          • Password strength: {passwordValidation.strength ? 'Strong' : 'Weak'}
        </div>
      </div>
    );
  };

  return (
    <motion.form
      key="resetStep"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleResetPassword}
      className={styles.form}
    >
      {/* Error and success messages */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Verification code input */}
      <motion.div variants={itemVariants}>
        <div className={styles.inputGroup}>
          <label htmlFor="verificationCode" className={styles.label}>
            Verification Code
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className={styles.input}
              required
              placeholder="Enter verification code"
            />
            <Key className={styles.inputIcon} />
          </div>
        </div>
      </motion.div>

      {/* New password input */}
      <motion.div variants={itemVariants}>
        <motion.div className={styles.inputGroup}>
          <div className="form-group">
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <div className={styles.inputWrapper}>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className={styles.input}
                  required
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </button>
              </div>
            </div>
            {renderPasswordFeedback()}
          </div>
        </motion.div>
        </motion.div>

      {/* Confirm password input */}
      <motion.div variants={itemVariants}>
        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <div className={styles.inputWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Submit button */}
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          className={styles.primaryButton}
          disabled={isLoading || !verificationCode || !newPassword || !confirmPassword}
        >
          <div className={styles.buttonContent}>
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                Reset Password
                <ArrowRight className={styles.buttonIcon} />
              </>
            )}
          </div>
        </Button>
      </motion.div>

      {/* Back to email button */}
      <motion.div variants={itemVariants}>
        <Button
          type="button"
          onClick={() => setStep(1)}
          className={styles.secondaryButton}
        >
          <div className={styles.buttonContent}>
            <ArrowLeft className={styles.buttonIcon} />
            Back to Email
          </div>
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default ForgotPasswordPasswordStep;