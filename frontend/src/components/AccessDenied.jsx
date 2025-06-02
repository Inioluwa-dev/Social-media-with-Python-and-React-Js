// src/components/AccessDenied.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/AccessDenied.module.css';

const AccessDenied = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [counter, setCounter] = useState(10);

  const errorMessage = location.state?.error ||
    (isAuthenticated
      ? "You don't have permission to view this page."
      : 'Please log in to access this page.');

  const redirectPath = isAuthenticated ? '/dashboard' : '/login';
  const redirectState = {
    from: location.state?.from || '/dashboard',
  };

  useEffect(() => {
    const timer = setInterval(() => setCounter((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (counter === 0) {
      navigate(redirectPath, { replace: true, state: redirectState });
    }
  }, [counter, navigate, redirectPath, redirectState]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.accessDeniedContainer}
      key={location.pathname}
    >
      <Helmet key={location.pathname}>
        <title>Kefi | Access Denied</title>
      </Helmet>
      <Container>
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>{errorMessage}</p>
        </Alert>
        <motion.h2
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={styles.accessDeniedTitle}
        >
          🚫 Restricted Area
        </motion.h2>
        <Button
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(redirectPath, { state: redirectState })}
          className={styles.kefiPrimaryBtn}
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
        </Button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={styles.countdownText}
        >
          Redirecting in {counter} seconds...
        </motion.p>
      </Container>
    </motion.div>
  );
};

export default AccessDenied;