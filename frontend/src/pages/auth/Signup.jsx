import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import VerificationForm from '@components/auth/VerificationForm';
import NewPasswordForm from '@components/auth/NewPasswordForm';
import styles from '@styles/auth/Signup.module.css';
import { sendVerificationEmail, verifyCode, completeSignup } from '@utils/authService';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [isStudent, setIsStudent] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleEmailSubmit = async (emailInput) => {
        console.log('Step 1 - Email submitted:', emailInput);
        setErrorMessage('');
        try {
            await sendVerificationEmail(emailInput);
            setEmail(emailInput);
            setStep(2);
        } catch (err) {
            console.error('Email submit error:', err.response?.data || err);
            setErrorMessage(err.message || 'Failed to send verification code');
        }
    };

    const handleVerificationSubmit = async (code) => {
        console.log('Step 2 - Verification code submitted:', code);
        setErrorMessage('');
        try {
            await verifyCode(email, code);
            setStep(3);
        } catch (err) {
            console.error('Verification error:', err.response?.data || err);
            setErrorMessage(err.message || 'Invalid verification code');
        }
    };

    const handleDetailsSubmit = async (passwordObj) => {
        console.log('Step 3 - Collected data:', {
            email,
            username,
            password: passwordObj,
            fullName,
            birthDate,
            gender,
            isStudent
        });

        // Validation
        if (!username || !fullName || !birthDate || !gender) {
            setErrorMessage('Please fill all required fields');
            return;
        }

        if (passwordObj.newPassword.length < 8) {
            setErrorMessage('Password must be at least 8 characters');
            return;
        }

        if (passwordObj.newPassword !== passwordObj.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setErrorMessage('');
        const formattedDate = new Date(birthDate).toISOString().split('T')[0];

        const signupData = {
            email,
            username,
            password: passwordObj.newPassword,
            full_name: fullName,
            birth_date: formattedDate,
            gender,
            is_student: Boolean(isStudent)
        };

        try {
            console.log('Sending signup data:', signupData);
            const response = await completeSignup(signupData);
            console.log('Signup response:', response);
            setStep(4);
        } catch (err) {
            console.error('Signup error:', err.response?.data || err);
            setErrorMessage(
                err.response?.data?.message ||
                err.message ||
                'Failed to complete signup'
            );
        }
    };

    const handleBack = () => {
        setErrorMessage('');
        if (step === 2) {
            setStep(1);
        } else if (step === 3) {
            setStep(2);
        }
    };

    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        setErrorMessage('');
    };

    return (
        <Container fluid className={styles.authContainer}>
            <Row className="justify-content-center align-items-center min-vh-100">
                <Col xs={12} sm={10} md={6} lg={4}>
                    <Card className={styles.authCard}>
                        <Card.Body className={styles.cardBody}>
                            <div className={styles.header}>
                                <h2>{step === 4 ? 'Welcome to Kefi!' : 'Create Your Account'}</h2>
                            </div>
                            {step === 1 && (
                                <VerificationForm
                                    onSubmit={handleEmailSubmit}
                                    errorMessage={errorMessage}
                                    setErrorMessage={setErrorMessage}
                                />
                            )}
                            {step === 2 && (
                                <VerificationForm
                                    onSubmit={handleVerificationSubmit}
                                    onBack={handleBack}
                                    errorMessage={errorMessage}
                                    setErrorMessage={setErrorMessage}
                                    isVerificationStep
                                    email={email}
                                />
                            )}
                            {step === 3 && (
                                <div className={styles.fadeIn}>
                                    <NewPasswordForm
                                        onSubmit={handleDetailsSubmit}
                                        onBack={handleBack}
                                        errorMessage={errorMessage}
                                        setErrorMessage={setErrorMessage}
                                    />
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label">Full Name</label>
                                            <input
                                                type="text"
                                                className={`form-control ${styles.formInput}`}
                                                value={fullName}
                                                onChange={handleInputChange(setFullName)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Username</label>
                                            <input
                                                type="text"
                                                className={`form-control ${styles.formInput}`}
                                                value={username}
                                                onChange={handleInputChange(setUsername)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Birth Date</label>
                                            <input
                                                type="date"
                                                className={`form-control ${styles.formInput}`}
                                                value={birthDate}
                                                onChange={handleInputChange(setBirthDate)}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Gender</label>
                                            <select
                                                className={`form-control ${styles.formInput}`}
                                                value={gender}
                                                onChange={handleInputChange(setGender)}
                                                required
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className={`form-check mb-3 ${styles.checkbox}`}>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={isStudent}
                                                onChange={(e) => {
                                                    setIsStudent(e.target.checked);
                                                    setErrorMessage('');
                                                }}
                                            />
                                            <label className="form-check-label">I am a student</label>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {step === 4 && (
                                <div className={`${styles.successContainer} ${styles.fadeIn}`}>
                                    <i className={`bi bi-check-circle-fill ${styles.successIcon}`}></i>
                                    <h4 className={styles.successTitle}>Account Created!</h4>
                                    <p className={styles.successText}>
                                        Your account has been successfully created. Please sign in to continue.
                                    </p>
                                    <Button
                                        onClick={() => navigate('/login')}
                                        className={styles.primaryBtn}
                                    >
                                        Sign In
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Signup;
