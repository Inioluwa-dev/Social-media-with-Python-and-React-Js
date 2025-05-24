import React, { useState, useEffect } from 'react';

function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState(() => {
        // Retrieve the initial state from localStorage
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        // Apply the dark mode class based on the state
        if (darkMode) {
            document.body.classList.add('darkmode');
        } else {
            document.body.classList.remove('darkmode');
        }
        // Save the state to localStorage
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <button onClick={toggleDarkMode} style={{ position: 'fixed', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <i className={`bi ${darkMode ? 'bi-sun' : 'bi-moon'}`} style={{ fontSize: '24px', color: darkMode ? '#FFD700' : '#000' }}></i>
        </button>
    );
}

export default DarkModeToggle;