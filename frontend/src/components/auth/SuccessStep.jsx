// SuccessStep.jsx: Displays success message and benefits after signup
import React from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Check2Circle } from 'react-bootstrap-icons';
import styles from '@styles/auth/Signup.module.css';

// Component for signup success page
const SuccessStep = ({ navigate, benefits }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.fadeIn}
      style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}
    >
      {/* Success header */}
      <Check2Circle className={styles.successIcon} />
      <h2 className={styles.headerTitle}>Welcome to Kefi!</h2>
      <p className={styles.headerSubtitle}>Your account has been created successfully.</p>

      {/* Benefits section */}
      <div className={styles.benefitsSection} style={{ textAlign: 'left' }}>
        <Row>
          {benefits.map((benefit, index) => (
            <Col key={index} md={6} xs={12} style={{ marginBottom: 16 }}>
              <div className={styles.benefitItem}>
                <i className={`bi ${benefit.icon} ${styles.benefitIcon}`} />
                <div className={styles.benefitContent}>
                  <h5 className={styles.benefitTitle}>{benefit.text}</h5>
                  <p className={styles.benefitDescription}>{benefit.description}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Dashboard navigation button */}
      <Button className={styles.primaryBtn} onClick={() => navigate('/dashboard')}>
        <span>Go to Dashboard</span>
      </Button>
    </motion.div>
  );
};

export default SuccessStep;