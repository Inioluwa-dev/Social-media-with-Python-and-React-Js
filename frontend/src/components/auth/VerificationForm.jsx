
import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import styles from '@styles/auth/Signup.module.css';

const VerificationForm = ({
    onSubmit,
    onBack,
    errorMessage,
    setErrorMessage,
    isVerificationStep = false,
    email = '',
}) => {
    const [input, setInput] = useState(isVerificationStep ? '' : email);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setInput(e.target.value);
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSubmit(input);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className={styles.fadeIn}>
            <Form.Group className="mb-3">
                <Form.Label>{isVerificationStep ? 'Verification Code' : 'Email Address'}</Form.Label>
                <Form.Control
                    type={isVerificationStep ? 'text' : 'email'}
                    value={input}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder={isVerificationStep ? 'Enter 6-digit code' : 'Enter your email'}
                    autoFocus
                />
            </Form.Group>
            {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
            <div className={styles.buttonGroup}>
                {isVerificationStep && (
                    <Button
                        variant="outline-secondary"
                        onClick={onBack}
                        className={styles.secondaryBtn}
                    >
                        Back
                    </Button>
                )}
                <Button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={isLoading || !input}
                >
                    {isLoading ? (
                        <Spinner size="sm" />
                    ) : isVerificationStep ? (
                        'Verify Code'
                    ) : (
                        'Send Code'
                    )}
                </Button>
            </div>
        </Form>
    );
};

export default VerificationForm;
