// src/Router.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "../pages/auth/Login";
// import Signup from "./pages/Signup";
// import Profile from "./pages/Profile";

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                {/* <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} /> */}
            </Routes>
        </Router>
    );
};

export default AppRouter;
