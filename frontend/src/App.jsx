// src/App.jsx
import React from 'react';
import AppRouter from './routes/Router';  
import 'bootstrap/dist/css/bootstrap.min.css';
import '@styles/themes.css'
import "bootstrap-icons/font/bootstrap-icons.css";
import DarkModeToggle from './DarkModeToggle';


const App = () => {
    return (
        <div>
            <DarkModeToggle />
            <AppRouter />
            
        </div>

    );
};

export default App;

