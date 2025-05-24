import React from 'react';
import { Form, Button } from 'react-bootstrap';
import OAuthButtons from './OAuthButtons';

const EmailStep = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <div className="step-content">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            autoFocus
          />
        </Form.Group>

        {error && <div className="text-danger mb-3">{error}</div>}

        <Button 
          type="submit"
          className="w-100 primary-btn"
          disabled={loading || !email}
        >
          {loading ? <Spinner size="sm" /> : 'Continue'}
        </Button>
      </Form>

      <div className="or-divider">OR</div>
      <div className="d-grid gap-2">
        <OAuthButtons />
      </div>
    </div>
  );
};

export default EmailStep;