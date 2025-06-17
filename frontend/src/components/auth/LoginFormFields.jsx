// LoginFormFields.jsx: Handles login form fields and submission
import React from 'react';
import { Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeFill, EyeSlashFill, Person, Lock, ArrowRight } from 'react-bootstrap-icons';
import OAuthButtons from '@OAuthButtons';
import styles from '@styles/auth/Login.module.css';

// Component for login form fields
const LoginFormFields = ({
  formData,
  handleChange,
  showPassword,
  setShowPassword,
  errors,
  apiError,
  isLoggingIn,
  handleSubmit,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Username or email input */}
      <Form.Group className="mb-3" controlId="identifier">
        <Form.Label>Username or Email</Form.Label>
        <div className={styles.inputWrapper}>
          <Form.Control
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            isInvalid={!!errors.identifier}
            placeholder="Enter username or email"
            className={`${styles.input} ${errors.identifier ? 'is-invalid' : ''}`}
          />
          <Person className={styles.inputIcon} />
        </div>
        <Form.Control.Feedback type="invalid">
          {errors.identifier}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Password input */}
      <Form.Group className="mb-2" controlId="password">
        <Form.Label>Password</Form.Label>
        <div className={styles.inputWrapper}>
          <Form.Control
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!errors.password}
            placeholder="Enter password"
            className={`${styles.input} ${errors.password ? 'is-invalid' : ''}`}
          />
          <Button
            variant="link"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlashFill /> : <EyeFill />}
          </Button>
          <Lock className={styles.inputIcon} />
        </div>
        <Form.Control.Feedback type="invalid">
          {errors.password}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Remember me and forgot password */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Group controlId="rememberMe">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="remember-me-tooltip">
                Keep me logged in for 30 days
              </Tooltip>
            }
          >
            <div>
              <Form.Check
                type="checkbox"
                label="Remember me"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
            </div>
          </OverlayTrigger>
        </Form.Group>
        <Link to="/forgot-password" className={styles.forgotPassword}>
          Forgot password?
        </Link>
      </div>

      {/* API error message */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.errorMessage}
        >
          {apiError}
        </motion.div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        className={styles.primaryButton}
        disabled={isLoggingIn}
      >
        <div className={styles.buttonContent}>
          {isLoggingIn ? (
            <>
              <div className={styles.spinner} />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <span>Login</span>
              <ArrowRight className={styles.buttonIcon} />
            </>
          )}
        </div>
      </Button>

      {/* OAuth divider and buttons */}
      <div className={styles.orDivider}>or</div>
      <OAuthButtons />

      {/* Signup link */}
      <div className="text-center mt-3">
        <p className="mb-0">
          Don't have an account?{' '}
          <Link to="/signup" className={styles.secondaryButton}>
            Create Account
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginFormFields;