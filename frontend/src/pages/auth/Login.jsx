import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/auth/Signup.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') setUsername(value);
    if (name === 'password') setPassword(value);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      await login(username, password);
      navigate('/dashboard'); // Redirect on success
    } catch (err) {
      setErrorMessage(err.message || 'Invalid username or password');
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
              <h2>Sign In to Kefi</h2>
              <Form onSubmit={handleSubmit} className={styles.fadeIn}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={username}
                    onChange={handleChange}
                    required
                    autoFocus
                    placeholder="Enter your username"
                    className={styles.formInput}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className={styles.formInput}
                  />
                </Form.Group>

                {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}

                <Button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={isLoading || !username || !password}
                >
                  {isLoading ? <Spinner size="sm" animation="border" /> : 'Sign In'}
                </Button>

                <div className={styles.authLink}>
                  <p>
                    Forgot your password?{' '}
                    <Link to="/forgot-password" className={styles.link}>
                      Reset it
                    </Link>
                  </p>
                  <p>
                    Don't have an account?{' '}
                    <Link to="/signup" className={styles.link}>
                      Sign Up
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

export default Login;
