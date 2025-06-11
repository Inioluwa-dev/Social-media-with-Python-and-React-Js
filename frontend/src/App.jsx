// src/App.jsx
import React from 'react';
import AppRouter from './routes/Router';  
import 'bootstrap/dist/css/bootstrap.min.css';
import '@styles/themes.css'
import "bootstrap-icons/font/bootstrap-icons.css";
import DarkModeToggle from './DarkModeToggle';
import { HelmetProvider } from 'react-helmet-async';
import 'react-loading-skeleton/dist/skeleton.css';



const App = () => {
    return (
        <div>
            <DarkModeToggle />

            <HelmetProvider>
                <AppRouter />
            </HelmetProvider>
        </div>

    );
};

export default App;

