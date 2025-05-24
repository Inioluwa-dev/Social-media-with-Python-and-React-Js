
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from '@styles/auth/Signup.module.css';
import { sendPasswordResetEmail } from '@utils/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setEmail(e.target.value);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await sendPasswordResetEmail(email, setErrorMessage);
            setSuccessMessage('Password reset email sent. Check your inbox.');
            setEmail('');
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
                                <h2>Reset Your Password</h2>
                                <p className="text-muted">Enter your email to receive a reset code.</p>
                            </div>
                            <Form onSubmit={handleSubmit} className={styles.fadeIn}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={handleChange}
                                        required
                                        className={styles.formInput}
                                        autoFocus
                                        placeholder="Enter your email"
                                    />
                                </Form.Group>
                                {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
                                {successMessage && <div className={styles.successText}>{successMessage}</div>}
                                <Button
                                    type="submit"
                                    className={styles.primaryBtn}
                                    disabled={isLoading || !email}
                                >
                                    {isLoading ? <Spinner size="sm" /> : 'Send Reset Email'}
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

export default ForgotPassword;
