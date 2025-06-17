// EmailStep.jsx: Handles the first step of signup with email input and OAuth options
import React from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeFill } from 'react-bootstrap-icons';
import OAuthButtons from './OAuthButtons';
import styles from '@styles/auth/Signup.module.css';

// Component for email input step in signup process
const EmailStep = ({
  email,
  setEmail,
  handleEmailSubmit,
  isLoading,
  errorMessage,
  successMessage,
  onOAuth,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.fadeIn}
    >
      {/* Header with title and subtitle */}
      <div className={styles.header}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
          <h1 className={styles.headerTitle}>Create Account</h1>
          <p className={styles.headerSubtitle}>Join our community of learners</p>
        </motion.div>
      </div>

      {/* Card container for the form */}
      <Card className={styles.signupCard}>
        <Card.Body>
          <Form onSubmit={handleEmailSubmit}>
            {/* Email input field */}
            <Form.Group className={styles.inputGroup}>
              <Form.Label className={styles.formLabel}>
                <EnvelopeFill className={styles.benefitIcon} />
                Email Address
              </Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={styles.formInput}
                required
                autoFocus
              />
            </Form.Group>

            {/* Error and success messages */}
            {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
            {successMessage && <div className={styles.successText}>{successMessage}</div>}

            {/* Submit button */}
            <Button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              <span>{isLoading ? 'Sending...' : 'Continue with Email'}</span>
            </Button>

            {/* OAuth options */}
            <div className={styles.oauthDividerWithLine}><span>OR</span></div>
            <OAuthButtons onOAuth={onOAuth} />
          </Form>
        </Card.Body>
      </Card>

      {/* Sign-in link for existing users */}
      <div className={styles.oauthDivider}>
        <p>
          Already have an account?{' '}
          <Link to="/login" className={styles.linkText}>
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default EmailStep;