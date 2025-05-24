import React from 'react';
import { Form, Button } from 'react-bootstrap';

const ProfileInfoStep = ({ onSubmit, onBack, loading, error }) => {
  const [profile, setProfile] = React.useState({
    firstName: '',
    lastName: '',
    nickname: '',
    birthDate: null,
    phone: '',
    gender: '',
    isStudent: false,
    isUniversity: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <div className="step-content">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={profile.firstName}
            onChange={handleChange}
            required
            className="form-input"
            autoFocus
          />
        </Form.Group>

        {/* Add other fields similarly */}

        {error && <div className="text-danger mb-3">{error}</div>}

        <div className="d-flex gap-3">
          <Button 
            variant="outline-secondary" 
            onClick={onBack}
            className="flex-grow-1 secondary-btn"
            disabled={loading}
          >
            Back
          </Button>
          <Button 
            type="submit"
            className="flex-grow-1 primary-btn"
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Next'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProfileInfoStep;