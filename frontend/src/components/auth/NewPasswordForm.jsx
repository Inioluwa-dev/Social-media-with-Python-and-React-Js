import React, { useState } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import styles from '@styles/auth/Signup.module.css';

const NewPasswordForm = ({ onSubmit, onBack, isLoading }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = () => {
    if (validatePassword()) {
      onSubmit({ newPassword, confirmPassword });
    }
  };

  return (
    <div className="step-content">
      <Form.Group className="mb-4">
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="form-input"
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Confirm New Password</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="form-input"
        />
      </Form.Group>

      {passwordError && (
        <div className="text-danger small mb-3">{passwordError}</div>
      )}

      <div className="d-flex gap-3">
        <Button 
          variant="outline-secondary" 
          onClick={onBack}
          className="flex-grow-1 secondary-btn"
          disabled={isLoading}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          className="flex-grow-1 primary-btn"
          disabled={isLoading || !newPassword || !confirmPassword}
        >
          {isLoading ? <Spinner size="sm" /> : 'Set Password'}
        </Button>
      </div>
    </div>
  );
};

export default NewPasswordForm;