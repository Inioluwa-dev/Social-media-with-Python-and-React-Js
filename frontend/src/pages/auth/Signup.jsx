import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  ProgressBar,
  Spinner
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '@styles/auth/Signup.module.css';
import OAuthButtons from '@OAuthButtons';
import Copy from '@Copy';
import VerificationForm from './VerificationForm';

const SignupPage = () => {
  // Load saved state from localStorage if available
  const savedState = JSON.parse(localStorage.getItem('signupState')) || {};
  
  // State management
  const [step, setStep] = useState(savedState.step || 1);
  const [signupPath, setSignupPath] = useState(savedState.signupPath || null);
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    fullName: '',
    nickname: '',
    username: '',
    birthDate: null,
    phone: '',
    country: '',
    state: '',
    gender: '',
    ...savedState.formData
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('signupState', JSON.stringify({
      step,
      signupPath,
      formData
    }));
  }, [step, signupPath, formData]);

  // Clear saved state when component unmounts (on successful completion)
  useEffect(() => {
    return () => {
      if (step === 11) {
        localStorage.removeItem('signupState');
      }
    };
  }, [step]);

  // Countries and states data
  const countries = ['United States', 'Canada', 'United Kingdom'];
  const states = {
    'United States': ['California', 'New York', 'Texas'],
    'Canada': ['Ontario', 'Quebec', 'British Columbia'],
    'United Kingdom': ['England', 'Scotland', 'Wales']
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, birthDate: date }));
  };

  const nextStep = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStep(prev => prev + 1);
      setIsLoading(false);
    }, 300);
  };

  const prevStep = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (signupPath === 'oauth' && step === 3) {
        setStep(1);
        setSignupPath(null);
      } else {
        setStep(prev => prev - 1);
      }
      setIsLoading(false);
    }, 300);
  };

  const handleEmailSubmit = () => {
    setSignupPath('email');
    nextStep();
  };

  const handleOAuth = () => {
    setSignupPath('oauth');
    setIsLoading(true);
    setTimeout(() => {
      setStep(3);
      setIsLoading(false);
    }, 500);
  };

  const handleVerificationComplete = (code) => {
    setFormData(prev => ({ ...prev, verificationCode: code }));
    nextStep();
  };

  // Step components
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
        onClick={handleEmailSubmit}
        className="w-100 primary-btn"
        disabled={isLoading || !formData.email}
      >
        {isLoading ? <Spinner size="sm" /> : 'Continue'}
      </Button>

      <div className={styles.orDivider}>OR</div>

      <div className="d-grid gap-2">
        <OAuthButtons onClick={handleOAuth} />
      </div>
    </div>
  );

  const StudentInfoStep = () => {
    const steps = [
      { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', required: true },
      { name: 'nickname', label: 'Nickname (Optional)', type: 'text', placeholder: 'What should we call you?', required: false },
      { name: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username', required: true },
      { name: 'birthDate', label: 'Date of Birth', type: 'date', required: true },
      { name: 'phone', label: 'Phone Number (Optional)', type: 'tel', placeholder: '+1 (123) 456-7890', required: false },
      { name: 'country', label: 'Country', type: 'select', options: ['Select country', ...countries], required: true },
      { name: 'state', label: 'State/Province', type: 'select', options: ['Select state', ...(states[formData.country] || [])], required: true },
      { name: 'gender', label: 'Gender (Optional)', type: 'radio', options: ['Male', 'Female', 'Other'], required: false }
    ];

    const currentStep = steps[step - 3];

    return (
      <div className="step-content">
        <Form.Group className="mb-4">
          <Form.Label>
            {currentStep.label}
            {currentStep.required && <span className="required-asterisk">*</span>}
          </Form.Label>
          
          {currentStep.type === 'select' ? (
            <Form.Select
              name={currentStep.name}
              value={formData[currentStep.name]}
              onChange={handleChange}
              className="form-input"
              autoFocus
              required={currentStep.required}
            >
              {currentStep.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          ) : currentStep.type === 'radio' ? (
            <div className="d-flex gap-4 mt-2">
              {currentStep.options.map(opt => (
                <Form.Check
                  key={opt}
                  type="radio"
                  name={currentStep.name}
                  label={opt}
                  value={opt}
                  checked={formData[currentStep.name] === opt}
                  onChange={handleChange}
                  className="radio-option"
                />
              ))}
            </div>
          ) : currentStep.type === 'date' ? (
            <DatePicker
              selected={formData.birthDate}
              onChange={handleDateChange}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select your birth date"
              className="form-control form-input"
              showYearDropdown
              yearDropdownItemNumber={100}
              scrollableYearDropdown
              maxDate={new Date()}
              autoFocus
              required={currentStep.required}
            />
          ) : (
            <Form.Control
              type={currentStep.type}
              name={currentStep.name}
              value={formData[currentStep.name]}
              onChange={handleChange}
              placeholder={currentStep.placeholder}
              className="form-input"
              autoFocus
              required={currentStep.required}
            />
          )}
        </Form.Group>

        <div className="d-flex gap-3">
          <Button 
            variant="outline-secondary" 
            onClick={prevStep}
            className="flex-grow-1 secondary-btn"
            disabled={isLoading}
          >
            Back
          </Button>
          <Button 
            onClick={nextStep}
            className="flex-grow-1 primary-btn"
            disabled={isLoading || (currentStep.required && !formData[currentStep.name])}
          >
            {isLoading ? <Spinner size="sm" /> : step === 10 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    );
  };

  // Progress calculation
  const progressPercentage = step === 1 ? 0 : step === 2 ? 50 : 50 + ((step - 2) * 6.25);

  // Switch case for step rendering
  const renderCurrentStep = () => {
    switch(step) {
      case 1:
        return <EmailStep />;
      case 2:
        return (
          <VerificationForm 
            initialEmail={formData.email}
            onComplete={handleVerificationComplete}
            onBack={prevStep}
          />
        );
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        return <StudentInfoStep />;
      case 11:
        return (
          <div className="text-center py-4 completion-message">
            <div className="completion-icon">🎉</div>
            <h4 className="completion-title">Welcome Aboard!</h4>
            <p className="completion-text">Your account has been created successfully.</p>
            <Button 
              variant="primary" 
              className="mt-3 primary-btn"
              onClick={() => setStep(1)}
            >
              Back to Login
            </Button>
          </div>
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <Container fluid className="signup-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={8} lg={6} xl={5}>
          <Card className="signup-card">
            <Card.Body className="p-4 p-md-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="signup-title mb-3">Join Our Community</h2>
                <ProgressBar 
                  now={progressPercentage} 
                  className="signup-progress" 
                  variant="primary"
                />
                <div className="step-indicator mt-2">
                  {step === 1 && 'Step 1: Email'}
                  {step === 2 && 'Step 2: Verification'}
                  {step >= 3 && step <= 10 && `Step 3: Profile (${step - 2}/8)`}
                  {step === 11 && 'Complete!'}
                </div>
              </div>

              {/* Dynamic Step Content */}
              {renderCurrentStep()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <footer>
        <Copy />
      </footer>
    </Container>
  );
};

export default SignupPage;