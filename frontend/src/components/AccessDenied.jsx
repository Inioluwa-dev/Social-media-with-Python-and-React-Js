import React, { useContext } from 'react';
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

  const desiredPage = location.state?.from || '/dashboard';
  const errorMessage = location.state?.error || (
    isAuthenticated
      ? "You don't have permission to view this page."
      : `The page "${desiredPage}" requires you to log in to access it.`
  );

  const handleRedirect = () => {
    navigate('/login', { state: { from: desiredPage }, replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={styles.accessDeniedContainer}
    >
      <Helmet>
        <title>Kefi | Access Denied</title>
      </Helmet>
      <Container className="text-center py-5">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <i className="bi bi-lock-fill text-danger" style={{ fontSize: '4rem' }}></i>
        </motion.div>
        <Alert variant="warning" className="mt-4 mx-auto" style={{ maxWidth: '500px' }}>
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>{errorMessage}</p>
          {!isAuthenticated && (
            <p className="mb-0">
              <Button
                variant="link"
                className="p-0"
                onClick={handleRedirect}
              >
                Log in now
              </Button>{' '}
              to continue to your desired page.
            </p>
          )}
        </Alert>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4"
        >
          <Button
            variant="primary"
            onClick={handleRedirect}
            className={styles.kefiPrimaryBtn}
          >
            Go to Login
          </Button>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default AccessDenied;