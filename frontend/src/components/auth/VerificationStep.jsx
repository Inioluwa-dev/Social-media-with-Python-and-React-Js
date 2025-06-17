// VerificationStep.jsx: Handles the email verification step with code input
import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { ShieldLockFill, ArrowLeft } from 'react-bootstrap-icons';
import styles from '@styles/auth/Signup.module.css';

// Component for verification code input step
const VerificationStep = ({
  verificationCode,
  setVerificationCode,
  handleVerificationSubmit,
  isLoading,
  errorMessage,
  successMessage,
  email,
  onBack,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.fadeIn}
    >
      {/* Header with verification instructions */}
      <div className={styles.header}>
        <ShieldLockFill className={styles.successIcon} />
        <h2 className={styles.headerTitle}>Verify Your Email</h2>
        <p className={styles.headerSubtitle}>We've sent a verification code to {email}</p>
      </div>

      {/* Card container for the form */}
      <Card className={styles.signupCard}>
        <Card.Body>
          <Form onSubmit={handleVerificationSubmit}>
            {/* Verification code input field */}
            <Form.Group className={styles.inputGroup}>
              <Form.Label className={styles.formLabel}>Verification Code</Form.Label>
              <Form.Control
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the 6-digit code"
                className={`${styles.formInput} ${styles.textCenter}`}
                maxLength={6}
                required
                autoFocus
              />
            </Form.Group>

            {/* Error and success messages */}
            {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
            {successMessage && <div className={styles.successText}>{successMessage}</div>}

            {/* Submit button */}
            <Button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              <span>{isLoading ? 'Verifying...' : 'Verify Code'}</span>
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Back link to email step */}
      <div className={styles.oauthDivider}>
        <Button variant="link" onClick={onBack} className={styles.backLink}>
          <ArrowLeft />
          Back to Email
        </Button>
      </div>
    </motion.div>
  );
};

export default VerificationStep;