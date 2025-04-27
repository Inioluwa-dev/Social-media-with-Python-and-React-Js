// src/App.jsx
import React from 'react';
import AppRouter from './Router';  // Import the updated Router.jsx
import Chat from './components/Chat'; // Import the Chat component

const App = () => {
    return (
        <div>
            <AppRouter />

            <h1>Welcome to the Chat App!</h1>
             <Chat /> {/* Render the Chat component */}
        </div>

    );
};

export default App;

