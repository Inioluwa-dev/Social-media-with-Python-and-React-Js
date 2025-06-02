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
  const [showError, setShowError] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      const redirectPath = isAuthenticated ? '/dashboard' : '/login';
      navigate(redirectPath, { replace: true, state: location.state });
    }
  }, [counter, navigate, isAuthenticated, location.state]);

  useEffect(() => {
    if (location.state?.error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.notFoundContainer}
      key={location.pathname}
    >
      <Helmet>
        <title>Kefi | Page Not Found</title>
      </Helmet>
      <Container>
        {showError && (
          <Alert variant="danger" className="mb-4" onClose={() => setShowError(false)} dismissible>
            <Alert.Heading>Access Denied</Alert.Heading>
            <p>{location.state.error}</p>
          </Alert>
        )}
        <motion.h1
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'mirror',
          }}
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
            : 'You need to be logged in to access this cosmic dimension.'}
        </motion.p>
        <div className={styles.spaceIllustration}>
          <div className={styles.stars} />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className={styles.planet}
            style={{
              width: '120px',
              height: '120px',
              top: '50px',
              left: '50px',
            }}
          />
          <motion.div
            animate={{
              x: [-50, 50, -50],
              y: [-30, 30, -30],
              rotate: [-10, 10, -10],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={styles.astronaut}
            style={{
              x: -40,
              y: -40,
            }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className={styles.planet}
            style={{
              width: '60px',
              height: '60px',
              bottom: '30px',
              right: '40px',
              background: 'linear-gradient(180deg, #a1c4fd 0%, #c2e9fb 100%)',
            }}
          />
        </div>
        <div className={styles.buttonGroup}>
          <Button
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login', { state: location.state })}
            className={styles.kefiPrimaryBtn}
          >
            {isAuthenticated ? 'Back to Dashboard' : 'Go to Login'}
          </Button>
          {!isAuthenticated && (
            <Button
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login', { state: location.state })}
              className={styles.kefiSecondaryBtn}
            >
              Login
            </Button>
          )}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={styles.countdownText}
        >
          {isAuthenticated
            ? `Auto-redirecting to dashboard in ${counter} seconds...`
            : `Auto-redirecting to login page in ${counter} seconds...`}
        </motion.p>
      </Container>
    </motion.div>
  );
};

export default NotFound;