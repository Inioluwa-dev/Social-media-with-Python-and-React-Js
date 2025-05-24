// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';
// import { AuthProvider } from './contexts/AuthContext';
// import { reportWebVitals } from 'web-vitals';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)



