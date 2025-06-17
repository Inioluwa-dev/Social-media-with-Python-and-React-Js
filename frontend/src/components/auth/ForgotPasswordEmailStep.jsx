// ForgotPasswordEmailStep.jsx: Handles email input for password reset
import React from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Envelope, ArrowRight, ArrowLeft } from 'react-bootstrap-icons';
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

// Component for email input step in password reset process
const ForgotPasswordEmailStep = ({ email, setEmail, handleSendCode, isLoading, error, success }) => {
  return (
    <motion.form
      key="emailStep"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSendCode}
      className={styles.form}
    >
      {/* Error and success messages */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Email input field */}
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
              placeholder="Enter your email"
            />
            <Envelope className={styles.inputIcon} />
          </div>
        </div>
      </motion.div>

      {/* Submit button */}
      <motion.div variants={itemVariants}>
        <Button
          type="submit"
          className={styles.primaryButton}
          disabled={isLoading || !email}
        >
          <div className={styles.buttonContent}>
            {isLoading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                Send Reset Code
                <ArrowRight className={styles.buttonIcon} />
              </>
            )}
          </div>
        </Button>
      </motion.div>

      {/* Back to login link */}
      <motion.div variants={itemVariants}>
        <Link to="/login" className={styles.secondaryButton}>
          <div className={styles.buttonContent}>
            <ArrowLeft className={styles.buttonIcon} />
            Back to Login
          </div>
        </Link>
      </motion.div>
    </motion.form>
  );
};

export default ForgotPasswordEmailStep;