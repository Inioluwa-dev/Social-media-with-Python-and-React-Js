// src/Router.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from "../pages/auth/Login";
import SignupPage from "../pages/auth/Signup";
// import Profile from "./pages/Profile";

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
            </Routes>
        </Router>
    ); 
};

export default AppRouter;
