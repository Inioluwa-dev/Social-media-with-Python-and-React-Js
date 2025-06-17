// ProfileStep.jsx: Handles profile completion with user details and password
import React from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PersonFill,
  CalendarFill,
  GenderAmbiguous,
  PersonBadgeFill,
  ArrowLeft,
} from 'react-bootstrap-icons';
import PasswordStep from './PasswordStep';
import styles from '@styles/auth/Signup.module.css';

// Component for profile completion step
const ProfileStep = ({
  fullName,
  setFullName,
  username,
  setUsername,
  birthDate,
  setBirthDate,
  gender,
  setGender,
  isStudent,
  setIsStudent,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  acceptedTerms,
  setAcceptedTerms,
  handleDetailsSubmit,
  isLoading,
  errorMessage,
  successMessage,
  onBack,
  passwordStrength,
  setPasswordStrength,
  passwordValidation,
  setPasswordValidation,
  setErrorMessage,
  genderOptions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.fadeIn}
    >
      {/* Header with profile instructions */}
      <div className={styles.header}>
        <PersonFill className={styles.successIcon} />
        <h2 className={styles.headerTitle}>Complete Your Profile</h2>
        <p className={styles.headerSubtitle}>Tell us a bit about yourself</p>
      </div>

      {/* Card container for the form */}
      <Card className={styles.signupCard}>
        <Card.Body>
          <Form onSubmit={handleDetailsSubmit}>
            <Row>
              {/* Full Name input */}
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label className={styles.formLabel}>
                    <PersonFill className={styles.benefitIcon} />
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className={styles.formInput}
                    required
                  />
                </Form.Group>
              </Col>
              {/* Username input */}
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label className={styles.formLabel}>
                    <PersonFill className={styles.benefitIcon} />
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className={styles.formInput}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              {/* Birth Date input */}
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label className={styles.formLabel}>
                    <CalendarFill className={styles.benefitIcon} />
                    Birth Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </Form.Group>
              </Col>
              {/* Gender selection */}
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label className={styles.formLabel}>
                    <GenderAmbiguous className={styles.benefitIcon} />
                    Gender
                  </Form.Label>
                  <Form.Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={styles.formInput}
                    required
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Student status toggle */}
            <Form.Group className={styles.inputGroup}>
              <Form.Label className={styles.formLabel}>
                <PersonBadgeFill className={styles.benefitIcon} />
                Are you a student?
              </Form.Label>
              <Form.Check
                type="switch"
                id="student-switch"
                label="Yes, I am a student"
                checked={isStudent}
                onChange={(e) => setIsStudent(e.target.checked)}
                className={styles.formLabel}
              />
            </Form.Group>

            {/* Password input component */}
            <PasswordStep
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              setErrorMessage={setErrorMessage}
              passwordStrength={passwordStrength}
              setPasswordStrength={setPasswordStrength}
              passwordValidation={passwordValidation}
              setPasswordValidation={setPasswordValidation}
            />

            {/* Terms and conditions checkbox */}
            <Form.Group className={styles.inputGroup}>
              <Form.Check
                type="checkbox"
                id="terms-check"
                label={
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className={styles.linkText}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className={styles.linkText}>
                      Privacy Policy
                    </Link>
                  </span>
                }
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
            </Form.Group>

            {/* Error and success messages */}
            {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
            {successMessage && <div className={styles.successText}>{successMessage}</div>}

            {/* Submit button */}
            <Button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Back link to verification step */}
      <div className={styles.oauthDivider}>
        <Button variant="link" onClick={onBack} className={styles.backLink}>
          <ArrowLeft />
          Back to Verification
        </Button>
      </div>
    </motion.div>
  );
};

export default ProfileStep;