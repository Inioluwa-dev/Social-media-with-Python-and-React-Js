
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from '@styles/auth/Signup.module.css';
import { updateProfile } from '@utils/authService';

const CompleteProfile = () => {
    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [isUniversity, setIsUniversity] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setIsUniversity(checked);
        } else {
            if (name === 'nickname') setNickname(value);
            if (name === 'phone') setPhone(value);
            if (name === 'country') setCountry(value);
            if (name === 'state') setState(value);
        }
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        const profileData = { nickname, phone, country, state, is_university: isUniversity };
        try {
            await updateProfile(profileData, setErrorMessage);
            navigate('/dashboard', { replace: true });
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
                                <h2>Complete Your Profile</h2>
                            </div>
                            <Form onSubmit={handleSubmit} className={styles.fadeIn}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nickname</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nickname"
                                        value={nickname}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                        placeholder="Enter your nickname"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={phone}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                        placeholder="Enter your phone number"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="country"
                                        value={country}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                        placeholder="Enter your country"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="state"
                                        value={state}
                                        onChange={handleChange}
                                        className={styles.formInput}
                                        placeholder="Enter your state"
                                    />
                                </Form.Group>
                                <Form.Group className={`mb-3 ${styles.checkbox}`}>
                                    <Form.Check
                                        type="checkbox"
                                        label="I am a university student"
                                        name="is_university"
                                        checked={isUniversity}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
                                <Button
                                    type="submit"
                                    className={styles.primaryBtn}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Spinner size="sm" /> : 'Save Profile'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CompleteProfile;
