// src/router/AppRouter.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import CompleteProfile from '../pages/auth/CompleteProfile';
import Dashboard from '../pages/Dashboard';
import NotFound from '../components/NotFound';
import Profile from '../pages/Profile';

import PrivateRoute from '@components/auth/ProtectedRoute';
import GuestRoute from '@components/auth/GuestRoute';
import { AuthProvider } from '../contexts/AuthContext';

function AppRouter() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Guest-only routes */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Login />} />
          </Route>

          {/* Authenticated routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppRouter;
