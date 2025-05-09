import React, { useState, useEffect } from 'react';
import { Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import styles from '@styles/auth/Signup.module.css';

const VerificationForm = ({ initialEmail, onComplete, onBack }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync with initialEmail prop if it changes
  useEffect(() => {
    // No action needed here as initialEmail is just for display
  }, [initialEmail]);

  const handleChange = (index, value) => {
    const newCode = verificationCode.padEnd(6, ' ').split('');
    newCode[index] = value;
    const updatedCode = newCode.join('').trim();
    setVerificationCode(updatedCode);

    if (value && index < 5) {
      document.querySelectorAll('.verification-digit')[index + 1].focus();
    }
  };

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      onComplete(verificationCode);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="step-content">
      <p className="verification-instruction">
        We sent a verification code to <strong>{initialEmail}</strong>
      </p>

      <Form.Group className="mb-4">
        <Form.Label>Verification Code</Form.Label>
        <InputGroup className="verification-input-group">
          {[...Array(6)].map((_, i) => (
            <Form.Control
              key={i}
              type="text"
              maxLength="1"
              className="verification-digit text-center"
              value={verificationCode[i] || ''}
              onChange={(e) => handleChange(i, e.target.value)}
              aria-label={`Verification Digit ${i + 1}`}
              role="textbox"
              autoFocus={i === 0}
            />
          ))}
        </InputGroup>
      </Form.Group>

      <div className="d-flex gap-3">
        <Button 
          variant="outline-secondary" 
          onClick={onBack}
          className="flex-grow-1 secondary-btn"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          className="flex-grow-1 primary-btn"
          disabled={isLoading || verificationCode.length < 6}
        >
          {isLoading ? <Spinner size="sm" /> : 'Verify'}
        </Button>
      </div>
    </div>
  );
};

export default VerificationForm;