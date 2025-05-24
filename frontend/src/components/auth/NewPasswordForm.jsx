
import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import styles from '@styles/auth/Signup.module.css';

const NewPasswordForm = ({ onSubmit, onBack, errorMessage, setErrorMessage, isLoading }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'newPassword') setNewPassword(value);
        if (name === 'confirmPassword') setConfirmPassword(value);
        setErrorMessage('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }
        onSubmit({ newPassword, confirmPassword });
    };

    return (
        <Form onSubmit={handleSubmit} className={styles.fadeIn}>
            <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                    type="password"
                    name="newPassword"
                    value={newPassword}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder="Enter new password"
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                    placeholder="Confirm new password"
                />
            </Form.Group>
            {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
            <div className={styles.buttonGroup}>
                <Button
                    variant="outline-secondary"
                    onClick={onBack}
                    className={styles.secondaryBtn}
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={isLoading || !newPassword || !confirmPassword}
                >
                    {isLoading ? <Spinner size="sm" /> : 'Submit'}
                </Button>
            </div>
        </Form>
    );
};

export default NewPasswordForm;
