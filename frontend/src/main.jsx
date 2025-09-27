// src/main.jsx (UPDATED)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// 1. Import BrowserRouter
import { BrowserRouter } from 'react-router-dom'; 
// 2. Import AuthProvider
import { AuthProvider } from './context/AuthContext'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrap the app with the Router */}
    <BrowserRouter>
      {/* Wrap the app with the Auth context provider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);