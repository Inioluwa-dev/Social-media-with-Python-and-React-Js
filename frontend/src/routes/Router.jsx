import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";
import CompleteProfile from "../pages/auth/CompleteProfile";
import PrivateRoute from '@components/auth/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import Dashboard from "../pages/Dashboard";


function AppRouter() {
    return (
        <Router>

        
            <AuthProvider>
                <Routes>
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/complete-profile" element={<CompleteProfile />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>
                    <Route path="/" element={<Login />} />
                </Routes>
            </AuthProvider>
        </Router>
    ); 
};

export default AppRouter;

