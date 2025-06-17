// Signup.jsx: Main signup page with multi-step form
import React, { useState } from 'react';
import { Container, Row, Col, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import zxcvbn from 'zxcvbn';
import { sendVerificationEmail, verifyCode, completeSignup } from '@utils/authService';
import EmailStep from '@components/auth/EmailStep';
import VerificationStep from '@components/auth/VerificationStep';
import ProfileStep from '@components/auth/ProfileStep';
import SuccessStep from '@components/auth/SuccessStep';
import styles from '@styles/auth/Signup.module.css';

// Main signup page component
const Signup = () => {
  // State for form data and UI control
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupPath, setSignupPath] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    strength: false,
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  // Gender options for dropdown
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  // Benefits for success step
  const benefits = [
    {
      icon: 'bi-award',
      text: 'Exclusive learning resources',
      description: 'Access premium content curated by experts',
    },
    {
      icon: 'bi-shield-lock',
      text: 'Secure and private',
      description: 'Your data is protected with enterprise-grade security',
    },
    {
      icon: 'bi-people',
      text: 'Join a community of learners',
      description: 'Connect with peers who share your interests',
    },
    {
      icon: 'bi-emoji-smile',
      text: 'Personalized experience',
      description: 'AI-powered recommendations tailored to you',
    },
  ];

  // Calculate progress percentage
  const progressPercentage = step === 4 ? 100 : Math.min(Math.round(((step - 1) / 3) * 100), 100);

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendVerificationEmail(email);
      setSuccessMessage('Verification code sent to your email.');
      setSignupPath('email');
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!verificationCode) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyCode(email, verificationCode);
      setSuccessMessage('Email verified successfully.');
      setStep(3);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate profile details
  const validateDetails = () => {
    if (!username || !fullName || !birthDate || !gender) {
      setErrorMessage('Please fill all required fields.');
      return false;
    }
    if (!passwordValidation.minLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return false;
    }
    if (!passwordValidation.uppercase) {
      setErrorMessage('Password must contain at least one uppercase letter.');
      return false;
    }
    if (!passwordValidation.lowercase) {
      setErrorMessage('Password must contain at least one lowercase letter.');
      return false;
    }
    if (!passwordValidation.number) {
      setErrorMessage('Password must contain at least one number.');
      return false;
    }
    if (!passwordValidation.strength) {
      setErrorMessage('Password is too weak. Please use a stronger password.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return false;
    }
    if (!acceptedTerms) {
      setErrorMessage('Please accept the terms and conditions.');
      return false;
    }
    return true;
  };

  // Handle profile submission
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateDetails()) return;

    setIsLoading(true);
    try {
      const userData = {
        email,
        username,
        password: newPassword,
        full_name: fullName,
        birth_date: birthDate,
        gender,
        is_student: isStudent,
      };

      const response = await completeSignup(userData);

      if (response.access && response.refresh) {
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
        setSuccessMessage('Account created successfully!');
        setStep(4);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete signup.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (step === 3 && signupPath === 'signup') {
      setStep(1);
      setSignupPath(null);
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  // Handle OAuth signup
  const handleOAuth = (provider) => {
    console.log(`Signing up with ${provider}`);
  };

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <EmailStep
            email={email}
            setEmail={setEmail}
            handleEmailSubmit={handleEmailSubmit}
            isLoading={isLoading}
            errorMessage={errorMessage}
            successMessage={successMessage}
            onOAuth={handleOAuth}
          />
        );
      case 2:
        return (
          <VerificationStep
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            handleVerificationSubmit={handleVerificationSubmit}
            isLoading={isLoading}
            errorMessage={errorMessage}
            successMessage={successMessage}
            email={email}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ProfileStep
            fullName={fullName}
            setFullName={setFullName}
            username={username}
            setUsername={setUsername}
            birthDate={birthDate}
            setBirthDate={setBirthDate}
            gender={gender}
            setGender={setGender}
            isStudent={isStudent}
            setIsStudent={setIsStudent}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            acceptedTerms={acceptedTerms}
            setAcceptedTerms={setAcceptedTerms}
            handleDetailsSubmit={handleDetailsSubmit}
            isLoading={isLoading}
            errorMessage={errorMessage}
            successMessage={successMessage}
            onBack={handleBack}
            passwordStrength={passwordStrength}
            setPasswordStrength={setPasswordStrength}
            passwordValidation={passwordValidation}
            setPasswordValidation={setPasswordValidation}
            setErrorMessage={setErrorMessage}
            genderOptions={genderOptions}
          />
        );
      case 4:
        return <SuccessStep navigate={navigate} benefits={benefits} />;
      default:
        return null;
    }
  };

  return (
    <Container className={styles.signupContainer}>
      <Helmet>
        <title>Sign Up - Kefi</title>
      </Helmet>
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          {/* Progress bar for signup steps */}
          <div className={styles.progressWrapper}>
            <ProgressBar now={progressPercentage} className={styles.progressBar} />
          </div>
          {/* Show error or success message at the top of the form for all steps except 4 */}
          {(!!errorMessage || !!successMessage) && step !== 4 && (
            <div style={{ marginBottom: '1.2rem' }}>
              {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
              {successMessage && <div className={styles.successText}>{successMessage}</div>}
            </div>
          )}
          {renderStep()}
        </Col>
      </Row>
    </Container>
  );
};

export default Signup;