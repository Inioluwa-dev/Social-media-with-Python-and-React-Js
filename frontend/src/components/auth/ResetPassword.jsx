import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import styles from '@styles/auth/Signup.module.css';
import { resetPassword } from '@utils/authService';

const ResetPassword = () => {
  const { code } = useParams(); // code from URL
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!email) {
      setErrorMessage('Please enter your email.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      // On success, redirect to login
      navigate('/login', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className={styles.authContainer}>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} sm={10} md={6} lg={4}>
          <Card className={styles.authCard}>
            <Card.Body className={styles.cardBody}>
              <div className={styles.header}>
                <h2>Set New Password</h2>
                <p className="text-muted">Enter your email and new password.</p>
              </div>
              <Form onSubmit={handleSubmit} className={styles.fadeIn}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage('');
                    }}
                    required
                    className={styles.formInput}
                    autoFocus
                    placeholder="Enter your email"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    required
                    className={styles.formInput}
                    placeholder="Enter new password"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    required
                    className={styles.formInput}
                    placeholder="Confirm new password"
                  />
                </Form.Group>
                {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
                <Button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isLoading || !email || !newPassword || !confirmPassword}
                >
                  {isLoading ? <Spinner size="sm" /> : 'Reset Password'}
                </Button>
                <div className={styles.authLink}>
                  <p>
                    Back to{' '}
                    <Link to="/login" className={styles.link}>
                      Sign In
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
