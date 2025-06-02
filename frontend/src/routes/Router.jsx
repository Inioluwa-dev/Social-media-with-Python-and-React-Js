import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import CompleteProfile from '../pages/auth/CompleteProfile';
import Dashboard from '../pages/Dashboard';
import NotFound from '../components/NotFound';
import Profile from '../pages/Profile';
// import PrivateRoute from '@components/auth/ProtectedRoute';
import GuestRoute from '@components/auth/GuestRoute';
import { AuthProvider } from '../contexts/AuthContext';
import AccessDenied from '../components/AccessDenied';
import { Helmet } from 'react-helmet-async';
import Logout from '@components/auth/Logout';

function AppRouter() {

  const TitleRoute = ({ title, element }) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {element}
    </>
  );
};

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<TitleRoute title="Kefi | Login" element={<Login />} />} />
            <Route path="/signup" element={<TitleRoute title="Kefi | Signup" element={<Signup />} />} />
            <Route path="/forgot-password" element={<TitleRoute title="Kefi | Forgot Password" element={<ForgotPassword />} />} />
            <Route path="/" element={<TitleRoute title="Kefi | Login" element={<Login />} />} />
            <Route path="/logout" element={<TitleRoute title="Kefi | Logout" element={<Logout />} />} /> {/* Optional */}
          </Route>
          {/* <Route element={<PrivateRoute />}> */}
            <Route path="/complete-profile" element={<TitleRoute title="Kefi | Complete-Profile" element={< CompleteProfile/>} />} />
           <Route path="/dashboard" element={<TitleRoute title="Kefi | Dashboard" element={<Dashboard />} />} />
            <Route path="/profile" element={<TitleRoute title="Kefi | Profile" element={<Profile />} />} />
          {/* </Route> */}
          <Route path="/access-denied" element={<TitleRoute title="Kefi | Access-Denied" element={<AccessDenied/>} />} />
         <Route path="*" element={<TitleRoute title="Kefi | Not Found" element={<NotFound/>} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppRouter;