// src/pages/TestAPI.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestAPI = () => {
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/hello/')
            .then(response => {
                setMessage(response.data.message);
            })
            .catch(error => {
                console.error('Error fetching the data: ', error);
            });
    }, []);

    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
};

export default TestAPI;
