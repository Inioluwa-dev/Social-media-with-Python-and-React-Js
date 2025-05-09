import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ProgressBar, Spinner } from 'react-bootstrap';
import styles from '@styles/auth/Signup.module.css';
import OAuthButtons from '@OAuthButtons';
import Copy from '@Copy';
import { Link } from 'react-router-dom';
import VerificationForm from '@components/auth/VerificationForm';
import NewPasswordForm from '@components/auth/NewPasswordForm';

// Main component for the signup page
const SignupPage = () => {
  // Load saved data from browser storage when page loads
  const savedState = JSON.parse(localStorage.getItem('signupState')) || {};

  // Manage the current step, signup method, form data, loading state, and date errors
  const [step, setStep] = useState(savedState.step || 1); // Track which step user is on
  const [signupPath, setSignupPath] = useState(savedState.signupPath || null); // Track if using email or OAuth
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
    newPassword: '',
    confirmPassword: '',
    ...savedState.formData
  });
  const [isLoading, setIsLoading] = useState(false); // Show loading spinner
  const [dateError, setDateError] = useState(''); // Store date validation errors

  // Manage day, month, and year for date picker
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // List of benefits shown on the side
  const benefits = [
    { icon: 'bi-award', text: "Exclusive learning resources" },
    { icon: 'bi-shield-lock', text: "Secure and private" },
    { icon: 'bi-people', text: "Join a community of learners" },
    { icon: 'bi-emoji-smile', text: "Personalized experience" }
  ];

  // Set date picker values if birthDate exists when component loads
  useEffect(() => {
    if (formData.birthDate) {
      const date = new Date(formData.birthDate);
      setDay(date.getDate());
      setMonth(date.getMonth() + 1);
      setYear(date.getFullYear());
    }
  }, [formData.birthDate]);

  // Save current state to browser storage whenever it changes
  useEffect(() => {
    localStorage.setItem('signupState', JSON.stringify({ step, signupPath, formData }));
  }, [step, signupPath, formData]);

  // Clear saved state when user finishes signup
  useEffect(() => {
    return () => {
      if (step === 12) localStorage.removeItem('signupState');
    };
  }, [step]);

  // List of countries and their states
  const countries = ['United States', 'Canada', 'United Kingdom'];
  const states = {
    'United States': ['California', 'New York', 'Texas'],
    'Canada': ['Ontario', 'Quebec', 'British Columbia'],
    'United Kingdom': ['England', 'Scotland', 'Wales']
  };

  // Check if date is valid and user is at least 13 years old
  const validateDate = (d, m, y) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    if (!d || !m || !y) {
      setDateError('Please select a complete date');
      return false;
    }

    const date = new Date(y, m - 1, d);
    if (date.getDate() !== d || date.getMonth() + 1 !== m || date.getFullYear() !== y) {
      setDateError('Please select a valid date');
      return false;
    }

    const age = currentYear - y - (currentMonth < m || (currentMonth === m && currentDay < d) ? 1 : 0);
    if (age < 13) {
      setDateError('You must be at least 13 years old');
      return false;
    }

    setDateError('');
    return true;
  };

  // Update form data when input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Update birth date when day, month, or year changes
  const handleDateChange = () => {
    if (validateDate(day, month, year)) {
      setFormData(prev => ({ ...prev, birthDate: new Date(year, month - 1, day) }));
    }
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
      if (signupPath === 'oauth' && step === 3) {
        setStep(1);
        setSignupPath(null);
      } else {
        setStep(prev => prev - 1);
      }
      setIsLoading(false);
    }, 300);
  };

  // Start email signup process
  const handleEmailSubmit = () => {
    setSignupPath('email');
    nextStep();
  };

  // Start OAuth signup process
  const handleOAuth = () => {
    setSignupPath('oauth');
    setIsLoading(true);
    setTimeout(() => {
      setStep(3);
      setIsLoading(false);
    }, 500);
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

  // Options for date picker
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, name: 'January' }, { value: 2, name: 'February' },
    { value: 3, name: 'March' }, { value: 4, name: 'April' },
    { value: 5, name: 'May' }, { value: 6, name: 'June' },
    { value: 7, name: 'July' }, { value: 8, name: 'August' },
    { value: 9, name: 'September' }, { value: 10, name: 'October' },
    { value: 11, name: 'November' }, { value: 12, name: 'December' }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

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

  // Component for student info steps
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
            <>
              <div className="d-flex gap-2 mb-2">
                <Form.Select
                  value={day}
                  onChange={(e) => { setDay(parseInt(e.target.value)); handleDateChange(); }}
                  className="form-input"
                  required
                >
                  <option value="">Day</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </Form.Select>
                <Form.Select
                  value={month}
                  onChange={(e) => { setMonth(parseInt(e.target.value)); handleDateChange(); }}
                  className="form-input"
                  required
                >
                  <option value="">Month</option>
                  {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                </Form.Select>
                <Form.Select
                  value={year}
                  onChange={(e) => { setYear(parseInt(e.target.value)); handleDateChange(); }}
                  className="form-input"
                  required
                >
                  <option value="">Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </Form.Select>
              </div>
              {dateError && <div className="text-danger small">{dateError}</div>}
            </>
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
            disabled={isLoading || (currentStep.required && !formData[currentStep.name]) || (currentStep.type === 'date' && (!day || !month || !year || dateError))}
          >
            {isLoading ? <Spinner size="sm" /> : 'Next'}
          </Button>
        </div>
      </div>
    );
  };

  // Calculate progress bar percentage
  const progressPercentage = step === 1 ? 0 : step === 2 ? 45 : step === 11 ? 100 : 45 + ((step - 2) * 5);

  // Show the current step based on the step number
  const renderCurrentStep = () => {
    switch(step) {
      case 1: return <EmailStep />;
      case 2: return <VerificationForm initialEmail={formData.email} onComplete={handleVerificationComplete} onBack={prevStep} />;
      case 3: case 4: case 5: case 6: case 7: case 8: case 9: case 10: return <StudentInfoStep />;
      case 11: return <NewPasswordForm onSubmit={handlePasswordSubmit} onBack={prevStep} isLoading={isLoading} />;
      case 12: return (
        <div className="text-center py-5 completion-message">
          <div className="completion-icon mb-4" style={{ fontSize: '5rem', color: 'var(--primary)' }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h4 className="completion-title mb-3" style={{ fontSize: '2rem', fontWeight: '700' }}>
            Welcome to Kefi! 🎉
          </h4>
          <p className="completion-text mb-4" style={{ fontSize: '1.1rem' }}>
            Your account has been created successfully. You're ready to start learning!
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

  // Main layout with branding and form
  return (
    <Container fluid className="signup-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={5} lg={4} xl={4} className="d-none d-md-flex align-items-center">
          <div className="brand-sidebar p-5">
            <div className="brand-logo mb-5">
              <h1 className="display-4 fw-bold text-primary">Kefi</h1>
              <p className="text-muted">Where learning meets joy</p>
            </div>
            <div className="benefits-list">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-item d-flex align-items-center mb-3">
                  <i className={`bi ${benefit.icon} benefit-icon me-3`}></i>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
            <div className="brand-footer mt-5">
              <p className="small text-muted">Already have an account? <a href="/login" className="text-primary">Sign in</a></p>
            </div>
          </div>
        </Col>
        <Col md={7} lg={6} xl={5}>
          <Card className="signup-card">
            <Card.Body className="p-4 p-md-5">
              <div className="d-flex d-md-none justify-content-center mb-4">
                <div className="text-center">
                  <h1 className="h3 fw-bold text-primary">Kefi</h1>
                  <p className="small text-muted">Where learning meets joy</p>
                </div>
              </div>
              <div className="text-center mb-4">
                <h2 className="signup-title mb-3">{step === 12 ? 'Welcome to Kefi!' : 'Join Kefi Today'}</h2>
                {step !== 12 && (
                  <>
                    <ProgressBar now={progressPercentage} className="signup-progress" variant="primary" />
                    <div className="step-indicator mt-2">
                      {step === 1 && 'Step 1: Email'}
                      {step === 2 && 'Step 2: Verification'}
                      {step >= 3 && step <= 10 && `Step 3: Profile (${step - 2}/8)`}
                      {step === 11 && 'Step 4: Set Password'}
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

export default SignupPage;