// Dashboard.jsx
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';

const Dashboard = () => {
  const { isAuthenticated, isVerified, user, verifyAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated || !isVerified) {
        navigate('/login', { 
          state: { from: '/dashboard' },
          replace: true 
        });
        return;
      }

      // Re-validate on dashboard load
      const isValid = await verifyAuth();
      if (!isValid) {
        navigate('/login', { 
          state: { 
            from: '/dashboard',
            error: 'Session expired. Please login again.' 
          },
          replace: true 
        });
      }

      if (!user?.is_profile_complete) {
        navigate('/complete-profile', { replace: true });
      }
    };

    checkAccess();
  }, [isAuthenticated, isVerified, user, verifyAuth, navigate]);

  if (!isAuthenticated || !isVerified || !user?.is_profile_complete) {
    return null; // Will be redirected automatically
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome to your Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
};

export default Dashboard;