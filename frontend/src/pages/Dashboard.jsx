// src/components/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Container, Navbar, Card } from 'react-bootstrap';
import { AuthContext } from '@contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { fetchUserProfile } from '@utils/authService';
import Logout from '@components/auth/Logout'; // ✅ Add Logout component
import styles from '@styles/auth/Signup.module.css';

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user profile data on mount or when user is missing info
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        setUser(profile);
      } catch (err) {
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (!user || !user.username) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user, setUser]);

  if (loading) {
    return (
      <Container fluid className={styles.authContainer}>
        <div className="text-center py-5">
          <span className="spinner-border spinner-border-sm" />
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className={styles.authContainer} key={user?.id || 'dashboard'}>
      <Helmet key="dashboard">
        <title>Kefi | Dashboard</title>
      </Helmet>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Kefi Dashboard</Navbar.Brand>
          <Logout
            variant="outline-primary"
            size="sm"
            className={`${styles.likeBtn} d-flex align-items-center`}
            icon={<i className="bi bi-box-arrow-right me-2"></i>} // ✅ Pass icon as prop or child
          />
        </Container>
      </Navbar>
      <Card className={styles.authCard}>
        <Card.Body className={styles.cardBody}>
          <div className="text-center">
            <h2>Welcome, {user?.username || 'User'}!</h2>
            <p>Your Kefi journey starts here. Explore and connect!</p>
            {error && <p className="text-danger">{error}</p>}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;