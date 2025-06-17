// LoginDesktopWrapper.jsx: Handles desktop layout for login form
import React from 'react';
import { Card, Form } from 'react-bootstrap';
import styles from '@styles/auth/Login.module.css';
import LoginFormFields from './LoginFormFields';

// Component for desktop login layout
const LoginDesktopWrapper = ({ handleSubmit, formData, handleChange, showPassword, setShowPassword, errors, apiError, isLoggingIn }) => {
  return (
    <Card className={styles.loginCard}>
      <Card.Body>
        {/* Desktop header */}
        <Card.Title className="text-center mb-4">Login</Card.Title>
        {/* Desktop form */}
        <Form onSubmit={handleSubmit}>
          <LoginFormFields
            formData={formData}
            handleChange={handleChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            errors={errors}
            apiError={apiError}
            isLoggingIn={isLoggingIn}
            handleSubmit={handleSubmit}
          />
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LoginDesktopWrapper;