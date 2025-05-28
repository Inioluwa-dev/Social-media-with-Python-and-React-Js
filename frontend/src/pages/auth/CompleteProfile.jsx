// src/components/CompleteProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { completeSignup } from '@utils/authService';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    birth_date: '',
    gender: 'Male',
    is_student: false,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from previous step
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    } else if (location.search) {
      const params = new URLSearchParams(location.search);
      const email = params.get('email');
      if (email) setFormData((prev) => ({ ...prev, email }));
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.birth_date)) {
        throw new Error('Birth date must be in YYYY-MM-DD format');
      }
      
      // Additional date validation
      const date = new Date(formData.birth_date);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      const response = await completeSignup(formData);
      console.log('Signup success:', response);
      
      // Store tokens
      localStorage.setItem('access', response.access);
      localStorage.setItem('refresh', response.refresh);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err.response?.data || err);
      setErrors(err.response?.data || { message: err.message });
    }
  };

  // Helper function to display errors whether they're arrays or strings
  const displayError = (error) => {
    if (Array.isArray(error)) {
      return error.join(', ');
    }
    return error;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          readOnly // Email should be read-only as it comes from previous step
        />
        {errors.email && <p style={{ color: 'red' }}>{displayError(errors.email)}</p>}
      </div>
      <div>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        {errors.username && <p style={{ color: 'red' }}>{displayError(errors.username)}</p>}
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p style={{ color: 'red' }}>{displayError(errors.password)}</p>}
      </div>
      <div>
        <label>Full Name</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />
        {errors.full_name && <p style={{ color: 'red' }}>{displayError(errors.full_name)}</p>}
      </div>
      <div>
        <label>Birth Date</label>
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date}
          onChange={handleChange}
          required
        />
        {errors.birth_date && <p style={{ color: 'red' }}>{displayError(errors.birth_date)}</p>}
      </div>
      <div>
        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <p style={{ color: 'red' }}>{displayError(errors.gender)}</p>}
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            name="is_student"
            checked={formData.is_student}
            onChange={handleChange}
          />
          Is Student
        </label>
        {errors.is_student && <p style={{ color: 'red' }}>{displayError(errors.is_student)}</p>}
      </div>
      <button type="submit">Complete Signup</button>
      {errors.message && <p style={{ color: 'red' }}>{errors.message}</p>}
    </form>
  );
};

export default CompleteProfile;