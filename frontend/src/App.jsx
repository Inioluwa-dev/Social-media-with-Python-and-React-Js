// src/App.jsx
import React from 'react';
import AppRouter from './routes/Router';  
import 'bootstrap/dist/css/bootstrap.min.css';
import '@styles/themes.css'
import "bootstrap-icons/font/bootstrap-icons.css";



const App = () => {
    return (
        <div>
            <AppRouter />
            
        </div>

    );
};

export default App;

