import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import styles from '@styles/auth/Login.module.css';
import Copy from '@Copy';
import OAuthButtons from '@OAuthButtons';

function LoginPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 575.98px)');
    setIsMobile(mediaQuery.matches);

    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  return (
    <>
      <Container className={styles.loginContainer}>
        <Row className={styles.row}>
          <Col xs={12} lg={6} className={styles.welcomeCol}>
            <h2 className={styles.welcomeText}>
              <span className={styles.kefiHighlight}>Kefi</span> <br />
              <p className={styles.logParagraph}>
                A social learning space for teens — to grow, share, and succeed together.
              </p>
            </h2>
          </Col>
          <Col xs={12} lg={6} className={styles.loginCol}>
            {isMobile ? (
              <div className={styles.mobileFormWrapper}>
                <h2 className={`${styles.kefiHighlight} text-center mb-3`}>Kefi</h2>
                <p className={`text-center ${styles.logParagraph}`}>
                  A social learning space for teens — to grow, share, and succeed together.
                </p>
                <Form className={styles.mobileForm}>
                  <Form.Group className="mb-3" controlId="emailMobile">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="passwordMobile">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Password"
                    />
                  </Form.Group>
                  <Button
                    variant=""
                    type="submit"
                    className={`w-100 ${styles.mobileButton}`}
                  >
                    Log in
                  </Button>
                </Form>
                <Card.Text className={`text-center mt-3 ${styles.forgotPassword}`}>
                  <a href="#">Forgot Password?</a>
                </Card.Text>
                <Button variant="" className={`w-100 mt-3 ${styles.createAccountButton}`}>
                  Create new account
                </Button>
                <div className={styles.orDivider}>OR</div>
                <OAuthButtons />
              </div>
            ) : (
              <Card className={styles.loginCard}>
                <Card.Body>
                  <Card.Title className="text-center mb-4">Login</Card.Title>
                  <Form>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter email"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Enter password"
                      />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">
                      Login
                    </Button>
                  </Form>
                  <Card.Text className={`text-center mt-3 ${styles.forgotPassword}`}>
                    <a href="#">Forgot Password?</a>
                  </Card.Text>
                  <Button variant="" className={`w-100 mt-3 ${styles.createAccountButton}`}>
                    Create new account
                  </Button>
                  <div className={styles.orDivider}>OR</div>
                  <OAuthButtons />
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      <footer className={styles.footer}>
        <Copy />
      </footer>
    </>
  );
}

export default LoginPage;