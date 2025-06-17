// ForgotPasswordSuccessStep.jsx: Displays success message after password reset
import React from 'react';
import { Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
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

// Component for success message after password reset
const ForgotPasswordSuccessStep = ({ navigate }) => {
  return (
    <motion.div
      key="successStep"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={styles.successMessageContainer}
    >
      {/* Success icon */}
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

      {/* Success message */}
      <motion.p variants={itemVariants} className={styles.successText}>
        Your password has been reset successfully!
      </motion.p>

      {/* Redirect notice */}
      <motion.p variants={itemVariants} className={styles.redirectText}>
        You will be redirected to the login page shortly.
      </motion.p>

      {/* Navigate to login button */}
      <motion.div variants={itemVariants}>
        <Button
          onClick={() => navigate('/login')}
          className={styles.primaryButton}
        >
          Go to Login
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPasswordSuccessStep;