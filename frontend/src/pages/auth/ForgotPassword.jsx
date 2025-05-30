import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendPasswordResetEmail, resetPassword } from '@utils/authService';
import styles from '@styles/auth/ForgotPassword.module.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1 = email input, 2 = code + new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSuccessMessage('Reset code sent to your email.');
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setSuccessMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={styles.card}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="emailStep"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSendEmail}
              className={styles.form}
            >
              <motion.div variants={itemVariants}>
                <h2 className={styles.title}>Forgot Password</h2>
                <p className={styles.subtitle}>Enter your email to receive a reset code</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button 
                  type="submit" 
                  disabled={loading || !email}
                  className={styles.primaryButton}
                >
                  {loading ? (
                    <span className={styles.spinner}></span>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </motion.div>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={styles.errorMessage}
                >
                  {errorMessage}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={styles.successMessage}
                >
                  {successMessage}
                </motion.div>
              )}
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
                <h2 className={styles.title}>Reset Password</h2>
                <p className={styles.subtitle}>Check your email for the reset code</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className={styles.input}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className={styles.inputGroup}>
                  <label htmlFor="code" className={styles.label}>Reset Code</label>
                  <input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    required
                    onChange={(e) => setCode(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className={styles.inputGroup}>
                  <label htmlFor="newPassword" className={styles.label}>New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    required
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button 
                  type="submit" 
                  disabled={loading || !code || !newPassword || !confirmPassword}
                  className={styles.primaryButton}
                >
                  {loading ? (
                    <span className={styles.spinner}></span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className={styles.secondaryButton}
                >
                  Back to Email
                </button>
              </motion.div>

              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={styles.errorMessage}
                >
                  {errorMessage}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={styles.successMessage}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.successIcon}>
                    <circle cx="12" cy="12" r="10" fill="var(--secondary)"/>
                    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {successMessage}
                </motion.div>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;