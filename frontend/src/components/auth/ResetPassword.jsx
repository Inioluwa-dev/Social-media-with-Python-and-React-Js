
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import styles from '@styles/auth/Signup.module.css';
import NewPasswordForm from '@components/auth/NewPasswordForm';
import { resetPassword } from '@utils/authService';

const ResetPassword = () => {
    const { code } = useParams();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleSubmit = async (passwordData) => {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            await resetPassword(email, code, passwordData.newPassword, setErrorMessage);
            setSuccessMessage('Password reset successfully. Please sign in.');
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
                                <h2>Set New Password</h2>
                                <p className="text-muted">Enter your email and new password.</p>
                            </div>
                            {successMessage ? (
                                <div className={`${styles.successContainer} ${styles.fadeIn}`}>
                                    <i className={`bi bi-check-circle-fill ${styles.successIcon}`}></i>
                                    <h4 className={styles.successTitle}>Success!</h4>
                                    <p className={styles.successText}>{successMessage}</p>
                                    <Button
                                        as={Link}
                                        to="/login"
                                        className={styles.primaryBtn}
                                    >
                                        Sign In
                                    </Button>
                                </div>
                            ) : (
                                <Form className={styles.fadeIn}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            required
                                            className={styles.formInput}
                                            autoFocus
                                            placeholder="Enter your email"
                                        />
                                    </Form.Group>
                                    {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
                                    <NewPasswordForm
                                        onSubmit={handleSubmit}
                                        onBack={() => window.history.back()}
                                        errorMessage={errorMessage}
                                        setErrorMessage={setErrorMessage}
                                        isLoading={isLoading}
                                    />
                                    <div className={styles.authLink}>
                                        <p>
                                            Back to{' '}
                                            <Link to="/login" className={styles.link}>
                                                Sign In
                                            </Link>
                                        </p>
                                    </div>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ResetPassword;
