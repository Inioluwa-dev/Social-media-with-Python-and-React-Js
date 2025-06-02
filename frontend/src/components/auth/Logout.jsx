// src/components/auth/Logout.jsx
import React, { useState, useContext } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/auth/Login.module.css';

const Logout = ({ variant = 'danger', size = 'md', className = '', icon = null }) => {
  const { logout, error: authError } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setIsLoading(true);
    setError('');
    try {
      await logout();
    } catch (err) {
      setError(authError || 'Failed to log out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.logoutContainer} ${className}`}>
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          <Alert.Heading>Logout Failed</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      <Button
        variant={variant}
        size={size}
        onClick={handleLogout}
        disabled={isLoading}
        className={styles.kefiPrimaryBtn}
        title="Sign Out"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="me-2" />
            Logging out...
          </>
        ) : (
          <>
            {icon}
            Sign Out
          </>
        )}
      </Button>
    </div>
  );
};

export default Logout;