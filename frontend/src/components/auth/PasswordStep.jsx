// PasswordStep.jsx: Handles password input and strength validation
import React, { useState } from 'react';
import { Form, Button, ProgressBar } from 'react-bootstrap';
import { EyeFill, EyeSlashFill, ShieldLockFill } from 'react-bootstrap-icons';
import zxcvbn from 'zxcvbn';
import styles from '@styles/auth/Signup.module.css';

// Component for password input with strength feedback
const PasswordStep = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  setErrorMessage,
  passwordStrength,
  setPasswordStrength,
  passwordValidation,
  setPasswordValidation,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle password input change and update strength
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const result = zxcvbn(value);
    setPasswordStrength(result);
    setPasswordValidation({
      minLength: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      strength: result.score >= 2,
    });
    setErrorMessage('');
  };

  // Handle confirm password input change
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setErrorMessage('');
  };

  // Render password strength feedback
  const renderPasswordFeedback = () => {
    if (!newPassword) return null;

    const strengthClass = passwordStrength
      ? {
          0: 'weak',
          1: 'weak',
          2: 'medium',
          3: 'strong',
          4: 'veryStrong',
        }[passwordStrength.score]
      : '';

    return (
      <div className={styles.passwordFeedback}>
        {/* Strength meter */}
        <div className={styles.passwordStrengthMeter}>
          <div className={`${styles.strengthBar} ${styles[strengthClass]}`} />
        </div>
        {/* Passwords do not match feedback */}
        {newPassword && confirmPassword && newPassword !== confirmPassword && (
          <div style={{ color: 'var(--alert)', fontWeight: 500, marginTop: '0.5rem' }}>
            Passwords do not match
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Password input field */}
      <Form.Group className={styles.inputGroup}>
        <Form.Label className={styles.formLabel}>
          <ShieldLockFill className={styles.benefitIcon} />
          Password
        </Form.Label>
        <div className={styles.inputGroup}>
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={handlePasswordChange}
            placeholder="Create a strong password"
            className={styles.formInput}
            required
          />
          <button
            type="button"
            className={styles.eyeBtn}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlashFill /> : <EyeFill />}
          </button>
        </div>
        {/* Password strength progress bar */}
        {passwordStrength && (
          <ProgressBar
            now={(passwordStrength.score + 1) * 25}
            variant={
              passwordStrength.score === 0
                ? 'danger'
                : passwordStrength.score === 1
                ? 'warning'
                : passwordStrength.score === 2
                ? 'info'
                : 'success'
            }
            className={styles.passwordStrengthMeter}
          />
        )}
      </Form.Group>

      {/* Confirm password input field */}
      <Form.Group className={styles.inputGroup}>
        <Form.Label className={styles.formLabel}>Confirm Password</Form.Label>
        <div className={styles.inputGroup}>
          <Form.Control
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Confirm your password"
            className={styles.formInput}
            required
          />
          <button
            type="button"
            className={styles.eyeBtn}
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeSlashFill /> : <EyeFill />}
          </button>
        </div>
      </Form.Group>


    </>
  );
};

export default PasswordStep;