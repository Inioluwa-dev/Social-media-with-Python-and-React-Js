import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Container, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [counter, setCounter] = useState(10);
  const [showError, setShowError] = useState(!!location.state?.error);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const redirectPath = isAuthenticated ? '/dashboard' : '/login';
      navigate(redirectPath, { replace: true, state: { from: location.pathname + location.search } });
    }
  }, [counter, navigate, isAuthenticated, location]);

  useEffect(() => {
    if (location.state?.error) {
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={styles.notFoundContainer}
      key={location.pathname}
    >
      <Helmet>
        <title>Kefi | Page Not Found</title>
      </Helmet>
      <Container className="text-center py-5">
        {showError && (
          <Alert variant="danger" className="mx-auto mb-4" style={{ maxWidth: '500px' }} onClose={() => setShowError(false)} dismissible>
            <Alert.Heading>Access Issue</Alert.Heading>
            <p>{location.state.error}</p>
          </Alert>
        )}
        <motion.h1
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'mirror' }}
          className={styles.errorCode}
        >
          404
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={styles.errorMessage}
        >
          {isAuthenticated
            ? "The page you're looking for doesn't exist in your universe."
            : 'Log in to explore all that Kefi has to offer!'}
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className={styles.spaceIllustration}
        >
          <div className={styles.stars} />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className={styles.planet}
            style={{ width: '100px', height: '100px', top: '40px', left: '60px' }}
          />
          <motion.div
            animate={{ x: [-30, 30], y: [-20, 20], rotate: [-5, 5] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className={styles.astronaut}
            style={{ x: -20, y: -20 }}
          />
        </motion.div>
        <div className={styles.buttonGroup}>
          <Button
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login', { state: { from: location.pathname + location.search } })}
            className={styles.kefiPrimaryBtn}
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Go to Login'}
          </Button>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={styles.countdownText}
        >
          Auto-redirecting in {counter} seconds...
        </motion.p>
      </Container>
    </motion.div>
  );
};

export default NotFound;