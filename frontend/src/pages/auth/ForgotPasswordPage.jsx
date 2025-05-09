import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ProgressBar, Spinner } from 'react-bootstrap';
import VerificationForm from '@components/auth/VerificationForm';
import NewPasswordForm from '@components/auth/NewPasswordForm';
import Copy from '@Copy';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  // Load saved data from browser storage when page loads
  const savedState = JSON.parse(localStorage.getItem('forgotPasswordState')) || {};

  // Manage the current step, form data, and loading state
  const [step, setStep] = useState(savedState.step || 1); // Track which step user is on
  const [formData, setFormData] = useState({
    email: savedState.formData?.email || '',
    verificationCode: savedState.formData?.verificationCode || '',
    newPassword: savedState.formData?.newPassword || '',
    confirmPassword: savedState.formData?.confirmPassword || ''
  });
  const [isLoading, setIsLoading] = useState(false); // Show loading spinner

  // Save current state to browser storage whenever it changes
  useEffect(() => {
    localStorage.setItem('forgotPasswordState', JSON.stringify({ step, formData }));
  }, [step, formData]);

  // Clear saved state when password reset is complete
  useEffect(() => {
    return () => {
      if (step === 4) localStorage.removeItem('forgotPasswordState');
    };
  }, [step]);

  // Update form data when input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Move to next step with a small delay
  const nextStep = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStep(prev => prev + 1);
      setIsLoading(false);
    }, 300);
  };

  // Move to previous step with a small delay
  const prevStep = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStep(prev => prev - 1);
      setIsLoading(false);
    }, 300);
  };

  // Handle verification code submission
  const handleVerificationComplete = (code) => {
    setFormData(prev => ({ ...prev, verificationCode: code }));
    nextStep();
  };

  // Handle new password submission
  const handlePasswordSubmit = ({ newPassword, confirmPassword }) => {
    setFormData(prev => ({ ...prev, newPassword, confirmPassword }));
    nextStep();
  };

  // Component for the email step
  const EmailStep = () => (
    <div className="step-content">
      <Form.Group className="mb-4">
        <Form.Label>Email Address</Form.Label>
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
          autoFocus
        />
      </Form.Group>

      <Button 
        onClick={nextStep}
        className="w-100 primary-btn"
        disabled={isLoading || !formData.email}
      >
        {isLoading ? <Spinner size="sm" /> : 'Continue'}
      </Button>

      <div className="text-center mt-3">
        <p className="small text-muted">
          Remember your password? <a href="/login" className="text-primary">Back to Login</a>
        </p>
      </div>
    </div>
  );

  // Calculate progress bar percentage
  const progressPercentage = step === 1 ? 0 : step === 2 ? 33 : step === 3 ? 66 : 100;

  // Show the current step based on the step number
  const renderCurrentStep = () => {
    switch(step) {
      case 1: return <EmailStep />;
      case 2: return <VerificationForm initialEmail={formData.email} onComplete={handleVerificationComplete} onBack={prevStep} />;
      case 3: return <NewPasswordForm onSubmit={handlePasswordSubmit} onBack={prevStep} isLoading={isLoading} />;
      case 4: return (
        <div className="text-center py-5 completion-message">
          <div className="completion-icon mb-4" style={{ fontSize: '5rem', color: 'var(--primary)' }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h4 className="completion-title mb-3" style={{ fontSize: '2rem', fontWeight: '700' }}>
            Password Reset Successful! 🎉
          </h4>
          <p className="completion-text mb-4" style={{ fontSize: '1.1rem' }}>
            Your password has been updated. You're all set to log in!
          </p>
          <Button 
            variant="primary" 
            className="mt-3 primary-btn"
            as={Link} 
            to="/login"
            style={{ padding: '12px 24px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'; }}
          >
            Back to Login
          </Button>
        </div>
      );
      default: return <div>Invalid step</div>;
    }
  };

  // Main layout with form and footer
  return (
    <Container fluid className="signup-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={8} lg={6} xl={5}>
          <Card className="signup-card">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="signup-title mb-3">{step === 4 ? 'Password Reset Successful!' : 'Reset Your Password'}</h2>
                {step !== 4 && (
                  <>
                    <ProgressBar now={progressPercentage} className="signup-progress" variant="primary" />
                    <div className="step-indicator mt-2">
                      {step === 1 && 'Step 1: Email'}
                      {step === 2 && 'Step 2: Verification'}
                      {step === 3 && 'Step 3: New Password'}
                    </div>
                  </>
                )}
              </div>
              {renderCurrentStep()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <footer><Copy /></footer>
    </Container>
  );
};

export default ForgotPasswordPage;