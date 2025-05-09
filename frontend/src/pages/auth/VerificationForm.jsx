import React, { useRef, useState, useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';

const VerificationForm = ({ initialEmail, onComplete, onBack, length = 6 }) => {
  const inputsRef = useRef([]);
  const [digits, setDigits] = useState(Array(length).fill(''));
  const [timer, setTimer] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    if (resendDisabled) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setResendDisabled(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [resendDisabled]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    const { key } = e;
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    // Add actual resend logic here
    setDigits(Array(length).fill(''));
    inputsRef.current[0]?.focus();
    setResendDisabled(true);
    setTimer(60);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(digits.join(''));
  };

  return (
    <div className="step-content">
      <p className="verification-instruction">
        We sent a verification code to <strong>{initialEmail}</strong>
      </p>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label>Verification Code</Form.Label>
          <InputGroup className="verification-input-group justify-content-center">
            {digits.map((digit, i) => (
              <Form.Control
                key={i}
                type="text"
                inputMode="numeric"
                maxLength="1"
                ref={(el) => (inputsRef.current[i] = el)}
                value={digit}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="verification-digit text-center mx-1"
                aria-label={`Digit ${i + 1} of ${length} verification code`}
                required
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
            type="submit"
            className="flex-grow-1 primary-btn"
            disabled={digits.some(d => !d)}
          >
            Verify
          </Button>
        </div>

        <div className="text-center mt-3">
          <Button 
            variant="link" 
            onClick={handleResend}
            disabled={resendDisabled}
          >
            {resendDisabled ? `Resend code in ${timer}s` : 'Resend Code'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default VerificationForm;