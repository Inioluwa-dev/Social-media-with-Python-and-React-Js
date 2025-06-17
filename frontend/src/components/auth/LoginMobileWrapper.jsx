// LoginMobileWrapper.jsx: Handles mobile layout for login form
import React from 'react';
import { Form } from 'react-bootstrap';
import styles from '@styles/auth/Login.module.css';
import LoginFormFields from './LoginFormFields';

// Component for mobile login layout
const LoginMobileWrapper = ({ handleSubmit, formData, handleChange, showPassword, setShowPassword, errors, apiError, isLoggingIn }) => {
  return (
    <div className={styles.mobileFormWrapper}>
      {/* Mobile header */}
      <h2 className={`${styles.kefiHighlight} text-center mb-3`}>Kefi</h2>
      <p className={`text-center ${styles.logParagraph}`}>
        A social learning space for teens — to grow, share, and succeed together.
      </p>
      {/* Mobile form */}
      <Form onSubmit={handleSubmit} className={styles.mobileForm}>
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
    </div>
  );
};

export default LoginMobileWrapper;