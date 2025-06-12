import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { updateProfile } from '@utils/authService';
import {
  FaUser,
  FaPhone,
  FaGlobe,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import styles from '@styles/auth/CompleteProfile.module.css';

const CompleteProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    country: '',
    state: '',
    is_university: false,
  });
  const [skippedFields, setSkippedFields] = useState(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    setFormData({
      nickname: '',
      phone: '',
      country: '',
      state: '',
      is_university: false,
    });
    setSkippedFields(new Set());

    return () => {
      setFormData({
        nickname: '',
        phone: '',
        country: '',
        state: '',
        is_university: false,
      });
      setSkippedFields(new Set());
    };
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSkippedFields((prev) => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  };

  const handleSkipField = (fieldName) => {
    setSkippedFields((prev) => new Set([...prev, fieldName]));
    setFormData((prev) => ({
      ...prev,
      [fieldName]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSubmit = Object.entries(formData).reduce((acc, [key, value]) => {
        if (!skippedFields.has(key) && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const updatedUser = await updateProfile({ ...dataToSubmit, profile_completed: true });

      if (updatedUser) {
        setUser({ ...user, ...updatedUser, profile_completed: true });
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAll = async () => {
    setLoading(true);
    setError(null);

    try {
      setFormData({
        nickname: '',
        phone: '',
        country: '',
        state: '',
        is_university: false,
      });
      setSkippedFields(new Set(['nickname', 'phone', 'country', 'state', 'is_university']));

      const updatedUser = await updateProfile({
        profile_completed: true,
        nickname: null,
        phone: null,
        country: null,
        state: null,
        is_university: false,
      });

      if (updatedUser) {
        setUser({ ...user, ...updatedUser, profile_completed: true });
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const renderField = (name, label, type = 'text', placeholder = '', Icon) => (
    <div className={styles.fieldContainer}>
      <div className={styles.fieldHeader}>
        <label htmlFor={name} className={styles.fieldLabel}>
          <Icon className="w-5 h-5" />
          {label} (Optional)
        </label>
        {!skippedFields.has(name) && (
          <button
            type="button"
            onClick={() => handleSkipField(name)}
            className={styles.skipButton}
          >
            <FaTimesCircle className="w-4 h-4" />
            Skip
          </button>
        )}
      </div>
      {skippedFields.has(name) ? (
        <div className={styles.skippedText}>
          <FaTimesCircle className="w-5 h-5" />
          This field has been skipped
        </div>
      ) : (
        <div className={styles.inputWrapper}>
          <Icon className={styles.inputIcon} />
          <input
            type={type}
            name={name}
            id={name}
            className={styles.input}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            aria-label={label}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Complete Your Profile</h2>
        <p className={styles.subtitle}>
          Tell us a bit more about yourself (all fields are optional)
        </p>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.profileSection}>
          <h3 className={styles.profileTitle}>Your Current Profile</h3>
          <div className={styles.profileGrid}>
            <div className={styles.profileItem}>
              <p className={styles.profileLabel}>
                <FaUser className="w-4 h-4" />
                Full Name
              </p>
              <p className={styles.profileValue}>{user.full_name}</p>
            </div>
            <div className={styles.profileItem}>
              <p className={styles.profileLabel}>
                <FaUser className="w-4 h-4" />
                Username
              </p>
              <p className={styles.profileValue}>{user.username}</p>
            </div>
            <div className={styles.profileItem}>
              <p className={styles.profileLabel}>
                <FaUser className="w-4 h-4" />
                Email
              </p>
              <p className={styles.profileValue}>{user.email}</p>
            </div>
            <div className={styles.profileItem}>
              <p className={styles.profileLabel}>
                <FaUser className="w-4 h-4" />
                Birth Date
              </p>
              <p className={styles.profileValue}>{user.birth_date}</p>
            </div>
            <div className={styles.profileItem}>
              <p className={styles.profileLabel}>
                <FaUser className="w-4 h-4" />
                Gender
              </p>
              <p className={styles.profileValue}>{user.gender}</p>
            </div>
            <div className={styles.profileItem}>
              <p className={styles.profileLabel}>
                <FaUser className="w-4 h-4" />
                Student Status
              </p>
              <p className={styles.profileValue}>
                {user.is_student ? 'Student' : 'Non-Student'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            <FaTimesCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {renderField('nickname', 'Nickname', 'text', 'What should we call you?', FaUser)}
          {renderField('phone', 'Phone Number', 'tel', 'Your phone number', FaPhone)}
          {renderField('country', 'Country', 'text', 'Your country', FaGlobe)}
          {renderField('state', 'State/Province', 'text', 'Your state or province', FaMapMarkerAlt)}

          {user.is_student && !skippedFields.has('is_university') && (
            <div className={styles.fieldContainer}>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  name="is_university"
                  id="is_university"
                  className={styles.checkbox}
                  checked={formData.is_university}
                  onChange={handleChange}
                  aria-label="University student status"
                />
                <label htmlFor="is_university" className={styles.fieldLabel}>
                  <FaGraduationCap className="w-5 h-5" />
                  I am a university student
                </label>
                <button
                  type="button"
                  onClick={() => handleSkipField('is_university')}
                  className={styles.skipButton}
                >
                  <FaTimesCircle className="w-4 h-4" />
                  Skip
                </button>
              </div>
            </div>
          )}

          {user.is_student && skippedFields.has('is_university') && (
            <div className={styles.skippedText}>
              <FaTimesCircle className="w-5 h-5" />
              University student status has been skipped
            </div>
          )}

          <div className={styles.buttonContainer}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
              aria-label="Save profile"
            >
              <FaCheckCircle className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Profile'}
            </button>

            <button
              type="button"
              onClick={handleSkipAll}
              disabled={loading}
              className={styles.skipAllButton}
              aria-label="Skip all fields"
            >
              <FaTimesCircle className="w-5 h-5" />
              {loading ? 'Saving...' : 'Skip All Fields'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;